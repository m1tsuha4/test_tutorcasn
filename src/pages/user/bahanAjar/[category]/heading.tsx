import { api } from "@/lib/api";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UrutkanDocs from "../../_components/UrutkanDocs";
import FilterDocs from "../../_components/FilterDocs";

interface heading {
    setSubCategoryId: any,
    subCategoryId: any,
    setDocsData: any,
    sort: any,
    setSort: any
}

export default function HeadingBahanAjar({ setSubCategoryId, subCategoryId, setDocsData, sort, setSort }: heading) {
    const params = useParams()
    const pathname = usePathname()

    const [subCategoryData, setSubCategoryData] = useState<any>([])

    const { data: subCategory, error, isLoading } =
        api.subcategory.getAllSubcategoryByCategoryId.useQuery(`${params?.category}`);

    useEffect(() => {
        if (subCategory) {
            setSubCategoryData(subCategory)
        }
    }, [subCategory]);

    useEffect(() => {
        setSubCategoryId("")
    }, [pathname])
    return (
        <div className="flex w-full justify-between items-center">
            <div className="flex items-center font-[600] gap-[.5rem]">
                <button className={`py-[.7rem] px-[1.5rem] ${!subCategoryId && "bg-main text-white"}  rounded-[.3rem]`}
                    onClick={() => setSubCategoryId("")}
                >
                    Semua
                </button>
                {subCategoryData?.map((item: any, i: number) => (
                    <button className={`py-[.7rem] px-[1.5rem] ${subCategoryId === item.id && "bg-main text-white"}  rounded-[.3rem]`}
                        onClick={() => setSubCategoryId(item.id)}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
            <div className="flex h-full items-center gap-[.5rem] font-[600]">
                <UrutkanDocs setDocsData={setDocsData} subCategoryId={subCategoryId} sort={sort} setSort={setSort} />
                <FilterDocs />
            </div>
        </div>
    )
}