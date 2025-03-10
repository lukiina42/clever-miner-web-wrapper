import { ReactNode, Suspense } from 'react';
import FourFtDetailCallback from '@/components/suspense/SuspenseCallback.tsx';

export default function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FourFtDetailCallback />}>{children}</Suspense>;
}
