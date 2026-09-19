import React, { useState } from 'react';

export interface LogoProps {
  className?: string;
  size?: number;
}

// Exact logos requested by the user
export const AI_BRAND_LOGOS = {
  chatgpt: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
  openai: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
  gemini: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png',
  google: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png',
  deepseek: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png',
  perplexity: 'https://www.aigc.cn/wp-content/uploads/2024/12/perplexity-ai-logo.png',
  claude: 'https://static.vecteezy.com/system/resources/previews/067/941/712/non_2x/claude-ai-logo-rounded-hd-free-png.png',
  anthropic: 'https://static.vecteezy.com/system/resources/previews/067/941/712/non_2x/claude-ai-logo-rounded-hd-free-png.png',
  xai: 'https://th.bing.com/th/id/OIP.n8XhQuyUCTUzFf69HvqrtAHaHa?w=166&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
  grok: 'https://th.bing.com/th/id/OIP.n8XhQuyUCTUzFf69HvqrtAHaHa?w=166&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
  ministral: 'https://vectorseek.com/wp-content/uploads/2023/12/Mistral-AI-Icon-Logo-Vector.svg-.png',
  mistral: 'https://vectorseek.com/wp-content/uploads/2023/12/Mistral-AI-Icon-Logo-Vector.svg-.png',
  meta: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/meta-color.png',
  llama: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/meta-color.png',
  dalle: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
  imagen: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/gemini-color.png',
  flux: 'https://freepnglogo.com/images/all_img/chatgpt-logo-stroke-with-no-background-3f78.png',
  midjourney: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png',
} as const;

// Reusable Image Logo with referrerPolicy="no-referrer" and fallback
export const LogoImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  size?: number;
  fallbackText?: string;
}> = ({ src, alt, className = 'w-5 h-5', size = 20, fallbackText }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        style={{ width: size, height: size }}
        className="rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-[10px] uppercase shrink-0 select-none"
      >
        {fallbackText || alt.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} object-contain shrink-0`}
    />
  );
};

// ChatGPT / OpenAI Logo
export const OpenAILogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.chatgpt}
    alt="ChatGPT"
    className={className}
    size={size}
    fallbackText="GPT"
  />
);

// Google Gemini Logo
export const GoogleGeminiLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.gemini}
    alt="Google Gemini"
    className={className}
    size={size}
    fallbackText="GE"
  />
);

// DeepSeek Logo
export const DeepSeekLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.deepseek}
    alt="DeepSeek"
    className={className}
    size={size}
    fallbackText="DS"
  />
);

// Perplexity Logo
export const PerplexityLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.perplexity}
    alt="Perplexity"
    className={className}
    size={size}
    fallbackText="PX"
  />
);

// Anthropic Claude Logo
export const AnthropicLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.claude}
    alt="Claude"
    className={className}
    size={size}
    fallbackText="CL"
  />
);

// xAI Grok Logo
export const XAILogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.xai}
    alt="xAI"
    className={className}
    size={size}
    fallbackText="xAI"
  />
);

// Meta Llama Logo
export const MetaLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.meta}
    alt="Meta Llama"
    className={className}
    size={size}
    fallbackText="ME"
  />
);

// Mistral / Ministral Logo
export const MistralLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <LogoImage
    src={AI_BRAND_LOGOS.ministral}
    alt="Mistral"
    className={className}
    size={size}
    fallbackText="MI"
  />
);

// Helper component that selects the correct logo
export const AILogoIcon: React.FC<{
  type: string;
  className?: string;
  size?: number;
}> = ({ type, className = 'w-5 h-5', size = 20 }) => {
  const key = (type || '').toLowerCase().trim();

  switch (key) {
    case 'chatgpt':
    case 'openai':
    case 'gpt':
      return <OpenAILogo className={className} size={size} />;
    case 'google':
    case 'gemini':
      return <GoogleGeminiLogo className={className} size={size} />;
    case 'deepseek':
      return <DeepSeekLogo className={className} size={size} />;
    case 'perplexity':
      return <PerplexityLogo className={className} size={size} />;
    case 'anthropic':
    case 'claude':
      return <AnthropicLogo className={className} size={size} />;
    case 'xai':
    case 'grok':
      return <XAILogo className={className} size={size} />;
    case 'meta':
    case 'llama':
    case 'metalama':
    case 'meta llama':
      return <MetaLogo className={className} size={size} />;
    case 'mistral':
    case 'ministral':
    case 'mistral ai':
      return <MistralLogo className={className} size={size} />;
    case 'dalle':
      return <OpenAILogo className={className} size={size} />;
    case 'imagen':
      return <GoogleGeminiLogo className={className} size={size} />;
    default:
      if (key in AI_BRAND_LOGOS) {
        return (
          <LogoImage
            src={AI_BRAND_LOGOS[key as keyof typeof AI_BRAND_LOGOS]}
            alt={type}
            className={className}
            size={size}
          />
        );
      }
      return <OpenAILogo className={className} size={size} />;
  }
};
