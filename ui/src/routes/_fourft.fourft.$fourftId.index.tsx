import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultQueryOptions } from '@/api/fourft.ts';
import FourFtMinerUpdate from '@/containers/4ftminer/fourFtForm/FourFtMinerUpdate.tsx';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import useSessionTokens from '@/hook/useGetSession.ts';

export const Route = createFileRoute('/_fourft/fourft/$fourftId/')({
  component: FourFtDetailSuspense,
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
  const sessionState = useSessionTokens();

  const fourFtResult = useSuspenseQuery(
    fourFtResultQueryOptions(fourftId, sessionState.tokens.accessToken)
  );

  return <FourFtMinerUpdate data={fourFtResult.data} />;
}
