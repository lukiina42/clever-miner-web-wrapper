import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';
import FourFtMinerUpdate from '@/containers/4ftminer/fourFtForm/FourFtMinerUpdate.tsx';
import SuspenseWrapper from "@/components/suspense/SuspenseWrapper.tsx";

export const Route = createFileRoute('/_fourft/fourft/$fourftId')({
  component: FourFtDetailSuspense,
});

function FourFtDetailSuspense() {
  return (
    <SuspenseWrapper><FourFtDetail /></SuspenseWrapper>
  );
}

function FourFtDetail() {
  const { fourftId } = Route.useParams();

  const fourFtResult = useSuspenseQuery(fourFtResultQueryOptions(fourftId));

  return <FourFtMinerUpdate data={fourFtResult.data} />;
}
