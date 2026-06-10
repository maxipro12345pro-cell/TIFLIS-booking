import { supabase } from './supabase.js';

const REMEMBER_KEY = 'tiflis.hostessRememberUntil';
const SESSION_KEY = 'tiflis.hostessSessionActive';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

function storageValue(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function setStorageValue(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage can be unavailable in private contexts.
  }
}

function removeStorageValue(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be unavailable in private contexts.
  }
}

export function rememberHostessDevice() {
  const expiresAt = Date.now() + TWELVE_HOURS_MS;
  setStorageValue(globalThis.localStorage, REMEMBER_KEY, String(expiresAt));
  setStorageValue(globalThis.sessionStorage, SESSION_KEY, '1');
}

export function rememberHostessForSession() {
  removeStorageValue(globalThis.localStorage, REMEMBER_KEY);
  setStorageValue(globalThis.sessionStorage, SESSION_KEY, '1');
}

export function clearHostessAccess() {
  removeStorageValue(globalThis.localStorage, REMEMBER_KEY);
  removeStorageValue(globalThis.sessionStorage, SESSION_KEY);
}

export function hasRememberedHostessDevice() {
  const expiresAt = Number(storageValue(globalThis.localStorage, REMEMBER_KEY));

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    removeStorageValue(globalThis.localStorage, REMEMBER_KEY);
    return false;
  }

  return true;
}

export function hasHostessAccess() {
  return hasRememberedHostessDevice() || storageValue(globalThis.sessionStorage, SESSION_KEY) === '1';
}

export async function clearExpiredPersistedHostessSession() {
  if (hasHostessAccess() || !supabase) return;
  await supabase.auth.signOut().catch(() => null);
}
