import { createFileRoute } from '@tanstack/react-router';
import FourFtMiner from '@/containers/4ftminer/FourFtMiner.tsx';

export const Route = createFileRoute('/fourft/')({
  component: FourFt,
});

function FourFt() {
  return <FourFtMiner />;
}
