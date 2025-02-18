import { createFileRoute, Outlet } from '@tanstack/react-router';
import PageHeading from '@/components/ui/PageHeading.tsx';

export const Route = createFileRoute('/_fourft')({
  component: FourFtLayout,
});

function FourFtLayout() {
  return (
    <div className={'w-full h-full'}>
      <PageHeading title={'4FT Miner'} />
      <Outlet />
    </div>
  );
}
