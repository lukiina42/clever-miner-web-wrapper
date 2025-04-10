import { createFileRoute } from '@tanstack/react-router';
import Dataset from '@/containers/Dataset/Dataset.tsx';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { useGetDatasets } from '@/api/dataset.ts';

type DatasetListSearch = {
  ordering: string | undefined;
  name: string | undefined;
};

export const Route = createFileRoute('/_protected/_dataset/datasets')({
  component: DatasetResultsSuspense,
  validateSearch: (search: Record<string, unknown>): DatasetListSearch => {
    return {
      ordering: (search.ordering as string) || undefined,
      name: (search.name as string) || undefined,
    };
  },
});

function DatasetResultsSuspense() {
  return (
    <SuspenseWrapper>
      <DatasetResults />
    </SuspenseWrapper>
  );
}

function DatasetResults() {
  const filters = Route.useSearch();
  const { data } = useGetDatasets(filters, true);

  return <Dataset datasets={data ?? []} />;
}
