import { UserProfileData, PromptMode } from '../types';
import {
  getStoredUserProfile as getStoredProfile,
  saveStoredUserProfile as saveStoredProfile,
  getStoredPrompts,
  saveStoredPrompt,
  SavedPromptItem,
} from './storage';

export const FIREBASE_PROJECT_ID = 'local-storage-mode';
export const FIRESTORE_DATABASE_ID = '(default)';
export const FIREBASE_CONSOLE_URL = '#';
export const FIRESTORE_CONSOLE_URL = '#';
export const FIRESTORE_UPGRADE_URL = '#';
export const FIRESTORE_PRICING_URL = '#';

export interface QuotaStatus {
  isExceeded: boolean;
  message?: string;
  timestamp?: number;
}

export const isFirestoreQuotaExceeded = (): boolean => false;

export const markQuotaExceeded = (_message?: string) => {};

export const clearQuotaExceeded = () => {};

export const subscribeQuotaStatus = (callback: (status: QuotaStatus) => void): (() => void) => {
  callback({ isExceeded: false });
  return () => {};
};

export async function testConnection(): Promise<void> {
  // Pure local storage mode - no network call needed
  return Promise.resolve();
}

export async function initAuth(): Promise<{ uid: string } | null> {
  // Pure local storage mode - authenticated as local user
  return Promise.resolve({ uid: 'local-user' });
}

export function getCurrentUser() {
  return { uid: 'local-user', isAnonymous: true };
}

export function getStoredUserProfile(): UserProfileData {
  return getStoredProfile();
}

export async function syncUserProfile(profile: UserProfileData): Promise<void> {
  saveStoredProfile(profile);
}

export async function savePrompt(promptText: string, mode: PromptMode = 'Auto'): Promise<string> {
  const item = saveStoredPrompt(promptText, mode);
  return item.id;
}

export async function getRecentPrompts(limitCount = 10): Promise<SavedPromptItem[]> {
  return getStoredPrompts(limitCount);
}

export async function saveChatMessage(_sessionId: string, _message: any): Promise<void> {
  // Managed by local storage in App.tsx
}

export async function loadChatSessionMessages(_sessionId: string): Promise<any[]> {
  return [];
}
