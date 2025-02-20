import {ClipLoader} from "react-spinners";

export default function FourFtDetailCallback() {
    return (
        <div className={'h-[calc(100vh-10rem)] w-screen flex items-center justify-center'}>
            <ClipLoader size={48} />
        </div>
    );
}