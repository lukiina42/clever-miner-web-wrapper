import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fourft/$fourftId')({
  component: FourFtDetail,
});

function FourFtDetail() {
  const { fourftId } = Route.useParams();

  return <div>Four ft detail xd</div>;
}
