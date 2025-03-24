import { ReactNode } from 'react';

export default function PageHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div
      className={
        'flex items-center px-4 h-16 w-full justify-between text-2xl font-bold border-b-2 border-gray-200'
      }
    >
      {title}
      {action && action}
    </div>
  );
}
