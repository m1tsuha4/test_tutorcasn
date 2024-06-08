import { useState } from "react"


export default function FilterDocs() {

    const [filter, setFilter] = useState<boolean>(false)

    return (
        <div className="relative">
            <button id="border" className="py-[.5rem] px-[1rem] bg-white text-main-gray-text rounded-[.5rem] flex justify-center items-center gap-[.5rem]"
                onClick={() => setFilter(!filter)}
            >
                <i className={`bx bx-menu${filter ? "" : "-alt-right"} text-[1.5rem]`} ></i>
                <p>Filter</p>
            </button>
            {filter &&
                <div id="border" className="bg-white min-w-[150px] px-[1rem] py-[.5rem] absolute top-[calc(100%+.5rem)] right-0 rounded-[.5rem] flex flex-col gap-[.5rem] cursor-default text-main-gray-text">
                    <Option text={"Materi"} />
                    <Option text={"Quiz"} />
                    <Option text={"Soal"} />
                    <Option text={"2023"} />
                    <Option text={"2024"} />
                </div>
            }
        </div>
    )
}


const Option = ({ text }: any) => {
    return (
        <div className="flex items-center gap-[.5rem]">
            <input type="checkbox" className="p-[2rem]" />
            <label >{text}</label>
        </div>
    )
}