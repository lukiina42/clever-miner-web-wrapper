import { createFileRoute } from '@tanstack/react-router';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultsQueryOptions } from '@/api/fourft.ts';
import FourFtList from '@/containers/4ftminer/fourFtTable/FourFtList.tsx';

export const Route = createFileRoute('/_fourft/fourft/')({
  component: FourFtResultsSuspense,
});

function FourFtResultsSuspense() {
  return (
    <SuspenseWrapper>
      <FourFtResults />
    </SuspenseWrapper>
  );
}

function FourFtResults() {
  const fourFtResults = useSuspenseQuery(fourFtResultsQueryOptions);

  return <FourFtList fourFtResults={fourFtResults.data} />;
}
