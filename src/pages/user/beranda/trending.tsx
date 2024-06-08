import { api } from "@/lib/api"
import Link from "next/link"
import image from "../../_assest/image 36.png"
import Image from "next/image"
import Card from "../_components/Card"


export default function Trending() {

    const { data: dokumen, error, isLoading } = api.document.getPopularDocuments.useQuery();

    const judul = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere sit sint dolore accusamus. Ducimus alias aspernatur odit beatae ab ad."
    return (
        <>
            <h1>Trending</h1>
            <div className="grid grid-cols-4 gap-[1rem]">
                <Card data={dokumen} href={"/bahanAjar"} noCategory={true} />
            </div>
        </>
    )
}