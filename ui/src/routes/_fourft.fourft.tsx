import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_fourft/fourft')({
  component: FourFtLayout,
});

function FourFtLayout() {
  return <div className={'w-full h-full'}>List of four ft results</div>;
}
