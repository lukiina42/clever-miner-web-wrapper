import './App.css'
import {QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dataset from "./Dataset.tsx";

// Create a client
const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Dataset />
    </QueryClientProvider>
  )
}

export default App
