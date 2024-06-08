import SidebarRoute from "./SidebarRoute";
import Image from "next/image";
import img from "/public/logo.png";
import Logo from "../../_assest/logo.png";
import { signOut, useSession } from "next-auth/react";
import { useContext } from "react";
import { AppContexs } from "@/pages/_app";
import test from "../../../../public/logo.png"
import LogoMinimize from "../../_assest/logo-minimize.png";

const Sidebar = () => {
  const { minimizeSidebar, setMinimizeSidebar } = useContext(AppContexs)
  const { data } = useSession()
  return (
    <div className="shadow-xl bg-white h-full flex flex-col">
      <div className={`flex ${!minimizeSidebar ? "p-6 justify-between" : "p-[1rem] justify-center"}  items-center`}>
        {!minimizeSidebar ?
          <>
            <Image src={Logo} alt="" />
            <i className='bx bx-chevron-left text-[1.5rem] text-main-gray-text cursor-pointer'
              onClick={() => setMinimizeSidebar(true)}
            />
          </>
          :
          <Image src={LogoMinimize} alt="" className="w-[40px]" onClick={() => setMinimizeSidebar(false)} />
        }

      </div>
      <div className="mt-12 ">
        <SidebarRoute />
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
