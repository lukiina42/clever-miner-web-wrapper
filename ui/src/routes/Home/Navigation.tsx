import { NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className={'flex gap-2 h-12 border-b-2 border-gray-200 items-center justify-end px-4'}>
      <NavLink className={({ isActive }) => (isActive ? 'font-bold' : '')} to="4ft-miner">
        4ft-miner
      </NavLink>
      <NavLink className={({ isActive }) => (isActive ? 'font-bold' : '')} to="dataset">
        Dataset
      </NavLink>
    </nav>
  );
}
