import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import SuspenseWrapper from '@/components/suspense/SuspenseWrapper.tsx';
import { ruleQueryOptions } from '@/api/rule.ts';
import RuleDetail from '@/containers/4ftminer/fourFtForm/rules/RuleDetail.tsx';
import useGetSession from '@/hook/useGetSession.ts';

export const Route = createFileRoute('/_protected/_fourft/fourft/$fourftId/rules/$ruleId/')({
  component: FourFtDetailSuspense,
});

function FourFtDetailSuspense() {
  return (
    <SuspenseWrapper>
      <RuleDetailPage />
    </SuspenseWrapper>
  );
}

function RuleDetailPage() {
  const { fourftId, ruleId } = Route.useParams();
  const session = useGetSession();

  const ruleDetail = useSuspenseQuery(
    ruleQueryOptions(fourftId, ruleId, session?.tokens?.accessToken)
  );

  return <RuleDetail data={ruleDetail.data} />;
}
