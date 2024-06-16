import { NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className={'flex gap-2 h-12 items-center justify-end px-4 bg-black text-white'}>
      <NavLink className={({ isActive }) => (isActive ? 'font-bold' : '')} to="4ft-miner">
        4ft-miner
      </NavLink>
      <NavLink className={({ isActive }) => (isActive ? 'font-bold' : '')} to="dataset">
        Dataset
      </NavLink>
    </nav>
  );
}
