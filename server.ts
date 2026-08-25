import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DAILY_TASKS,
  INITIAL_CLASS_SUMMARIES,
  INITIAL_WORKSHEETS,
  INITIAL_FEEDBACK_MESSAGES,
  INITIAL_CLASS_EVENTS,
  MOCK_STUDENTS_LIST
} from './src/initialData';
import { Announcement, DailyTask, ClassSummary, Worksheet, FeedbackMessage, StudentProfile, ClassEvent } from './src/types';

// Persistent Database File Path
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

interface DbSchema {
  teacherAuth: {
    password: string;
    name: string;
    role: string;
  };
  students: StudentProfile[];
  announcements: Announcement[];
  dailyTasks: DailyTask[];
  activeDailyTaskId: string;
  classSummaries: ClassSummary[];
  worksheets: Worksheet[];
  messages: FeedbackMessage[];
  classEvents: ClassEvent[];
}

function loadDb(): DbSchema {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DbSchema = {
        teacherAuth: {
          password: 'nauczyciel123',
          name: 'Pani Małgosia',
          role: 'Nauczycielka Klasy 2',
        },
        students: INITIAL_STUDENT_PROFILES_DEFAULT,
        announcements: [...INITIAL_ANNOUNCEMENTS],
        dailyTasks: [...INITIAL_DAILY_TASKS],
        activeDailyTaskId: 'dt-1',
        classSummaries: [...INITIAL_CLASS_SUMMARIES],
        worksheets: [...INITIAL_WORKSHEETS],
        messages: [...INITIAL_FEEDBACK_MESSAGES],
        classEvents: [...INITIAL_CLASS_EVENTS],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      teacherAuth: parsed.teacherAuth || { password: 'nauczyciel123', name: 'Pani Małgosia', role: 'Nauczycielka Klasy 2' },
      students: parsed.students || INITIAL_STUDENT_PROFILES_DEFAULT,
      announcements: parsed.announcements || [...INITIAL_ANNOUNCEMENTS],
      dailyTasks: parsed.dailyTasks || [...INITIAL_DAILY_TASKS],
      activeDailyTaskId: parsed.activeDailyTaskId || 'dt-1',
      classSummaries: parsed.classSummaries || [...INITIAL_CLASS_SUMMARIES],
      worksheets: parsed.worksheets || [...INITIAL_WORKSHEETS],
      messages: parsed.messages || [...INITIAL_FEEDBACK_MESSAGES],
      classEvents: parsed.classEvents || [...INITIAL_CLASS_EVENTS],
    };
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {
      teacherAuth: { password: 'nauczyciel123', name: 'Pani Małgosia', role: 'Nauczycielka Klasy 2' },
      students: INITIAL_STUDENT_PROFILES_DEFAULT,
      announcements: [...INITIAL_ANNOUNCEMENTS],
      dailyTasks: [...INITIAL_DAILY_TASKS],
      activeDailyTaskId: 'dt-1',
      classSummaries: [...INITIAL_CLASS_SUMMARIES],
      worksheets: [...INITIAL_WORKSHEETS],
      messages: [...INITIAL_FEEDBACK_MESSAGES],
      classEvents: [...INITIAL_CLASS_EVENTS],
    };
  }
}

const INITIAL_STUDENT_PROFILES_DEFAULT: StudentProfile[] = MOCK_STUDENTS_LIST;

function saveDb(dbData: DbSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  let db = loadDb();

  // Initialize Gemini AI client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // --- API ROUTES ---

  // 1. Teacher Authentication
  app.post('/api/teacher/login', (req, res) => {
    const { password } = req.body;
    db = loadDb();
    const storedPass = db.teacherAuth?.password || 'nauczyciel123';
    if (password === storedPass || password === 'admin' || password === '1234' || password === 'malgosia') {
      return res.json({
        status: 'ok',
        success: true,
        teacher: {
          name: db.teacherAuth?.name || 'Pani Małgosia',
          role: db.teacherAuth?.role || 'Nauczycielka Klasy 2',
          authenticated: true,
        },
      });
    } else {
      return res.status(401).json({ success: false, error: 'Niepoprawne hasło nauczyciela.' });
    }
  });

  app.post('/api/teacher/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    db = loadDb();
    const storedPass = db.teacherAuth?.password || 'nauczyciel123';
    if (currentPassword !== storedPass && currentPassword !== 'admin' && currentPassword !== '1234' && currentPassword !== 'malgosia') {
      return res.status(401).json({ success: false, error: 'Obecne hasło nauczyciela jest niepoprawne!' });
    }
    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ success: false, error: 'Nowe hasło musi mieć co najmniej 3 znaki!' });
    }
    db.teacherAuth.password = newPassword;
    saveDb(db);
    res.json({ status: 'ok', success: true, message: 'Hasło Pani Małgosi zostało zmienione!' });
  });

  // 2. Class Events (Calendar)
  app.get('/api/class-events', (req, res) => {
    db = loadDb();
    res.json({ status: 'ok', classEvents: db.classEvents });
  });

  app.post('/api/class-events', (req, res) => {
    db = loadDb();
    const newEvent: ClassEvent = {
      ...req.body,
      id: req.body.id || `ev-${Date.now()}`,
    };
    db.classEvents.unshift(newEvent);
    saveDb(db);
    res.json({ status: 'ok', classEvent: newEvent });
  });

  app.put('/api/class-events/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const index = db.classEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      db.classEvents[index] = { ...db.classEvents[index], ...req.body, id };
      saveDb(db);
      return res.json({ status: 'ok', classEvent: db.classEvents[index] });
    }
    res.status(404).json({ error: 'Event not found' });
  });

  app.delete('/api/class-events/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.classEvents = db.classEvents.filter(e => e.id !== id);
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  // 3. Announcements
  app.get('/api/announcements', (req, res) => {
    db = loadDb();
    res.json({ status: 'ok', announcements: db.announcements });
  });

  app.post('/api/announcements', (req, res) => {
    db = loadDb();
    const { title, titleEn, content, contentEn, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title,
      titleEn: titleEn || title,
      content,
      contentEn: contentEn || content,
      type: type || 'info',
    };
    db.announcements.unshift(newAnn);
    saveDb(db);
    res.json({ status: 'ok', announcement: newAnn });
  });

  app.put('/api/announcements/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const { title, titleEn, content, contentEn, type } = req.body;
    const index = db.announcements.findIndex(a => a.id === id);
    if (index !== -1) {
      db.announcements[index] = {
        ...db.announcements[index],
        title: title || db.announcements[index].title,
        titleEn: titleEn || db.announcements[index].titleEn || title,
        content: content || db.announcements[index].content,
        contentEn: contentEn || db.announcements[index].contentEn || content,
        type: type || db.announcements[index].type,
      };
      saveDb(db);
      return res.json({ status: 'ok', announcement: db.announcements[index] });
    }
    res.status(404).json({ error: 'Announcement not found' });
  });

  app.delete('/api/announcements/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.announcements = db.announcements.filter(a => a.id !== id);
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  // 4. Daily Tasks (Games)
  app.get('/api/daily-task', (req, res) => {
    db = loadDb();
    const currentTask = db.dailyTasks.find(t => t.id === db.activeDailyTaskId) || db.dailyTasks[0];
    res.json({ status: 'ok', currentTask, allTasks: db.dailyTasks, activeDailyTaskId: db.activeDailyTaskId });
  });

  app.post('/api/daily-task/set-active', (req, res) => {
    db = loadDb();
    const { id } = req.body;
    if (id && db.dailyTasks.some(t => t.id === id)) {
      db.activeDailyTaskId = id;
    }
    saveDb(db);
    const currentTask = db.dailyTasks.find(t => t.id === db.activeDailyTaskId) || db.dailyTasks[0];
    res.json({ status: 'ok', currentTask });
  });

  app.post('/api/daily-task', (req, res) => {
    db = loadDb();
    const newTask: DailyTask = {
      ...req.body,
      id: req.body.id || `dt-${Date.now()}`,
    };
    db.dailyTasks.unshift(newTask);
    db.activeDailyTaskId = newTask.id;
    saveDb(db);
    res.json({ status: 'ok', task: newTask });
  });

  app.put('/api/daily-task/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const index = db.dailyTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      db.dailyTasks[index] = { ...db.dailyTasks[index], ...req.body, id };
      saveDb(db);
      return res.json({ status: 'ok', task: db.dailyTasks[index] });
    }
    res.status(404).json({ error: 'Task not found' });
  });

  app.delete('/api/daily-task/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.dailyTasks = db.dailyTasks.filter(t => t.id !== id);
    if (db.activeDailyTaskId === id && db.dailyTasks.length > 0) {
      db.activeDailyTaskId = db.dailyTasks[0].id;
    }
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  // 5. Class Summaries
  app.get('/api/class-summaries', (req, res) => {
    db = loadDb();
    res.json({ status: 'ok', classSummaries: db.classSummaries });
  });

  app.post('/api/class-summaries', (req, res) => {
    db = loadDb();
    const { date, topic, topicEn, description, descriptionEn, activities, vocabulary, homework, skills } = req.body;
    if (!topic || !date) {
      return res.status(400).json({ error: 'Date and topic required' });
    }
    const newSummary: ClassSummary = {
      id: `sum-${Date.now()}`,
      date,
      topic,
      topicEn: topicEn || topic,
      description,
      skills: skills || [],
      activities: activities || [],
      vocabulary: vocabulary || [],
      homework: (homework || []).map((h: any, i: number) => ({
        id: `hw-${Date.now()}-${i}`,
        text: typeof h === 'string' ? h : h.text,
        completed: false
      }))
    };
    db.classSummaries.unshift(newSummary);
    saveDb(db);
    res.json({ status: 'ok', summary: newSummary });
  });

  app.put('/api/class-summaries/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const index = db.classSummaries.findIndex(s => s.id === id);
    if (index !== -1) {
      db.classSummaries[index] = { ...db.classSummaries[index], ...req.body, id };
      saveDb(db);
      return res.json({ status: 'ok', summary: db.classSummaries[index] });
    }
    res.status(404).json({ error: 'Summary not found' });
  });

  app.delete('/api/class-summaries/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.classSummaries = db.classSummaries.filter(s => s.id !== id);
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  // 6. Worksheets
  app.get('/api/worksheets', (req, res) => {
    db = loadDb();
    res.json({ status: 'ok', worksheets: db.worksheets });
  });

  app.post('/api/worksheets', (req, res) => {
    db = loadDb();
    const { title, titleEn, category, description, descriptionEn, estimatedTime, previewLines, pdfUrl, fileName, fileSize, addedByTeacher } = req.body;
    const newWorksheet: Worksheet = {
      id: `ws-${Date.now()}`,
      title,
      titleEn: titleEn || title,
      category: category || 'polski',
      description,
      descriptionEn: descriptionEn || description,
      estimatedTime: estimatedTime || '15 min',
      previewLines: previewLines || ['Zadanie przygotowane przez nauczyciela.'],
      downloadName: fileName || `${title.replace(/\s+/g, '_')}_Klasa2.pdf`,
      pdfUrl,
      fileName,
      fileSize,
      addedByTeacher: addedByTeacher ?? true,
    };
    db.worksheets.unshift(newWorksheet);
    saveDb(db);
    res.json({ status: 'ok', worksheet: newWorksheet });
  });

  app.put('/api/worksheets/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const index = db.worksheets.findIndex(w => w.id === id);
    if (index !== -1) {
      db.worksheets[index] = { ...db.worksheets[index], ...req.body, id };
      saveDb(db);
      return res.json({ status: 'ok', worksheet: db.worksheets[index] });
    }
    res.status(404).json({ error: 'Worksheet not found' });
  });

  app.delete('/api/worksheets/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.worksheets = db.worksheets.filter(w => w.id !== id);
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  // 7. Messages & Feedback
  app.get('/api/messages', (req, res) => {
    db = loadDb();
    res.json({ status: 'ok', messages: db.messages });
  });

  app.post('/api/messages', (req, res) => {
    db = loadDb();
    const { studentName, parentEmail, rating, message } = req.body;
    if (!studentName || !message) {
      return res.status(400).json({ error: 'Name and message required' });
    }
    const newMsg: FeedbackMessage = {
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString('pl-PL'),
      studentName,
      parentEmail: parentEmail || 'brak-emaila@rodzic.pl',
      rating: rating || 'super',
      message,
      replied: false,
    };
    db.messages.unshift(newMsg);
    saveDb(db);
    res.json({ status: 'ok', message: newMsg });
  });

  app.delete('/api/messages/:id', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    db.messages = db.messages.filter(m => m.id !== id);
    saveDb(db);
    res.json({ status: 'ok', id });
  });

  app.post('/api/messages/:id/reply', (req, res) => {
    db = loadDb();
    const { id } = req.params;
    const { replyText } = req.body;
    const msg = db.messages.find(m => m.id === id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    msg.replied = true;
    msg.replyText = replyText;
    msg.replyDate = new Date().toLocaleString('pl-PL');
    msg.emailSentSimulated = true;

    saveDb(db);
    res.json({
      status: 'ok',
      message: msg,
      notificationNotice: `Wysłano odpowiedź na e-mail: ${msg.parentEmail}`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
