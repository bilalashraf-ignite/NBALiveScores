'use client';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 'h-8 w-8', text: 'text-lg' },
  md: { icon: 'h-10 w-10', text: 'text-xl' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl' },
};

export function BrandLogo({ size = 'md', showText = true, className = '' }: BrandLogoProps) {

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex ${sizes[size].icon} items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500`}>
        <svg
          className="h-2/3 w-2/3 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2C12 2 14 6 14 12C14 18 12 22 12 22" />
          <path d="M12 2C12 2 10 6 10 12C10 18 12 22 12 22" />
          <path d="M2 12H22" />
          <path d="M4 7H20" />
          <path d="M4 17H20" />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} text-white`}>
          Funky<span className="text-purple-400">Sports</span>
        </span>
      )}
    </div>
  );
}
