import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import PageHeading from '@/components/ui/PageHeading.tsx';

export const Route = createFileRoute('/_fourft')({
  component: FourFtLayout,
});

function extractRuleId(route: string) {
  const match = route.match(/\/fourft\/\d+\/rules\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function FourFtLayout() {
  const location = useLocation();
  const ruleId = extractRuleId(location.pathname);

  return (
    <div className={'w-full h-full'}>
      <PageHeading
        title={'4FT Miner'.concat(ruleId !== null ? ` - procedure rule ${ruleId}` : '')}
      />
      <Outlet />
    </div>
  );
}
