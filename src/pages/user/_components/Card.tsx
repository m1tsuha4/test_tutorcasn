import Image from "next/image";
import Link from "next/link";
import image from "../../_assest/contoh.png";
import { useRouter } from "next/navigation";

interface card {
  data: any;
  href: string;
  noCategory?: boolean
}

export default function Card({ data, href, noCategory }: card) {
  const router = useRouter()
  const getDate = (date: any) => {
    const Dates = new Date(date);
    const year = Dates.getFullYear();
    return year;
  };

  const handleClick = (id: string, category: string) => {
    if (noCategory) {
      router.push(`/bahanAjar/${category}/${id}`)
    } else {
      router.push(`${href}/${id}`)
    }
  }
  return (
    <>
      {data?.map((item: any, i: number) => (
        <div
          key={i}
          // href={`${href}/${item.id}`}
          onClick={() => handleClick(item.id, item.categoryId)}
          id="border"
          className="flex flex-col justify-start items-center bg-white rounded-[20px] cursor-pointer overflow-hidden h-[300px] relative"
        >
          <img src={item.img} alt="" className="w-full" />
          <div className="absolute left-0 bottom-0 shrink-0 pt-[.5rem] pb-[1rem] px-[1rem] border-t border-main-border flex flex-col gap-[.5rem] w-full bg-[#1a1e259d] backdrop-blur-[5px]">
            <p className="text-white font-[500] whitespace-nowrap overflow-hidden text-ellipsis">{`${item.title.length > 50
              ? `${item.title.slice(0, 50)}...`
              : item.title
              }`} </p>
            <div className="flex items-center justify-between gap-[.5rem]">
              <div className="flex items-center gap-[.5rem]">
                <div className="bg-main rounded-[1rem] px-[1rem] py-[.35rem] text-[.8rem] flex justify-center items-center text-white">
                  <p>{item.category?.name}</p>
                </div>
                <div className="bg-bg-layout border border-main-gray-input rounded-[1rem] px-[1rem] py-[.35rem] text-[.8rem] flex justify-center items-center">
                  <p>{item.subCategory?.name}</p>
                </div>
              </div>
              <p className="text-[.9rem] text-white">
                {getDate(item.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
