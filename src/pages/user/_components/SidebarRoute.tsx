"use client";
import { FC, useEffect, useState } from "react";
import ActiveLink from "./ActiveLink";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IconDocument, IconDocumentAdmin, IconHome } from "@/pages/_assest/icon/icon";
import { Layers } from "lucide-react";

const routes = [
  {
    icon: "LayoutDashboard",
    href: "/beranda",
    label: "Beranda",
  },
  {
    icon: "LayoutDashboard",
    href: "/bahanAjar",
    label: "Bahan Ajar",
  },

];

const SidebarRoute = ({ category, minimizeSidebar, setMinimizeSidebar }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams()


  const [showBahanAjar, setShowBahanAjar] = useState<boolean>(false)

  useEffect(() => {
    if (pathname?.includes(`bahanAjar`)) {
      setShowBahanAjar(true)
    }
  }, [])

  return (
    <div className="relative">
      <div id="navigasi">
        <Link href={"/beranda"} passHref>
          <div
            className={`flex items-center space-x-3 py-2 px-4 ${pathname?.includes("beranda") && "bg-main"} mx-[.5rem] rounded-[.3rem] transition-all duration-500 ease-in-out font-semibold cursor-pointer ${minimizeSidebar && "justify-center"}`}
          >
            {/* <i className={`bx ${pathname?.includes("beranda") ? "bxs-home text-white" : " bx-home text-main"} text-[1.5rem]`} /> */}
            <IconHome className={`${pathname?.includes("beranda") ? "text-white" : " text-main-gray-text2"}`} active={pathname?.includes("beranda") ? true : false} />
            {!minimizeSidebar &&
              <span className={`text-sm ${pathname?.includes(`beranda`) ? "text-white font-[500]" : "text-main-gray-text font-[500]"}`}>Beranda</span>}
          </div>
        </Link>
        <div className={`${minimizeSidebar && "flex justify-center"}`}>
          <div
            onClick={() => {
              if (!minimizeSidebar) {
                setShowBahanAjar(!showBahanAjar)
              } else {
                setShowBahanAjar(true)
                setMinimizeSidebar(false)
              }
            }}
            className={`flex items-center justify-between space-x-3 py-2 px-4 mx-[.5rem] rounded-[.3rem] transition-all duration-500 ease-in-out font-semibold cursor-pointer ${minimizeSidebar && pathname?.includes("bahanAjar") && "bg-main"}`}
          >
            <div className="flex items-center  space-x-3">
              {/* <i className={`bx bx-food-menu text-[1.5rem] text-main ${minimizeSidebar && pathname?.includes("bahanAjar") && "text-white"} ${!minimizeSidebar && "text-main"}`} /> */}
              <IconDocument className={`text-[1.5rem] text-main-gray-text2 ${minimizeSidebar && pathname?.includes("bahanAjar") && "text-white"} ${!minimizeSidebar && "text-main"}`} active={minimizeSidebar && pathname?.includes("bahanAjar") ? true : false} />
              {!minimizeSidebar &&
                <span className="text-sm text-main-gray-text font-[500]">Bahan Ajar</span>
              }
            </div>
            {!minimizeSidebar &&
              <i className={`bx bx-chevron-${showBahanAjar ? "down" : "right"} text-[1.5rem] text-main-gray-text`}></i>}
          </div>
        </div>
        {showBahanAjar && !minimizeSidebar &&
          <div className="flex flex-col w-full items-end">
            {category?.map((item: any, i: number) => (
              <div className="w-full">
                <Link key={i} href={`/bahanAjar/${item.id}`} className={`py-[.5rem] flex items-center gap-[1rem] ml-[3rem] mr-[.5rem] px-4 cursor-pointer ${pathname?.includes(`${item.id}`) && "bg-main"} rounded-[.3rem] `}>
                  {/* <i className={`bx ${pathname?.includes(`${item.id}`) ? "bxs-layer text-white" : "bx-layer text-main-gray-text2"} text-[1.5rem]`} /> */}
                  <Layers className={`bx ${pathname?.includes(`${item.id}`) ? "bxs-layer text-white" : "bx-layer text-main-gray-text2"} text-[1.5rem]`} />
                  <p className={`text-sm font-[500] ${pathname?.includes(`${item.id}`) ? "text-white" : "text-main-gray-text2"} font-semibold`}>{item.name}</p>
                </Link>
              </div>
            ))}
          </div>
        }
      </div>
      <div className="w-[calc(100%-2rem)] mx-[1rem] bg-main-gray-input h-[2px] mt-[1rem]" />
    </div>
  );
};

export default SidebarRoute;
