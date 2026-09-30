import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentFeedback, FeedbackCategory } from '../types';

const STORAGE_KEY_FEEDBACKS = '@attendance_monitor_student_feedbacks';

const INITIAL_FEEDBACKS: StudentFeedback[] = [
  {
    id: 'fb_1',
    studentName: 'Anonymous Student',
    studentRollNo: 'Hidden',
    batch: 'B',
    isAnonymous: true,
    category: 'FEATURE',
    rating: 5,
    message: 'Love the hourly period tracker and Safe Bunk calculator! Can we also get a GPA / CGPA projection tool for Semester 1 internals?',
    createdAt: '2026-09-27T10:15:00.000Z',
    status: 'NEW',
  },
  {
    id: 'fb_2',
    studentName: 'Mithun K',
    studentRollNo: '26AA27',
    batch: 'A',
    isAnonymous: false,
    category: 'SCHEDULE',
    rating: 4,
    message: 'On Friday, Period 3 (Business Analytics) has been shifted to LH-104 instead of LH-102 due to computer lab session.',
    createdAt: '2026-09-26T14:30:00.000Z',
    status: 'REVIEWED',
  },
  {
    id: 'fb_3',
    studentName: 'Anonymous Student',
    studentRollNo: 'Hidden',
    batch: 'C',
    isAnonymous: true,
    category: 'BUG',
    rating: 4,
    message: 'The holiday notification for Miladi Nabi worked perfectly, but could you add a vibration when an alert fires so I don\'t miss it?',
    createdAt: '2026-09-25T09:45:00.000Z',
    status: 'RESOLVED',
  },
  {
    id: 'fb_4',
    studentName: 'Pooja R',
    studentRollNo: '26AA33',
    batch: 'A',
    isAnonymous: false,
    category: 'GENERAL',
    rating: 5,
    message: 'The medical 65% claim tracker is a lifesaver. Saved me from being debarred when I had dengue fever.',
    createdAt: '2026-09-24T16:20:00.000Z',
    status: 'RESOLVED',
  },
];

import { CloudSyncService } from './cloudSyncService';

export const FeedbackService = {
  /**
   * Retrieves all student feedback submissions sorted newest first.
   */
  async getAllFeedbacks(): Promise<StudentFeedback[]> {
    try {
      // 1. Fetch cloud feedbacks from Firebase
      const cloudList = await CloudSyncService.fetchCloudFeedback();
      if (cloudList && cloudList.length > 0) {
        return cloudList;
      }

      // 2. Fallback to local storage if offline
      const data = await AsyncStorage.getItem(STORAGE_KEY_FEEDBACKS);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(INITIAL_FEEDBACKS));
        return INITIAL_FEEDBACKS;
      }
      const parsed = JSON.parse(data) as StudentFeedback[];
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.warn('Error reading feedbacks:', e);
      return INITIAL_FEEDBACKS;
    }
  },

  /**
   * Submits a new feedback or improvement suggestion from a student.
   */
  async submitFeedback(
    entry: Omit<StudentFeedback, 'id' | 'createdAt' | 'status'>
  ): Promise<StudentFeedback> {
    const feedbacks = await this.getAllFeedbacks();
    const newFeedback: StudentFeedback = {
      ...entry,
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      studentName: entry.isAnonymous ? 'Anonymous Student' : entry.studentName,
      studentRollNo: entry.isAnonymous ? 'Hidden' : entry.studentRollNo,
    };

    const updated = [newFeedback, ...feedbacks];
    await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updated));

    // Sync to Firestore in the background
    CloudSyncService.syncFeedback(newFeedback).catch((err) => {
      console.warn('Firebase feedback sync warning:', err);
    });

    return newFeedback;
  },

  /**
   * Updates the workflow status of a feedback item (e.g. from NEW -> REVIEWED -> RESOLVED).
   */
  async updateFeedbackStatus(id: string, status: 'NEW' | 'REVIEWED' | 'RESOLVED'): Promise<void> {
    const feedbacks = await this.getAllFeedbacks();
    const updated = feedbacks.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(updated));
  },

  /**
   * Deletes a feedback item by ID.
   */
  async deleteFeedback(id: string): Promise<void> {
    const feedbacks = await this.getAllFeedbacks();
    const filtered = feedbacks.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(filtered));
  },
};
