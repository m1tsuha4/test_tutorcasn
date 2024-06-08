import { api } from "@/lib/api"
import Link from "next/link"
import image from "../../_assest/image 36.png"
import Image from "next/image"
import Card from "../_components/Card"
import { useState } from "react"


export default function Terbaru() {

    const { data: dokumen, error, isLoading } = api.document.getAllDocument.useQuery()

    return (
        <>
            <h1>Terbaru</h1>
            <div className="grid grid-cols-4 gap-[1rem]">
                <Card data={dokumen} href={"/bahanAjar"} noCategory={true} />
            </div>
        </>
    )
}