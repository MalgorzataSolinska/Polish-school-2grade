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

const DATA_DOC_PATH = 'school_data/main';

/**
 * Loads data from Firestore. If document does not exist yet, initializes with defaults.
 */
export async function loadSchoolData(): Promise<SchoolDatabaseState> {
  try {
    const docRef = doc(db, 'school_data', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<SchoolDatabaseState>;
      return {
        announcements: data.announcements || INITIAL_DATABASE_STATE.announcements,
        dailyTasks: data.dailyTasks || INITIAL_DATABASE_STATE.dailyTasks,
        classSummaries: data.classSummaries || INITIAL_DATABASE_STATE.classSummaries,
        worksheets: data.worksheets || INITIAL_DATABASE_STATE.worksheets,
        classEvents: data.classEvents || INITIAL_DATABASE_STATE.classEvents,
        studentProfiles: data.studentProfiles || INITIAL_DATABASE_STATE.studentProfiles,
        feedbackMessages: data.feedbackMessages || INITIAL_DATABASE_STATE.feedbackMessages,
      };
    } else {
      // First-time setup: write initial data to Firestore
      await setDoc(docRef, INITIAL_DATABASE_STATE);
      return INITIAL_DATABASE_STATE;
    }
  } catch (err) {
    console.warn('Firestore loadSchoolData fallback to local state:', err);
    return INITIAL_DATABASE_STATE;
  }
}

/**
 * Saves entire state or partial collections to Firestore
 */
export async function saveSchoolData(data: Partial<SchoolDatabaseState>): Promise<void> {
  const docRef = doc(db, 'school_data', 'main');
  await setDoc(docRef, data, { merge: true });
}

/**
 * Subscribes to real-time changes in the Firestore document
 */
export function subscribeToSchoolData(onUpdate: (data: SchoolDatabaseState) => void) {
  const docRef = doc(db, 'school_data', 'main');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<SchoolDatabaseState>;
      onUpdate({
        announcements: data.announcements || INITIAL_DATABASE_STATE.announcements,
        dailyTasks: data.dailyTasks || INITIAL_DATABASE_STATE.dailyTasks,
        classSummaries: data.classSummaries || INITIAL_DATABASE_STATE.classSummaries,
        worksheets: data.worksheets || INITIAL_DATABASE_STATE.worksheets,
        classEvents: data.classEvents || INITIAL_DATABASE_STATE.classEvents,
        studentProfiles: data.studentProfiles || INITIAL_DATABASE_STATE.studentProfiles,
        feedbackMessages: data.feedbackMessages || INITIAL_DATABASE_STATE.feedbackMessages,
      });
    } else {
      // Document does not exist yet; save initial
      setDoc(docRef, INITIAL_DATABASE_STATE).catch(console.error);
      onUpdate(INITIAL_DATABASE_STATE);
    }
  }, (error) => {
    console.warn('Firestore subscription error (using fallback):', error);
  });
}
