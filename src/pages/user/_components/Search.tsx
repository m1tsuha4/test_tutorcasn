import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Search = ({ setDocsSearchData, docsSearchData }: any) => {

    const router = useRouter()
    const pathname = usePathname()

    const [search, setSearch] = useState<string>("")
    const [categoryId, setCategoryId] = useState<string>("")

    // Get Category
    const { data: category, error, isLoading } = api.category.getAllCategories.useQuery();

    // Get searchData
    const { data: searchData, refetch } = api.document.searchDocs.useQuery(`${search}`)

    // Get searchDataByCategory
    const { data: searchDataByCategory, refetch: refetch2 } = api.document.searchDocsByCategory.useQuery({
        value: `${search}`,
        categoryId: categoryId
    })

    const handleSearch = (e: any) => {
        e.preventDefault();
        const value = document.getElementById("searchValue") as HTMLInputElement;
        console.log("searchValue: ", value.value)
        setSearch(`${value.value}`)
        refetch2()
        refetch()
        if (!pathname?.includes("search")) {
            localStorage.setItem("search", `${value.value}`)
            router.push("/search")
        }
    }

    useEffect(() => {
        if (categoryId === "") {
            setDocsSearchData(searchData)
        } else {
            setDocsSearchData(searchDataByCategory)
        }
    }, [searchData, searchDataByCategory])

    useEffect(() => {
        refetch2()
    }, [categoryId])

    useEffect(() => {
        const value = localStorage.getItem("search");
        const input = document.getElementById("searchValue") as HTMLInputElement;
        if (value) {
            input.value = value
            setSearch(value)
            localStorage.removeItem("search")
        }
    }, [])


    return (
        <form className="flex gap-[.5rem]"
            onSubmit={(e) => handleSearch(e)}
        >
            <div id="border" className="flex justify-between gap-2 rounded-[.5rem]">
                <input id="searchValue" type="text" placeholder="Cari bahan ajar..." className="outline-none py-[.5rem] px-[1rem] rounded-[.5rem]"
                />
                <div className="flex items-center justify-center gap-[.7rem] pr-[1rem]">
                    <p>di</p>
                    <div className="font-[600]">
                        {/* Seluruh Kategori */}
                        <select className="outline-none" onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">Seluruh Kategori</option>
                            {category?.map((item, i) => (
                                <option key={i} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <button type="submit" id="border" className="flex justify-center items-center font-[600] px-[1rem] cursor-pointer bg-main text-white rounded-[.5rem]">
                Cari
            </button>
        </form>
    )
};

export default Search;
