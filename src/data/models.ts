import { AIModel } from '../types';

// OpenRouter supported models mapping
export const OPENROUTER_MODEL_IDS: Record<string, string> = {
  'deepseek-chat': 'deepseek/deepseek-chat',
  'gpt-5-4-nano': 'openai/gpt-4o-mini',
  'gemini-3-1-flash-lite': 'google/gemini-2.0-flash-lite-001',
  'claude-opus-5': 'anthropic/claude-3.5-sonnet',
  'ministral-3-3b': 'mistralai/mistral-7b-instruct',
  'kimi-k3': 'moonshotai/moonshot-v1-8k',
  'gpt-5-4-mini': 'openai/gpt-4o-mini',
  'qwen-3-5': 'qwen/qwen-2.5-72b-instruct',
};

// Exact 8 models in the exact order shown in user screenshot
export const AVAILABLE_MODELS: AIModel[] = [
  // Left column row 1
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'Free model',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png',
    isFree: true,
    isLocked: false,
    category: 'intelligent',
  },
  // Right column row 1
  {
    id: 'gpt-5-4-nano',
    name: 'GPT-5.4 nano',
    provider: 'OpenAI',
    logo: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
    isFree: true,
    isLocked: false,
    category: 'latest',
  },
  // Left column row 2
  {
    id: 'gemini-3-1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'Google',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png',
    isFree: true,
    isLocked: false,
    category: 'latest',
  },
  // Right column row 2
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    provider: 'Anthropic',
    logo: 'https://static.vecteezy.com/system/resources/previews/067/941/712/non_2x/claude-ai-logo-rounded-hd-free-png.png',
    isFree: false,
    isLocked: true,
    multiplier: '8x',
    category: 'intelligent',
  },
  // Left column row 3
  {
    id: 'ministral-3-3b',
    name: 'Ministral 3 3B',
    provider: 'Free model',
    logo: 'https://vectorseek.com/wp-content/uploads/2023/12/Mistral-AI-Icon-Logo-Vector.svg-.png',
    isFree: true,
    isLocked: false,
    category: 'popular',
  },
  // Right column row 3
  {
    id: 'kimi-k3',
    name: 'Kimi K3',
    provider: 'Free model',
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/kimi-color.png',
    isFree: false,
    isLocked: true,
    multiplier: '4x',
    category: 'popular',
  },
  // Left column row 4
  {
    id: 'gpt-5-4-mini',
    name: 'GPT-5.4 mini',
    provider: 'OpenAI',
    logo: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
    isFree: true,
    isLocked: false,
    category: 'popular',
  },
  // Right column row 4
  {
    id: 'qwen-3-5',
    name: 'Qwen3.5',
    provider: 'Free model',
    logo: 'https://cdn.simpleicons.org/qwen/6E56CF',
    isFree: true,
    isLocked: false,
    category: 'popular',
  },
];
