import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
import '../../App.css'
import {QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import FileField from "@/components/form/FileField.tsx";
import {z} from "zod";
import useZodForm from "@/components/form/useZodForm.ts";
import {BeatLoader} from "react-spinners";
import {Link, Route, Routes} from "react-router-dom";
import Dataset from "../Dataset/Dataset.tsx";
import FourFtMiner from "../4ftminer/FourFtMiner.tsx";

export default function Home() {
    return (
        <div className={'flex flex-col min-h-screen h-screen w-screen'}>
            <nav className={'flex gap-2 h-8 border-b-2 border-gray-200'}>
                <Link to="4ft-miner">4ft-miner</Link>
                <Link to="dataset">Dataset</Link>
            </nav>
            <div className={'flex w-full h-[calc(100%-2rem)]'}>
                <Routes>
                    <Route path="dataset" element={<Dataset />} />
                    <Route path="4ft-miner" element={<FourFtMiner />} />
                </Routes>
            </div>
        </div>

    )
}