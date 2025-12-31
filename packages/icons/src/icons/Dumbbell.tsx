import { IconProps } from './types';

export function Dumbbell({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.5 6.5a2.5 2.5 0 0 1 0 5h-1a2.5 2.5 0 0 1 0-5h1z" />
      <path d="M17.5 6.5a2.5 2.5 0 0 1 0 5h1a2.5 2.5 0 0 1 0-5h-1z" />
      <path d="M6.5 17.5a2.5 2.5 0 0 1 0-5h-1a2.5 2.5 0 0 1 0 5h1z" />
      <path d="M17.5 17.5a2.5 2.5 0 0 1 0-5h1a2.5 2.5 0 0 1 0 5h-1z" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 6v3" />
      <path d="M12 15v3" />
    </svg>
  );
}