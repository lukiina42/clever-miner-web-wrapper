import { createFileRoute } from '@tanstack/react-router';
import FourFtMinerCreate from '@/containers/4ftminer/fourFtForm/FourFtMinerCreate.tsx';

export const Route = createFileRoute('/_fourft/fourft/create/')({
  component: FourFt,
});

function FourFt() {
  return <FourFtMinerCreate />;
}
