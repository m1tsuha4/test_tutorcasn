"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
interface activelink {
  icon: any;
  href: any;
  label: any;
  category: any
}
const ActiveLink = ({ icon, href, label, category }: activelink) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams()

  const [showBahanAjar, setShowBahanAjar] = useState<boolean>(false)

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = (e: any) => {
    if (e.currentTarget.tagName === "FORM") {
      e.preventDefault();
    }

    router.push(href);
  };

  const activeStyle = isActive
    ? "bg-emerald-50 border-r-4 border-r-emerald-800"
    : "";

  useEffect(() => {
    if (pathname?.includes(`bahanAjar`)) {
      setShowBahanAjar(true)
    }
  }, [])

  return (
    <div className="">
      {label !== "Bahan Ajar" &&
        <Link href={href} passHref>
          <div
            onClick={onClick}
            className={`flex items-center space-x-3 py-2 px-8 hover:bg-emerald-50 hover:border-r-4 hover:border-r-emerald-800 ${activeStyle} transition-all duration-500 ease-in-out font-semibold cursor-pointer`}
          >
            <Icon name={icon} color="green" size={24} />
            <span className="text-sm text-emerald-700">{label}</span>
          </div>
        </Link>
      }
      {label === "Bahan Ajar" &&
        <div >
          <div
            onClick={() => { setShowBahanAjar(!showBahanAjar) }}
            className={`flex items-center space-x-3 py-2 pl-8 pr-[.5rem] transition-all duration-500 ease-in-out font-semibold cursor-pointer justify-between`}
          >
            <div className="flex items-center  space-x-3">
              <Icon name={icon} color="green" size={24} />
              <span className="text-sm text-emerald-700">{label}</span>
            </div>
            {showBahanAjar ?
              <i className='bx bx-chevron-down text-[1.5rem]'></i>
              :
              <i className='bx bx-chevron-right text-[1.5rem]'></i>
            }
          </div>
        </div>
      }
      {showBahanAjar && label === "Bahan Ajar" &&
        <div className="flex flex-col w-full items-end">
          {category?.map((item: any, i: number) => (
            <Link key={i} href={`${href}/${item.id}`} className={`py-[.5rem] w-[100%] flex items-center gap-[1rem] pl-[3rem] cursor-pointer ${pathname?.includes(item.id) && "border-r-4 border-r-emerald-800"}`}>
              <Icon name={icon} color="green" size={24} />
              <p className="text-sm text-emerald-700 font-semibold">{item.name}</p>
            </Link>
          ))}
        </div>
      }
    </div>
  );
};

export default ActiveLink;
