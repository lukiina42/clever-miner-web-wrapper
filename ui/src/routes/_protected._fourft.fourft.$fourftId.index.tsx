import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';
import FourFtMinerUpdate from '@/containers/4ftminer/fourFtForm/FourFtMinerUpdate.tsx';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';

type FourFtDetailSearch = {
  ordering?: string;
};

export const Route = createFileRoute('/_protected/_fourft/fourft/$fourftId/')({
  component: FourFtDetailSuspense,
  validateSearch: (search: Record<string, unknown>): FourFtDetailSearch => {
    return {
      ordering: (search.ordering as string) || undefined,
    };
  },
});

function FourFtDetailSuspense() {
  return (
    <SuspenseWrapper>
      <FourFtDetail />
    </SuspenseWrapper>
  );
}

function FourFtDetail() {
  const { fourftId } = Route.useParams();
  const { ordering } = Route.useSearch();

  const fourFtResult = useSuspenseQuery(fourFtResultQueryOptions(fourftId, ordering as string));

  return <FourFtMinerUpdate data={fourFtResult.data} />;
}
