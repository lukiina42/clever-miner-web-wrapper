import { createFileRoute } from '@tanstack/react-router';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fourFtResultsQueryOptions } from '@/api/fourft.ts';
import FourFtList from '@/containers/4ftminer/fourFtTable/FourFtList.tsx';
import useSessionTokens from '@/hook/useGetSession.ts';

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
  const sessionState = useSessionTokens();

  const fourFtResults = useSuspenseQuery(
    fourFtResultsQueryOptions(sessionState.tokens.accessToken)
  );

  return <FourFtList fourFtResults={fourFtResults.data} />;
}
