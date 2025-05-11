import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      {...props}
    >
      <path d="M50 5 A20 20 0 0 0 30 25 L30 40 A5 5 0 0 0 35 45 L65 45 A5 5 0 0 0 70 40 L70 25 A20 20 0 0 0 50 5 Z" />
      <path d="M50 55 L35 80 L50 95 L65 80 Z" />
    </svg>
  );
}
