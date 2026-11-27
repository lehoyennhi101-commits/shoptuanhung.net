import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'Vật phẩm Free Fire',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#15181E] text-[#9BA3B0] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          className="w-8 h-8 mb-3 text-[#F59E0B]/70"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M16 4l11 6v12l-11 6-11-6V10l11-6z" />
          <path d="M16 16l11-6M16 16v12M16 16L5 10" />
        </svg>
        <span className="font-display text-sm font-semibold text-[#F4F5F7]">{fallbackTitle}</span>
        <span className="mt-1 text-xs text-[#9BA3B0] max-w-xs line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#15181E] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
