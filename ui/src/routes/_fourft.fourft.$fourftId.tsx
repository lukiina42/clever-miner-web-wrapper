import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';
import FourFtMinerUpdate from '@/containers/4ftminer/FourFtMinerUpdate.tsx';
import { Suspense } from 'react';
import { ClipLoader } from 'react-spinners';

export const Route = createFileRoute('/_fourft/fourft/$fourftId')({
  component: FourFtDetailSuspense,
});

function FourFtDetailSuspense() {
  return (
    <Suspense fallback={<FourFtDetailCallback />}>
      <FourFtDetail />;
    </Suspense>
  );
}

function FourFtDetail() {
  const { fourftId } = Route.useParams();

  const fourFtResult = useSuspenseQuery(fourFtResultQueryOptions(fourftId));

  return <FourFtMinerUpdate data={fourFtResult.data} />;
}

function FourFtDetailCallback() {
  return (
    <div className={'h-[calc(100vh-10rem)] w-screen flex items-center justify-center'}>
      <ClipLoader size={48} />
    </div>
  );
}
