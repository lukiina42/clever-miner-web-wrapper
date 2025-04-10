import { createFileRoute } from '@tanstack/react-router';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { useGetFourFts } from '@/api/fourft.ts';
import FourFtList from '@/containers/4ftminer/fourFtTable/FourFtList.tsx';

type FourFtListSearch = {
  ordering: string | undefined;
  name: string | undefined;
  datasetName: string | undefined;
};

export const Route = createFileRoute('/_protected/_fourft/fourft/')({
  component: FourFtResultsSuspense,
  validateSearch: (search: Record<string, unknown>): FourFtListSearch => {
    return {
      ordering: (search.ordering as string) || undefined,
      name: (search.name as string) || undefined,
      datasetName: (search.datasetName as string) || undefined,
    };
  },
});

function FourFtResultsSuspense() {
  return (
    <SuspenseWrapper>
      <FourFtResults />
    </SuspenseWrapper>
  );
}

function FourFtResults() {
  const filters = Route.useSearch();
  const fourFtResults = useGetFourFts(
    {
      ...filters,
      dataset_name: filters.datasetName,
    },
    true
  );

  return (
    <FourFtList
      fourFtResults={fourFtResults.data || []}
      isLoading={fourFtResults.isLoading || false}
    />
  );
}
