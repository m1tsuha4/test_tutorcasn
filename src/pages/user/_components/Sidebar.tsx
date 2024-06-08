import SidebarRoute from "./SidebarRoute";
import Image from "next/image";
import Logo from "../../_assest/logo.png";
import LogoMinimize from "../../_assest/logo-minimize.png";
import test from "../../../../public/logo.png"
import { signOut, useSession } from "next-auth/react";
import { AppContexs } from "@/pages/_app";
import { useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = ({ category }: any) => {
  const { data } = useSession()
  const { minimizeSidebar, setMinimizeSidebar } = useContext(AppContexs)

  const { data: riwayat, error, isLoading } = api.document.getHistoryByUser.useQuery();

  // if (riwayat) {
  //   console.log("Riwayat : ", riwayat)
  // }

  return (
    <div className="relative shadow-xl bg-white h-full flex flex-col">
      <div className={`flex ${!minimizeSidebar ? "p-6 justify-between" : "p-[1rem] justify-center"}  items-center`}>
        {!minimizeSidebar ?
          <>
            <Image src={Logo} alt="" />
            <i className='bx bx-chevron-left text-[1.5rem] text-main-gray-text cursor-pointer'
              onClick={() => setMinimizeSidebar(true)}
            />
          </>
          :
          <Image src={LogoMinimize} alt="" className="w-[40px]" />
        }

      </div>
      <div className="mt-12 ">
        <SidebarRoute category={category} minimizeSidebar={minimizeSidebar} setMinimizeSidebar={setMinimizeSidebar} />
      </div>

      <div id="riwayat" className="px-[.5rem] mt-[1rem] flex flex-col gap-[2rem]">
        {!minimizeSidebar ?
          <>
            {/* <div className="flex flex-col gap-[.1rem]">
              {riwayat && riwayat?.lastAccessed &&
                <ButtonRiwayat heading={"Terakhir dilihat"} data={riwayat.lastAccessed} lastAccessed />
              }
            </div> */}
            <div className="flex flex-col gap-[.2rem]">
              {riwayat && riwayat?.today.length > 0 &&
                <ButtonRiwayat heading={"Hari ini"} data={riwayat.today} />
              }
            </div>
            <div className="flex flex-col gap-[.2rem]">
              {riwayat && riwayat.yesterday.length > 0 &&
                <ButtonRiwayat heading={"Kemarin"} data={riwayat.yesterday} />
              }
            </div>
          </>
          :
          <div className="w-full flex justify-center">
            <i className='bx bx-history text-[1.5rem] text-main cursor-pointer'
              onClick={() => setMinimizeSidebar(false)}
            />
          </div>
        }
      </div>

      <div id="logout" className="border-t border-main-gray-input absolute bottom-0 left-0 w-full p-4 flex items-center justify-between gap-[.5rem] bg-white">
        <div className={`flex gap-[.5rem] items-center ${minimizeSidebar && "w-full justify-center"}`}>
          <div className={`flex justify-center items-center w-[1.8rem] border border-main-gray-input rounded-full`}>
            <Image src={test} alt="" className="w-full" />
          </div>
          {!minimizeSidebar &&
            <p className="font-[600] capitalize">{data?.user.name}</p>}
        </div>
        {!minimizeSidebar &&
          <i className='bx bx-log-out text-[1.2rem] text-main-gray-text cursor-pointer hover:bg-main-gray-input duration-200 rounded-full p-[.2rem]'
            onClick={() => { signOut({ callbackUrl: "/" }) }}
          />}
      </div>
    </div>
  );
};

export default Sidebar;


const ButtonRiwayat = ({ data, heading, lastAccessed }: any) => {
  const pathname = usePathname();
  const [docId, setDocId] = useState<any>([])

  useEffect(() => {
    if (pathname?.includes("bahanAjar")) {
      const data = pathname.split("/")
      // console.log("Iddd1", data)
      const documentId = data[data.length - 1]
      setDocId(documentId)
    }
  }, [pathname])

  // console.log("Iddd", docId)

  return (
    <>
      <h1 className="text-main-gray-text text-[.9rem] pl-[.5rem]">{heading}</h1>
      {lastAccessed ?
        <Link href={`/bahanAjar/${data.document.categoryId}/${data.document.id}`} className={`cursor-pointer ${docId === data.document.id ? "bg-main text-white" : "bg-transparent active:bg-main hover:bg-main-hover hover:text-white text-black"} py-[.5rem] px-[.8rem] rounded-[.5rem] whitespace-nowrap text-[.9rem] overflow-x-hidden text-ellipsis`}>{data.document.title}</Link>
        :
        <>
          {
            data?.map((item: any) => (
              <Link href={`/bahanAjar/${item.document.categoryId}/${item.document.id}`} className={`cursor-pointer ${docId === item.document.id ? "bg-main text-white" : "bg-transparent active:bg-main hover:bg-main-hover hover:text-white text-black"} py-[.5rem] px-[.8rem] rounded-[.5rem] whitespace-nowrap text-[.9rem] overflow-x-hidden text-ellipsis`}>{item.document.title}</Link>
            ))
          }
        </>
      }
    </>
  )
}