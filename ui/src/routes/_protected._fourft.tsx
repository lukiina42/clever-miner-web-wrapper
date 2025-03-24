import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import PageHeading from '@/components/ui/PageHeading.tsx';
import { Button } from '@/components/ui/button.tsx';

export const Route = createFileRoute('/_protected/_fourft')({
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
        action={
          location.pathname === '/fourft' ? (
            <Link to={'/fourft/create'}>
              <Button type="button" className="cursor-pointer bg-black hover:bg-gray-800 w-44">
                Create new procedure
              </Button>
            </Link>
          ) : null
        }
      />
      <Outlet />
    </div>
  );
}
