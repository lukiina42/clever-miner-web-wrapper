import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';
import FourFtMiner from '@/containers/4ftminer/FourFtMiner.tsx';

export const Route = createFileRoute('/fourft/$fourftId')({
  component: FourFtDetail,
});

function FourFtDetail() {
  const { fourftId } = Route.useParams();

  const fourFtResult = useSuspenseQuery(fourFtResultQueryOptions(fourftId));

  return <FourFtMiner data={fourFtResult.data} />;
}
