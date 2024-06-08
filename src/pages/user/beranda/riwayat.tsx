import { api } from "@/lib/api"
import Link from "next/link"
import image from "../../_assest/image 36.png"
import Image from "next/image"
import Card from "../_components/Card"
import { useEffect, useState } from "react"


export default function Riwayat() {

    const [riwayat, setRiwayat] = useState<any>([])

    const { data: document, error, isLoading } = api.document.getHistoryByUser.useQuery()

    if (document) {
        console.log(document)
    }

    useEffect(() => {
        if (document) {
            const today = document.today.map((item: any) => {
                return {
                    ...item.document
                }
            })
            const yesterday = document.yesterday.map((item: any) => {
                return {
                    ...item.document
                }
            })
            const riwayatData = [...today, ...yesterday]
            // setRiwayat([...document.today])
            console.log("Riwayat Beranda:", riwayatData)
            setRiwayat([...riwayatData])
        }
    }, [document])

    return (
        <>
            <h1>Riwayat Terakhir</h1>
            <div className="grid grid-cols-4 gap-[1rem]">
                <Card data={riwayat} href={"/bahanAjar"} noCategory={true} />
            </div>
        </>
    )
}