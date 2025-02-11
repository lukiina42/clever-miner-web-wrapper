import { Link } from '@tanstack/react-router';

export default function Navigation() {
  return (
    <nav className={'flex gap-2 h-12 items-center justify-end px-4 bg-black text-white'}>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>
      <Link to="/fourft" className="[&.active]:font-bold">
        4ft Miner
      </Link>
      <Link to="/datasets" className="[&.active]:font-bold">
        Datasets
      </Link>
    </nav>
  );
}
