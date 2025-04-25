import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Navigation from '@/containers/Home/Navigation.tsx';

export const Route = createRootRoute({
  component: () => (
    <div className={'flex flex-col min-h-screen h-screen w-screen'}>
      <Navigation />
      <div className={'flex w-full h-[calc(100%-9rem)]'}>
        <Outlet />
      </div>
      {/*<TanStackRouterDevtools />*/}
    </div>
  ),
  notFoundComponent: () => {
    return (
      <div className={'p-4 flex flex-col gap-4'}>
        <p>NOT FOUND</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
});
