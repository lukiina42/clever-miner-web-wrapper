import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dataset from './routes/Dataset/Dataset.tsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import FourFtMiner from './routes/4ftminer/FourFtMiner.tsx';
import Home from './routes/Home/Home.tsx';

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Home />}>
      <Route path="4ft-miner" element={<FourFtMiner />} />
      <Route path="dataset" element={<Dataset />} />
    </Route>
  )
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
