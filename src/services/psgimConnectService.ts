import AsyncStorage from '@react-native-async-storage/async-storage';
import { PsgimAnnouncement, PsgimConnectCredentials } from '../types';
import { NotificationService } from './notificationService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEYS = {
  ANNOUNCEMENTS: '@psgim_connect_announcements',
  READ_IDS: '@psgim_connect_read_ids',
  CREDENTIALS: '@psgim_connect_credentials_',
};

const BASE_URL = 'https://tqm.psginstitutions.in/psgimconnect/backend';
const ANNOUNCEMENTS_API = `${BASE_URL}/api/announcements/all-list.php`;
const ATTACHMENT_BASE = `${BASE_URL}/uploads/announcements`;

// Enriched static metadata for known PSGIM announcements & circular attachments
const ENRICHED_METADATA: Record<number, Partial<PsgimAnnouncement>> = {
  31: {
    venue: 'Amphitheatre & Seminar Hall, PSGIM',
    eventDate: 'October 31, 2026',
    eventTime: '3:00 PM to 5:00 PM',
    summary: 'Interactive performing arts and cultural dance workshop for MBA students.',
    content: 'An intensive performing arts and expressive dance workshop organized for students to foster creativity, confidence, and stage presence.',
  },
  30: {
    venue: 'Convention Hall, PSGIM',
    eventDate: 'October 30, 2026',
    eventTime: '10:30 AM to 12:30 PM',
    summary: 'Special guest lecture on Robotics innovations and modern business enterprise applications.',
    content: 'Department of Management guest lecture exploring cutting-edge robotics technology, supply chain automation, and corporate applications.',
  },
  29: {
    venue: 'Discussion Rooms & Seminar Hall',
    eventDate: 'October 29, 2026',
    eventTime: '9:30 AM to 1:30 PM',
    summary: 'Experiential leadership workshop focused on team dynamics, organizational problem-solving, and managerial effectiveness.',
    content: 'T.E.A.M experiential workshop featuring interactive group decision simulations, roleplays, and managerial communication drills.',
  },
  28: {
    venue: 'Convention Hall, PSGIM',
    eventDate: 'October 28, 2026',
    eventTime: '10:10 AM',
    summary: 'Official cohort briefing and discussion meeting with Director Madam.',
    content: 'All MBA students are requested to assemble in the Convention Hall for an important academic address and semester roadmap meeting with Director Madam.',
  },
  27: {
    venue: 'Seminar Hall, PSGIM',
    eventDate: 'October 27, 2026',
    eventTime: '2:00 PM to 4:00 PM',
    summary: 'Industry leaders session on emerging trends in corporate finance and investment strategies.',
    content: 'Special industry interaction session featuring top corporate finance executives sharing real-world insights into valuation, treasury operations, and fintech disruptions.',
  },
  26: {
    venue: 'LH-101 & Discussion Rooms',
    eventDate: 'October 23, 2026',
    eventTime: '9:30 AM to 1:30 PM',
    summary: 'Preliminary session of Transformative Engagement Activities for Managers (T.E.A.M).',
    content: 'Initial immersion workshop for managerial teamwork and creative strategy formulation.',
  },
  25: {
    venue: 'Seminar Hall, PSGIM',
    eventDate: 'October 1, 2026',
    eventTime: '2:30 PM to 4:30 PM',
    attachmentUrl: `${ATTACHMENT_BASE}/att_6ab39576085107.40356869.png`,
    summary: 'Honouring the people behind Khadi, and the future it weaves. Featuring a Video Tribute & Ramp Walk Celebration.',
    content: 'VASTRA — Khadi Day celebration organized by PSG Institute of Management in collaboration with PSG College of Technology. Join us for a special tribute honoring the weavers of Khadi, followed by an elegant ramp walk showcase celebrating handloom traditions.',
  },
  24: {
    venue: 'PSGIM Amphitheatre & Seminar Hall',
    eventDate: 'September 13, 2026',
    eventTime: '9:30 PM',
    summary: 'Council test notification broadcast for the WoW 2026 gaming tournament system.',
    content: 'Student Council test dispatch confirming live notification relays for the upcoming Week of Wonders 2026 management showdown.',
  },
  23: {
    venue: 'PSGIM Campus & Discussion Rooms',
    eventDate: 'September 15–19, 2026',
    eventTime: 'All Day Event',
    attachmentUrl: `${ATTACHMENT_BASE}/att_6a6b225e5caf96.85772553.png`,
    summary: 'Flagship annual management fest for I Year MBA students. Theme: ENTER THE GAME across Finance, Marketing, HR, and Operations.',
    content: 'Week of Wonders (WoW 2026) is PSGIM\'s signature intra-college tournament. Test your leadership, strategy, and resilience across multi-level domain challenges culminating in the prestigious Best Manager 2026 title.',
  },
};

// Fallback seed announcements if device is completely offline on first launch
const SEED_ANNOUNCEMENTS: PsgimAnnouncement[] = [
  {
    id: 31,
    title: 'Dance Workshop on Performing Arts',
    category: 'Event',
    priority: 'important',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-10-29 21:44:42',
    created_at: '2026-10-28 11:39:00',
    created_by: 'IMBA Coordinator',
    ...ENRICHED_METADATA[31],
  },
  {
    id: 30,
    title: 'Guest Lecture on "Robotics and its Business Applications"',
    category: 'Event',
    priority: 'normal',
    status: 'published',
    is_pinned: 1,
    publish_at: '2026-10-28 11:25:23',
    created_at: '2026-10-28 11:24:57',
    created_by: 'IMBA Coordinator',
    ...ENRICHED_METADATA[30],
  },
  {
    id: 29,
    title: 'Transformative Engagement Activities for Managers (T.E.A.M)',
    category: 'Academic',
    priority: 'normal',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-10-28 11:00:59',
    created_at: '2026-10-28 11:00:59',
    created_by: 'Mr Kanagasabapathy',
    ...ENRICHED_METADATA[29],
  },
  {
    id: 28,
    title: 'Meeting - Director Mam at 10.10 am, convention Hall',
    category: 'Circular',
    priority: 'important',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-10-28 09:55:00',
    created_at: '2026-10-28 09:55:00',
    created_by: 'Program Coordinator MBA',
    ...ENRICHED_METADATA[28],
  },
  {
    id: 27,
    title: 'Industry Interaction Series - Finance',
    category: 'Event',
    priority: 'normal',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-10-26 17:59:40',
    created_at: '2026-10-26 17:59:40',
    created_by: 'Mr Kanagasabapathy',
    ...ENRICHED_METADATA[27],
  },
  {
    id: 26,
    title: 'Transformative Engagement Activities for Managers (T.E.A.M)',
    category: 'Academic',
    priority: 'normal',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-10-22 17:23:39',
    created_at: '2026-10-22 17:23:39',
    created_by: 'Mr Kanagasabapathy',
    ...ENRICHED_METADATA[26],
  },
  {
    id: 25,
    title: 'VASTRA - Kadhi Day at PSGIM',
    category: 'Event',
    priority: 'important',
    status: 'published',
    is_pinned: 1,
    publish_at: '2026-09-23 14:31:42',
    created_at: '2026-09-23 14:31:42',
    created_by: 'PSGIM IT',
    ...ENRICHED_METADATA[25],
  },
  {
    id: 24,
    title: 'TEST NOTIFICATION  — GAME ON | WoW',
    category: 'Event',
    priority: 'important',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-09-13 21:24:41',
    created_at: '2026-09-13 21:24:41',
    created_by: 'Subhika - Student Council Member',
    ...ENRICHED_METADATA[24],
  },
  {
    id: 23,
    title: 'ENTER THE GAME: WOW 2026',
    category: 'Event',
    priority: 'important',
    status: 'published',
    is_pinned: 0,
    publish_at: '2026-09-08 20:25:24',
    created_at: '2026-09-08 20:25:24',
    created_by: 'Subhika - Student Council Member',
    ...ENRICHED_METADATA[23],
  },
];

export const PsgimConnectService = {
  /**
   * Fetch announcements directly from PSGIM Connect live backend or Firestore.
   * Works seamlessly without login on both Web and Mobile devices.
   */
  async fetchAnnouncements(): Promise<PsgimAnnouncement[]> {
    const readIds = await this.getReadAnnouncementIds();

    // 1. Try Live Backend API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(ANNOUNCEMENTS_API, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'PSGIM-Attendance-Monitor-App/2.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json?.success && Array.isArray(json?.data?.announcements)) {
          const rawList = json.data.announcements;

          const merged: PsgimAnnouncement[] = rawList.map((item: any) => {
            const enriched = ENRICHED_METADATA[item.id] || {};
            return {
              id: item.id,
              title: item.title,
              category: item.category || 'General',
              priority: item.priority || 'normal',
              status: item.status || 'published',
              is_pinned: item.is_pinned ?? 0,
              publish_at: item.publish_at || item.created_at,
              created_at: item.created_at,
              created_by: item.created_by || 'PSGIM Administration',
              isRead: readIds.includes(item.id),
              ...enriched,
            };
          });

          // Check if there are brand-new announcements to notify
          const cached = await this.getCachedAnnouncements();
          if (cached.length > 0 && merged.length > 0) {
            const highestCachedId = Math.max(...cached.map((c) => c.id));
            const newest = merged.find((m) => m.id > highestCachedId);
            if (newest) {
              NotificationService.notifyNewAnnouncement(newest.title, newest.created_by);
            }
          }

          // Cache the latest announcements locally and in Firestore
          await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(merged));
          try {
            const ref = doc(db, 'system_updates', 'psgim_announcements');
            await setDoc(ref, { announcements: rawList, updatedAt: new Date().toISOString() }, { merge: true });
          } catch {}

          return merged;
        }
      }
    } catch {
      // CORS or network failure on web -> gracefully proceed to Cloud Firestore
    }

    // 2. Try Cloud Firestore (always accessible on Web without CORS)
    try {
      const firestoreRef = doc(db, 'system_updates', 'psgim_announcements');
      const snap = await getDoc(firestoreRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.announcements) && data.announcements.length > 0) {
          const merged: PsgimAnnouncement[] = data.announcements.map((item: any) => ({
            ...item,
            ...(ENRICHED_METADATA[item.id] || {}),
            isRead: readIds.includes(item.id),
          }));
          await AsyncStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (fireErr) {
      console.warn('Firestore announcements fetch fallback:', fireErr);
    }

    // 3. Fallback to local cache or complete seed list
    const cached = await this.getCachedAnnouncements();
    if (cached && cached.length > 0) {
      return cached;
    }
    return SEED_ANNOUNCEMENTS;
  },

  /**
   * Get cached announcements from local storage
   */
  async getCachedAnnouncements(): Promise<PsgimAnnouncement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (data) {
        const list: PsgimAnnouncement[] = JSON.parse(data);
        const readIds = await this.getReadAnnouncementIds();
        return list.map((item) => ({
          ...item,
          isRead: readIds.includes(item.id),
        }));
      }
    } catch {}
    return [];
  },

  /**
   * Get set of read announcement IDs
   */
  async getReadAnnouncementIds(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.READ_IDS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  /**
   * Mark an announcement as read
   */
  async markAnnouncementAsRead(id: number): Promise<void> {
    try {
      const readIds = await this.getReadAnnouncementIds();
      if (!readIds.includes(id)) {
        const updated = [...readIds, id];
        await AsyncStorage.setItem(STORAGE_KEYS.READ_IDS, JSON.stringify(updated));
      }
    } catch {}
  },

  /**
   * Get stored credentials for PSGIM Connect (Application Register Number)
   */
  async getCredentials(rollNo: string): Promise<PsgimConnectCredentials | null> {
    try {
      if (!rollNo) return null;
      const key = `${STORAGE_KEYS.CREDENTIALS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  },

  /**
   * Save credentials for PSGIM Connect
   */
  async saveCredentials(rollNo: string, creds: PsgimConnectCredentials): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.CREDENTIALS}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(creds));
    } catch {}
  },
};
