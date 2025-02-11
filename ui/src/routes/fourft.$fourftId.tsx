import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';

export const Route = createFileRoute('/fourft/$fourftId')({
  component: FourFtDetail,
});

function FourFtDetail() {
  const { fourftId } = Route.useParams();

  const fourFtResult = useSuspenseQuery(fourFtResultQueryOptions(fourftId));

  console.log(fourFtResult);

  return <div>Four ft detail xd</div>;
}
