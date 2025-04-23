import { Link } from '@tanstack/react-router';
import useGetSession from '@/hook/useGetSession.ts';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const { tokens, updateTokens } = useGetSession();

  return (
    <nav className={'flex gap-4 h-12 items-center justify-end px-4 bg-black text-white'}>
      {tokens !== null ? (
        <>
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link
            to="/fourft"
            search={{ ordering: undefined, name: undefined, datasetName: undefined }}
            className="[&.active]:font-bold"
          >
            4ft-Miner
          </Link>
          <Link
            to="/datasets"
            search={{ ordering: undefined, name: undefined }}
            className="[&.active]:font-bold"
          >
            Datasets
          </Link>
          <ArrowLeftStartOnRectangleIcon
            className={'rotate-180 h-6 font-bold cursor-pointer'}
            onClick={() => updateTokens(null)}
          >
            Logout
          </ArrowLeftStartOnRectangleIcon>
        </>
      ) : (
        <>
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/auth" className="[&.active]:font-bold">
            Login
          </Link>
        </>
      )}
    </nav>
  );
}
