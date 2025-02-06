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
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={<Home />}>
      <Route path="4ft-miner" element={<FourFtMiner />} />
      <Route path="dataset" element={<Dataset />} />
    </Route>
  )
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </QueryClientProvider>
  );
}

export default App;
