import { Loader2 } from "lucide-react";

export default function LoadingPage() {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[100] bg-[#00000036]">
            <Spinner />
        </div>
    )
}

export function Spinner() {
    return <Loader2 className={`mr-2 h-[5rem] w-[5rem] animate-spin`} />;
}