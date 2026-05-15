import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const SESSION_KEY = 'luxeshop:activeSessionId';
const SESSION_START_KEY = 'luxeshop:activeSessionStart';

const providerToMethod = (providerId) => {
  if (!providerId) return 'password';
  if (providerId.includes('google'))   return 'google';
  if (providerId.includes('facebook')) return 'facebook';
  if (providerId.includes('github'))   return 'github';
  if (providerId.includes('password')) return 'password';
  return providerId;
};

export async function startSession(user, methodHint) {
  if (!user) return null;

  const providerId = user.providerData?.[0]?.providerId;
  const method = methodHint || providerToMethod(providerId);

  const sessionData = {
    uid:         user.uid,
    email:       user.email || '',
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
    photoURL:    user.photoURL || '',
    method,
    loginAt:     serverTimestamp(),
    logoutAt:    null,
    durationMs:  null,
    status:      'active',
  };

  try {
    const ref = await addDoc(collection(db, 'sessions'), sessionData);
    localStorage.setItem(SESSION_KEY, ref.id);
    localStorage.setItem(SESSION_START_KEY, String(Date.now()));
    return ref.id;
  } catch (err) {
    console.error('startSession failed:', err);
    return null;
  }
}

export async function endSession(sessionId) {
  const id = sessionId || localStorage.getItem(SESSION_KEY);
  if (!id) return;

  try {
    const ref = doc(db, 'sessions', id);
    const snap = await getDoc(ref);
    let durationMs = null;

    if (snap.exists()) {
      const data = snap.data();
      if (data.loginAt instanceof Timestamp) {
        durationMs = Date.now() - data.loginAt.toMillis();
      }
    }
    if (durationMs === null) {
      const start = Number(localStorage.getItem(SESSION_START_KEY));
      if (start) durationMs = Date.now() - start;
    }

    await updateDoc(ref, {
      logoutAt:   serverTimestamp(),
      durationMs,
      status:     'finalized',
    });
  } catch (err) {
    console.error('endSession failed:', err);
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_START_KEY);
  }
}

export function formatDuration(ms) {
  if (ms == null || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
