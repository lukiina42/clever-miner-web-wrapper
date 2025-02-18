import { createFileRoute } from '@tanstack/react-router';
import FourFtMinerCreate from '@/containers/4ftminer/FourFtMinerCreate.tsx';

export const Route = createFileRoute('/fourft/create/')({
  component: FourFt,
});

function FourFt() {
  return <FourFtMinerCreate />;
}
