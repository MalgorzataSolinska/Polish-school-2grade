import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Announcement, 
  DailyTask, 
  ClassSummary, 
  Worksheet, 
  StudentProfile, 
  FeedbackMessage, 
  ClassEvent 
} from './types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DAILY_TASKS,
  INITIAL_CLASS_SUMMARIES,
  INITIAL_WORKSHEETS,
  INITIAL_CLASS_EVENTS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_FEEDBACK_MESSAGES
} from './initialData';

export interface SchoolDatabaseState {
  announcements: Announcement[];
  dailyTasks: DailyTask[];
  classSummaries: ClassSummary[];
  worksheets: Worksheet[];
  classEvents: ClassEvent[];
  studentProfiles: StudentProfile[];
  feedbackMessages: FeedbackMessage[];
}

export const INITIAL_DATABASE_STATE: SchoolDatabaseState = {
  announcements: INITIAL_ANNOUNCEMENTS,
  dailyTasks: INITIAL_DAILY_TASKS,
  classSummaries: INITIAL_CLASS_SUMMARIES,
  worksheets: INITIAL_WORKSHEETS,
  classEvents: INITIAL_CLASS_EVENTS,
  studentProfiles: INITIAL_STUDENT_PROFILES,
  feedbackMessages: INITIAL_FEEDBACK_MESSAGES,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using configured database ID if specified
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Recursively strip undefined values and convert them for Firestore safety
function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (key, value) => (value === undefined ? null : value)));
}

const LOCAL_STORAGE_KEY = 'szkolka_cloud_data_cache_v3';

/**
 * Loads data from Firestore or local fallback
 */
export async function loadSchoolData(): Promise<SchoolDatabaseState> {
  try {
    const docRef = doc(db, 'school_data', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<SchoolDatabaseState>;
      const state: SchoolDatabaseState = {
        announcements: Array.isArray(data.announcements) ? data.announcements : INITIAL_DATABASE_STATE.announcements,
        dailyTasks: Array.isArray(data.dailyTasks) ? data.dailyTasks : INITIAL_DATABASE_STATE.dailyTasks,
        classSummaries: Array.isArray(data.classSummaries) ? data.classSummaries : INITIAL_DATABASE_STATE.classSummaries,
        worksheets: Array.isArray(data.worksheets) ? data.worksheets : INITIAL_DATABASE_STATE.worksheets,
        classEvents: Array.isArray(data.classEvents) ? data.classEvents : INITIAL_DATABASE_STATE.classEvents,
        studentProfiles: Array.isArray(data.studentProfiles) ? data.studentProfiles : INITIAL_DATABASE_STATE.studentProfiles,
        feedbackMessages: Array.isArray(data.feedbackMessages) ? data.feedbackMessages : INITIAL_DATABASE_STATE.feedbackMessages,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
      return state;
    } else {
      // First-time setup: write initial data to Firestore
      const cleanInitial = sanitizeForFirestore(INITIAL_DATABASE_STATE);
      await setDoc(docRef, cleanInitial);
      return INITIAL_DATABASE_STATE;
    }
  } catch (err) {
    console.warn('Firestore loadSchoolData fallback to local state:', err);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_DATABASE_STATE;
  }
}

/**
 * Saves entire state or partial collections to Firestore & localStorage
 */
export async function saveSchoolData(data: Partial<SchoolDatabaseState>): Promise<void> {
  // 1. Immediately cache in localStorage for instant offline/optimistic availability
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    const prev = cached ? JSON.parse(cached) : INITIAL_DATABASE_STATE;
    const merged = { ...prev, ...data };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Persist to Firestore with sanitized fields (NO undefined values allowed)
  try {
    const docRef = doc(db, 'school_data', 'main');
    const cleanData = sanitizeForFirestore(data);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('Firestore saveSchoolData error:', err);
  }
}

/**
 * Subscribes to real-time changes in the Firestore document
 */
export function subscribeToSchoolData(onUpdate: (data: SchoolDatabaseState) => void) {
  // First, provide cached data immediately if available
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      onUpdate(JSON.parse(cached));
    }
  } catch (e) {}

  const docRef = doc(db, 'school_data', 'main');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SchoolDatabaseState>;
        const updatedState: SchoolDatabaseState = {
          announcements: Array.isArray(data.announcements) ? data.announcements : INITIAL_DATABASE_STATE.announcements,
          dailyTasks: Array.isArray(data.dailyTasks) ? data.dailyTasks : INITIAL_DATABASE_STATE.dailyTasks,
          classSummaries: Array.isArray(data.classSummaries) ? data.classSummaries : INITIAL_DATABASE_STATE.classSummaries,
          worksheets: Array.isArray(data.worksheets) ? data.worksheets : INITIAL_DATABASE_STATE.worksheets,
          classEvents: Array.isArray(data.classEvents) ? data.classEvents : INITIAL_DATABASE_STATE.classEvents,
          studentProfiles: Array.isArray(data.studentProfiles) ? data.studentProfiles : INITIAL_DATABASE_STATE.studentProfiles,
          feedbackMessages: Array.isArray(data.feedbackMessages) ? data.feedbackMessages : INITIAL_DATABASE_STATE.feedbackMessages,
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedState));
        } catch (e) {}
        onUpdate(updatedState);
      } else {
        // Document does not exist yet; save initial
        const cleanInitial = sanitizeForFirestore(INITIAL_DATABASE_STATE);
        setDoc(docRef, cleanInitial).catch(console.error);
        onUpdate(INITIAL_DATABASE_STATE);
      }
    },
    (error) => {
      console.warn('Firestore subscription error (fallback active):', error);
    }
  );
}
