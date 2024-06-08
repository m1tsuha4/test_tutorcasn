import LoadingPage from "@/components/ui/Loading-Page";
import { toast } from "@/components/ui/use-toast"
import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { supabase } from "@/servers/supabase/supabaseClient";
import { useState } from "react"


export default function HapusDokumen({ id, title, setDeleteConfirmation, loading, setDeleteData }: any) {
    // Loading

    return (
        <>
            {loading && <LoadingPage />}
            <button className="cursor-pointer border border-black px-[1rem] py-[.3rem]"
                onClick={() => {
                    setDeleteConfirmation(true)
                    setDeleteData({
                        id,
                        title
                    })
                }}
            >
                Hapus
            </button>
        </>
    )
}