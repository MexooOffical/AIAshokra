import { UserProfileData, ChatSession, PromptMode } from '../types';

export interface SavedPromptItem {
  id: string;
  text: string;
  mode: PromptMode;
  createdAt: number;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'ai_ashokra_user_profile',
  CHAT_SESSIONS: 'ai_ashokra_chat_sessions',
  SAVED_PROMPTS: 'ai_ashokra_saved_prompts',
  ACTIVE_CHAT_ID: 'ai_ashokra_active_chat_id',
  APPEARANCE_SETTINGS: 'ai_ashokra_appearance_settings',
  AI_MODEL_PREFERENCES: 'ai_ashokra_model_preferences',
  MEMORY_SETTINGS: 'ai_ashokra_memory_settings',
  AUTH_SESSION: 'ai_ashokra_auth_session',
  REGISTERED_USERS: 'ai_ashokra_registered_users',
};

export interface StoredUserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  provider: 'google' | 'email';
  createdAt: number;
}

export interface AuthSession {
  isLoggedIn: boolean;
  email?: string;
  name?: string;
  phone?: string;
  provider?: 'google' | 'email';
}

export const DEFAULT_AUTH_SESSION: AuthSession = {
  isLoggedIn: false,
  email: '',
  name: '',
  phone: '',
};

// --- Local Storage User Accounts ---
export function getStoredUsers(): StoredUserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse registered users:', err);
    return [];
  }
}

export function findStoredUserByEmail(email: string): StoredUserAccount | undefined {
  const users = getStoredUsers();
  return users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
}

export function registerStoredUser(user: {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  provider?: 'google' | 'email';
}): StoredUserAccount {
  const users = getStoredUsers();
  const normalizedEmail = user.email.trim().toLowerCase();
  const existingIndex = users.findIndex(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  const displayName =
    user.name?.trim() ||
    normalizedEmail.split('@')[0].charAt(0).toUpperCase() +
      normalizedEmail.split('@')[0].slice(1) ||
    'User';

  const account: StoredUserAccount = {
    id: existingIndex >= 0 ? users[existingIndex].id : `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    email: normalizedEmail,
    password: user.password || (existingIndex >= 0 ? users[existingIndex].password : ''),
    name: displayName,
    phone: user.phone || (existingIndex >= 0 ? users[existingIndex].phone : ''),
    provider: user.provider || 'email',
    createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : Date.now(),
  };

  if (existingIndex >= 0) {
    users[existingIndex] = account;
  } else {
    users.push(account);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    } catch (err) {
      console.warn('Failed to save registered user:', err);
    }
  }

  return account;
}

export function authenticateStoredUser(
  email: string,
  password?: string
): { success: boolean; account?: StoredUserAccount; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findStoredUserByEmail(normalizedEmail);

  if (!existing) {
    // If no prior registered user, automatically register them locally for smooth onboarding
    const newAccount = registerStoredUser({
      email: normalizedEmail,
      password: password || '',
      provider: 'email',
    });
    return { success: true, account: newAccount };
  }

  // If user already has a saved password, check match
  if (existing.password && password && existing.password !== password) {
    return { success: false, error: 'Incorrect password for this account. Please try again.' };
  }

  // Update password if none was stored yet
  if (!existing.password && password) {
    existing.password = password;
    registerStoredUser(existing);
  }

  return { success: true, account: existing };
}

export function getStoredAuthSession(): AuthSession {
  if (typeof window === 'undefined') return DEFAULT_AUTH_SESSION;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return DEFAULT_AUTH_SESSION;
    const parsed = JSON.parse(raw);
    return {
      isLoggedIn: Boolean(parsed.isLoggedIn),
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      provider: parsed.provider || 'email',
    };
  } catch (err) {
    console.warn('Failed to parse auth session:', err);
    return DEFAULT_AUTH_SESSION;
  }
}

export function saveStoredAuthSession(session: Partial<AuthSession>): AuthSession {
  if (typeof window === 'undefined') return DEFAULT_AUTH_SESSION;
  try {
    const current = getStoredAuthSession();
    const updated: AuthSession = { ...current, ...session };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save auth session:', err);
    return DEFAULT_AUTH_SESSION;
  }
}

export function clearStoredAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch (err) {
    console.warn('Failed to clear auth session:', err);
  }
}

const DEFAULT_USER: UserProfileData = {
  name: 'Spectar',
  plan: 'Free',
  avatarLetter: 'S',
  avatarColor: '#10b981',
  messagesUsed: 6,
  messagesLimit: 10,
};

// --- User Profile ---
export function getStoredUserProfile(): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER, ...parsed };
  } catch (err) {
    console.warn('Failed to parse local user profile:', err);
    return DEFAULT_USER;
  }
}

export function saveStoredUserProfile(profile: Partial<UserProfileData>): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const current = getStoredUserProfile();
    const updated: UserProfileData = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save local user profile:', err);
    return DEFAULT_USER;
  }
}

// --- Chat Sessions ---
export function getStoredChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse stored chat sessions:', err);
    return [];
  }
}

export function saveStoredChatSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save chat sessions to local storage:', err);
  }
}

export function getStoredActiveChatId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  } catch {
    return null;
  }
}

export function saveStoredActiveChatId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    }
  } catch {}
}

// --- Saved Prompts ---
export function getStoredPrompts(limitCount = 20): SavedPromptItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS);
    if (!raw) return [];
    const list: SavedPromptItem[] = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, limitCount) : [];
  } catch {
    return [];
  }
}

export function saveStoredPrompt(text: string, mode: PromptMode = 'Auto'): SavedPromptItem {
  const newItem: SavedPromptItem = {
    id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    mode,
    createdAt: Date.now(),
  };

  if (typeof window === 'undefined') return newItem;
  try {
    const current = getStoredPrompts(100);
    // Filter out duplicates with the exact same text
    const filtered = current.filter((p) => p.text.toLowerCase() !== newItem.text.toLowerCase());
    const updated = [newItem, ...filtered].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save prompt to local storage:', err);
  }
  return newItem;
}

export function deleteStoredPrompt(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredPrompts(100);
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(updated));
  } catch {}
}

export function clearStoredPrompts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_PROMPTS);
  } catch {}
}

// --- AI Model Preferences (Settings -> AI Preferences) ---
export interface AIModelPreference {
  id: string;
  provider: string;
  selectedModel: string;
  availableModels: string[];
  isEnabled: boolean;
  isLocked: boolean;
  isPro?: boolean;
  type: 'text' | 'image';
  iconType: string;
}

export const DEFAULT_AI_MODEL_PREFERENCES: AIModelPreference[] = [
  {
    id: 'openai',
    provider: 'OpenAI',
    selectedModel: 'GPT-5.4 nano',
    availableModels: [
      'GPT-5.4 nano',
      'GPT-5.4 mini',
      'GPT-4o',
      'GPT-4o mini',
      'o1',
      'o3-mini',
    ],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'text',
    iconType: 'openai',
  },
  {
    id: 'google',
    provider: 'Google',
    selectedModel: 'Gemini 3.1 Flash Lite',
    availableModels: [
      'Gemini 3.1 Flash Lite',
      'Gemini 2.5 Pro',
      'Gemini 2.0 Flash',
      'Gemini 2.0 Flash Thinking',
    ],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'text',
    iconType: 'google',
  },
  {
    id: 'deepseek',
    provider: 'DeepSeek',
    selectedModel: 'DeepSeek Chat',
    availableModels: [
      'DeepSeek Chat',
      'DeepSeek V3',
      'DeepSeek R1',
      'DeepSeek Coder',
    ],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'text',
    iconType: 'deepseek',
  },
  {
    id: 'perplexity',
    provider: 'Perplexity',
    selectedModel: 'Perplexity Sonar',
    availableModels: [
      'Perplexity Sonar',
      'Sonar Pro',
      'Sonar Reasoning Pro',
      'Sonar Deep Research',
    ],
    isEnabled: false,
    isLocked: true,
    isPro: true,
    type: 'text',
    iconType: 'perplexity',
  },
  {
    id: 'anthropic',
    provider: 'Anthropic',
    selectedModel: 'Claude Haiku 4.5',
    availableModels: [
      'Claude Haiku 4.5',
      'Claude 3.7 Sonnet',
      'Claude 3.5 Sonnet',
      'Claude 3.5 Haiku',
      'Claude Opus 4',
    ],
    isEnabled: false,
    isLocked: true,
    isPro: true,
    type: 'text',
    iconType: 'anthropic',
  },
  {
    id: 'xai',
    provider: 'xAI',
    selectedModel: 'Grok 3 Mini',
    availableModels: ['Grok 3 Mini', 'Grok 3', 'Grok 2', 'Grok 2 Vision'],
    isEnabled: false,
    isLocked: true,
    isPro: true,
    type: 'text',
    iconType: 'xai',
  },
  {
    id: 'mistral',
    provider: 'Mistral AI',
    selectedModel: 'Mistral Large 2',
    availableModels: [
      'Mistral Large 2',
      'Mistral Small 3',
      'Codestral 25.01',
      'Pixtral Large',
    ],
    isEnabled: false,
    isLocked: true,
    isPro: true,
    type: 'text',
    iconType: 'mistral',
  },
  {
    id: 'meta',
    provider: 'Meta Llama',
    selectedModel: 'Llama 3.3 70B',
    availableModels: ['Llama 3.3 70B', 'Llama 3.1 405B', 'Llama 3.2 11B Vision'],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'text',
    iconType: 'meta',
  },
  // Image Models
  {
    id: 'flux',
    provider: 'Black Forest Labs',
    selectedModel: 'FLUX.1 Pro',
    availableModels: ['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX.1 Schnell'],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'image',
    iconType: 'openai',
  },
  {
    id: 'midjourney',
    provider: 'Midjourney',
    selectedModel: 'Midjourney v6.1',
    availableModels: ['Midjourney v6.1', 'Midjourney v6.0', 'Niji 6'],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'image',
    iconType: 'deepseek',
  },
  {
    id: 'dalle',
    provider: 'OpenAI DALL·E',
    selectedModel: 'DALL·E 3 HD',
    availableModels: ['DALL·E 3 HD', 'DALL·E 3 Standard', 'DALL·E 2'],
    isEnabled: false,
    isLocked: true,
    isPro: true,
    type: 'image',
    iconType: 'openai',
  },
  {
    id: 'imagen',
    provider: 'Google Imagen',
    selectedModel: 'Imagen 3 Fast',
    availableModels: ['Imagen 3 Fast', 'Imagen 3 High Quality'],
    isEnabled: true,
    isLocked: false,
    isPro: false,
    type: 'image',
    iconType: 'google',
  },
];

export function getStoredAIPreferences(): AIModelPreference[] {
  if (typeof window === 'undefined') return DEFAULT_AI_MODEL_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_MODEL_PREFERENCES);
    if (!raw) return DEFAULT_AI_MODEL_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_AI_MODEL_PREFERENCES;
  } catch (err) {
    console.warn('Failed to parse stored AI model preferences:', err);
    return DEFAULT_AI_MODEL_PREFERENCES;
  }
}

export function saveStoredAIPreferences(preferences: AIModelPreference[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.AI_MODEL_PREFERENCES, JSON.stringify(preferences));
  } catch (err) {
    console.warn('Failed to save AI model preferences:', err);
  }
}

export function resetStoredAIPreferences(): AIModelPreference[] {
  if (typeof window === 'undefined') return DEFAULT_AI_MODEL_PREFERENCES;
  try {
    localStorage.setItem(
      STORAGE_KEYS.AI_MODEL_PREFERENCES,
      JSON.stringify(DEFAULT_AI_MODEL_PREFERENCES)
    );
  } catch {}
  return DEFAULT_AI_MODEL_PREFERENCES;
}

// --- Memory Settings ---
export interface MemorySettings {
  isEnabled: boolean;
  keyFacts: string[];
  summary: string;
  rememberedAutomatically: string[];
}

export const DEFAULT_MEMORY_SETTINGS: MemorySettings = {
  isEnabled: false,
  keyFacts: [],
  summary: '',
  rememberedAutomatically: [],
};

export function getStoredMemorySettings(): MemorySettings {
  if (typeof window === 'undefined') return DEFAULT_MEMORY_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORY_SETTINGS);
    if (!raw) return DEFAULT_MEMORY_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      isEnabled: Boolean(parsed.isEnabled),
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      rememberedAutomatically: Array.isArray(parsed.rememberedAutomatically)
        ? parsed.rememberedAutomatically
        : [],
    };
  } catch (err) {
    console.warn('Failed to parse stored memory settings:', err);
    return DEFAULT_MEMORY_SETTINGS;
  }
}

export function saveStoredMemorySettings(settings: Partial<MemorySettings>): MemorySettings {
  if (typeof window === 'undefined') return DEFAULT_MEMORY_SETTINGS;
  try {
    const current = getStoredMemorySettings();
    const updated: MemorySettings = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.MEMORY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save memory settings:', err);
    return DEFAULT_MEMORY_SETTINGS;
  }
}

