import { cn } from '@/lib/utils';

export function BcoinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 text-yellow-400', className)}
    >
      <path d="M16.5 13.5c1.2-1.2 1-3.3-.6-4.9a5 5 0 0 0-7 7c1.6 1.6 3.7 1.8 4.9.6" />
      <path d="M12 8v8" />
      <path d="M15 11h-1" />
      <path d="M15 14h-2" />
      <path d="M7 12h1" />
      <path d="M8 9H7" />
    </svg>
  );
}
