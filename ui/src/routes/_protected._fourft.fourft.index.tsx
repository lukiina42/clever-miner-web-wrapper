import { createFileRoute } from '@tanstack/react-router';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { FourFtFilters, useGetFourFts } from '@/api/fourft.ts';
import FourFtList from '@/containers/4ftminer/fourFtTable/FourFtList.tsx';
import { useState } from 'react';

export const Route = createFileRoute('/_protected/_fourft/fourft/')({
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
  const [filters, setFilters] = useState<FourFtFilters>({});
  const fourFtResults = useGetFourFts(filters, true);

  return (
    <FourFtList
      fourFtResults={fourFtResults.data || []}
      filters={filters}
      setFilters={setFilters}
      isLoading={fourFtResults.isLoading || false}
    />
  );
}
