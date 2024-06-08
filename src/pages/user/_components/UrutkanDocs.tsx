import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"


export default function UrutkanDocs({ setDocsData, subCategoryId, sort, setSort }: any) {

    const [option, setOption] = useState<string>("")

    return (
        <div className="relative z-[60]">
            {sort && option !== "" &&
                <GetSortAscending setDocsData={setDocsData} subCategoryId={subCategoryId} option={option} />
            }
            <button id="border" className="py-[.5rem] px-[1rem] bg-white text-main-gray-text rounded-[.5rem] flex justify-center items-center gap-[.5rem]"
                onClick={() => setSort(!sort)}
            >
                <p>Urutkan</p>
                <i className={`bx bx-chevron-${sort ? "up" : "down"} text-[1.5rem]`}></i>
            </button>
            {sort &&
                <div id="border" className="bg-white min-w-[150px] absolute top-[calc(100%+.5rem)] left-0 rounded-[.5rem] flex flex-col overflow-hidden cursor-default text-main-gray-text">
                    <div
                        onClick={() => setOption("ascending")}
                    >
                        <Button text={"A-Z"} active={option === "ascending" ? true : false} />
                    </div>
                    <div
                        onClick={() => setOption("latest")}
                    >
                        <Button text={"Terbaru"} active={option === "latest" ? true : false} />
                    </div>
                    <div
                        onClick={() => setOption("popular")}
                    >
                        <Button text={"Populer"} active={option === "popular" ? true : false} />
                    </div>
                </div>
            }
        </div>
    )
}

const Button = ({ text, active }: any) => {
    return (
        <button className={`text-start hover:bg-main-hover hover:text-white duration-200 w-full py-[.5rem] px-[1rem] ${active && "text-white bg-main"}`}>
            {text}
        </button>
    )
}

const GetSortAscending = ({ setDocsData, subCategoryId, option }: any) => {

    const params = useParams();
    const { data, isLoading }: any = api.document.sortDocumentByCategoryAndSubId.useQuery({
        categoryId: `${params?.category}`,
        subCategoryId: subCategoryId,
        option
    })

    if (data) {
        console.log("sort", data)
    }

    useEffect(() => {
        if (data) {
            setDocsData([...data])
        }
    }, [data])

    return null
}