import { useState } from "react";
import Card from "../_components/Card";


export default function DocumentSearch({ docsSearchData }: any) {
    const [subCategoryId, setSubCategoryId] = useState<string>("")

    console.log("search Data SearchDocs:", docsSearchData)

    return (
        <div className="flex flex-col gap-[2rem]">

            <div className="">
                <h1 className="font-[600] text-[1.5rem]">
                    Hasil Pencarian :
                </h1>
            </div>

            <div className="grid grid-cols-4 gap-[1rem] font-[600]">
                {docsSearchData?.length !== 0 ?
                    <Card data={docsSearchData} href="#" />
                    :
                    <>
                        <p>Tidak ada dokumen yang sesuai...</p>
                    </>
                }
            </div>

        </div>
    )
}