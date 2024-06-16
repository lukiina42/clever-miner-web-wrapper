import '../../App.css';
import { Route, Routes } from 'react-router-dom';
import Dataset from '../Dataset/Dataset.tsx';
import FourFtMiner from '../4ftminer/FourFtMiner.tsx';
import Navigation from '@/routes/Home/Navigation.tsx';

export default function Home() {
  return (
    <div className={'flex flex-col min-h-screen h-screen w-screen'}>
      <Navigation />
      <div className={'flex w-full h-[calc(100%-3rem)]'}>
        <Routes>
          <Route path="dataset" element={<Dataset />} />
          <Route path="4ft-miner" element={<FourFtMiner />} />
        </Routes>
      </div>
    </div>
  );
}
