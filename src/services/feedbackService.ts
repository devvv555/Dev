import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentFeedback, FeedbackCategory } from '../types';

const STORAGE_KEY_FEEDBACKS = '@attendance_monitor_student_feedbacks';

const INITIAL_FEEDBACKS: StudentFeedback[] = [];
const LEGACY_MOCK_IDS = new Set(['fb_1', 'fb_2', 'fb_3', 'fb_4']);

import { CloudSyncService } from './cloudSyncService';
import { getMasterStudent } from '../data/psgimMasterStudents';
import { StudzoneService } from './studzoneService';

export const ADMIN_FEEDBACK_EMAIL = 'devdarshanv2005@gmail.com';

/**
 * Sends feedback notification directly to the admin email (devdarshanv2005@gmail.com)
 * via Formspree public mail delivery gateway. Non-blocking & offline safe.
 */
async function sendFeedbackEmail(feedback: {
  rollNo: string;
  name: string;
  dob: string;
  batch: string;
  category: string;
  rating: number;
  message: string;
  isAnonymous: boolean;
  submittedAt: string;
}): Promise<void> {
  try {
    const payload = {
      _to: ADMIN_FEEDBACK_EMAIL,
      subject: `[Attendance App Feedback] ${feedback.rollNo} (Batch ${feedback.batch}) - ${feedback.category}`,
      rollNo: feedback.rollNo,
      dateOfBirth: feedback.dob || 'Not Provided / Not in DB',
      studentName: feedback.name,
      batch: feedback.batch,
      category: feedback.category,
      rating: `${feedback.rating} / 5`,
      feedbackMessage: feedback.message,
      anonymousToPeers: feedback.isAnonymous ? 'Yes' : 'No',
      submittedAt: feedback.submittedAt,
    };

    // Use formspree forwarding endpoint
    const response = await fetch(`https://formspree.io/f/xovkllqq`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log('[FeedbackService] Email dispatch status:', response.status);
    }
  } catch (error) {
    console.warn('[FeedbackService] Email dispatch warning (offline or network):', error);
  }
}

export const FeedbackService = {
  /**
   * Retrieves all student feedback submissions sorted newest first.
   */
  async getAllFeedbacks(): Promise<StudentFeedback[]> {
    try {
      // 1. First retrieve local cache for instant resilience
      const localData = await AsyncStorage.getItem(STORAGE_KEY_FEEDBACKS);
      let localFeedbacks: StudentFeedback[] = localData ? JSON.parse(localData) : [];
      // Strip any legacy mock feedback items
      localFeedbacks = localFeedbacks.filter((f) => !LEGACY_MOCK_IDS.has(f.id));

      // 2. Fetch cloud feedbacks with 3-second timeout so it never hangs
      const cloudListPromise = CloudSyncService.fetchCloudFeedback();
      const timeoutPromise = new Promise<StudentFeedback[]>((resolve) => setTimeout(() => resolve([]), 3000));
      const rawCloudList = await Promise.race([cloudListPromise, timeoutPromise]);
      const cloudList = (rawCloudList || []).filter((f) => !LEGACY_MOCK_IDS.has(f.id));

      if (cloudList && cloudList.length > 0) {
        // Merge without duplicates
        const map = new Map<string, StudentFeedback>();
        [...cloudList, ...localFeedbacks].forEach((f) => map.set(f.id, f));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return localFeedbacks.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (e) {
      console.warn('Error reading feedbacks:', e);
      return [];
    }
  },

  /**
   * Submits a new feedback or improvement suggestion from a student.
   * Ensures the student's Roll No and Date of Birth (DOB) are captured and
   * delivered to devdarshanv2005@gmail.com and synced to Firestore.
   */
  async submitFeedback(
    entry: Omit<StudentFeedback, 'id' | 'createdAt' | 'status'>
  ): Promise<StudentFeedback> {
    // Read local cache first to ensure immediate responsiveness
    let existingFeedbacks: StudentFeedback[] = [];
    try {
      const localData = await AsyncStorage.getItem(STORAGE_KEY_FEEDBACKS);
      if (localData) {
        existingFeedbacks = (JSON.parse(localData) as StudentFeedback[]).filter(
          (f) => !LEGACY_MOCK_IDS.has(f.id)
        );
      }
    } catch (e) {
      console.warn('[FeedbackService] Error reading existing local feedbacks:', e);
    }

    // Resolve student's real Roll No and DOB
    const realRollNo = entry.studentRollNo || '';
    let realDob = entry.studentDob || '';
    let realName = entry.studentName || '';

    // 1. Resolve master info from master students directory
    const masterInfo = realRollNo ? getMasterStudent(realRollNo) : null;
    if (masterInfo) {
      if (!realName || realName === 'Student' || realName === 'Anonymous Student') {
        realName = masterInfo.name;
      }
      if (!realDob) {
        if (masterInfo.dob) {
          realDob = masterInfo.dob;
        } else if (masterInfo.dobPassword) {
          const p = masterInfo.dobPassword;
          if (p.length === 8) {
            realDob = `${p.slice(0, 2)}/${p.slice(2, 4)}/${p.slice(4)}`;
          } else {
            realDob = p;
          }
        }
      }
    }

    // 2. Try resolving from saved Studzone credentials if still empty
    if (!realDob) {
      try {
        const savedCreds = await StudzoneService.getSavedCredentials();
        if (savedCreds?.dobPassword) {
          const p = savedCreds.dobPassword;
          if (p.length === 8) {
            realDob = `${p.slice(0, 2)}/${p.slice(2, 4)}/${p.slice(4)}`;
          } else {
            realDob = p;
          }
        }
      } catch {
        // ignore
      }
    }

    const newFeedback: StudentFeedback = {
      ...entry,
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      studentName: realName || entry.studentName,
      studentRollNo: realRollNo,
      studentDob: realDob,
    };

    const updated = [newFeedback, ...existingFeedbacks];
    try {
      await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updated));
    } catch (err) {
      console.warn('[FeedbackService] Error saving to AsyncStorage:', err);
    }

    // 1. Sync to Firestore completely asynchronously
    try {
      CloudSyncService.syncFeedback(newFeedback).catch((err) => {
        console.warn('[FeedbackService] Firebase feedback sync warning:', err);
      });
    } catch (err) {
      console.warn('[FeedbackService] Firebase feedback invocation failed:', err);
    }

    // 2. Dispatch email to devdarshanv2005@gmail.com with Roll No and DOB
    try {
      sendFeedbackEmail({
        rollNo: realRollNo,
        name: realName || entry.studentName,
        dob: realDob,
        batch: entry.batch,
        category: entry.category,
        rating: entry.rating,
        message: entry.message,
        isAnonymous: entry.isAnonymous,
        submittedAt: newFeedback.createdAt,
      }).catch((err) => {
        console.warn('[FeedbackService] Email dispatch warning:', err);
      });
    } catch (err) {
      console.warn('[FeedbackService] Email dispatch invocation failed:', err);
    }

    return newFeedback;
  },

  /**
   * Updates the workflow status of a feedback item (e.g. from NEW -> REVIEWED -> RESOLVED).
   */
  async updateFeedbackStatus(id: string, status: 'NEW' | 'REVIEWED' | 'RESOLVED'): Promise<void> {
    const feedbacks = await this.getAllFeedbacks();
    let updatedItem: StudentFeedback | undefined;
    const updated = feedbacks.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, status };
        return updatedItem;
      }
      return item;
    });
    await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updated));
    if (updatedItem) {
      CloudSyncService.syncFeedback(updatedItem).catch(() => {});
    }
  },

  /**
   * Sends an admin reply to a feedback item and marks it as REVIEWED / RESOLVED.
   */
  async replyToFeedback(id: string, replyText: string, markResolved = false): Promise<void> {
    const feedbacks = await this.getAllFeedbacks();
    let updatedItem: StudentFeedback | undefined;
    const nowIso = new Date().toISOString();
    const updated = feedbacks.map((item) => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          adminReply: replyText.trim(),
          repliedAt: nowIso,
          status: (markResolved ? 'RESOLVED' : 'REVIEWED') as 'NEW' | 'REVIEWED' | 'RESOLVED',
        };
        return updatedItem;
      }
      return item;
    });
    await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updated));
    if (updatedItem) {
      CloudSyncService.syncFeedback(updatedItem).catch(() => {});
    }
  },

  /**
   * Deletes a feedback item by ID locally and from Cloud Firestore.
   */
  async deleteFeedback(id: string): Promise<void> {
    try {
      const feedbacks = await this.getAllFeedbacks();
      const filtered = feedbacks.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[FeedbackService] Error deleting local feedback item:', e);
    }
    try {
      await CloudSyncService.deleteCloudFeedback(id);
    } catch (e) {
      console.warn('[FeedbackService] Error deleting cloud feedback item:', e);
    }
  },

  /**
   * Clears all feedback entries from both local storage and Cloud Firestore.
   */
  async clearAllFeedbacks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_FEEDBACKS);
    } catch (e) {
      console.warn('[FeedbackService] Error clearing local feedbacks:', e);
    }
    try {
      await CloudSyncService.deleteAllCloudFeedbacks();
    } catch (e) {
      console.warn('[FeedbackService] Error deleting cloud feedbacks:', e);
    }
  },
};
