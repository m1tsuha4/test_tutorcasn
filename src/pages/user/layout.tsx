import Sidebar from "./_components/Sidebar";
import Navbar from "./_components/Navbar";
import { api } from "@/lib/api";
import Search from "./_components/Search";
import { useSession } from "next-auth/react";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AppContexs } from "../_app";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  minimizeSidebar: boolean;
  setMinimizeSidebar: (value: boolean) => void;
}

const Layout = ({ children, chat }: any) => {
  const pathname = usePathname()
  const { data: category, error, isLoading } = api.category.getAllCategories.useQuery();

  const { minimizeSidebar, showSidebar } = useContext(AppContexs)

  const [docsSearchData, setDocsSearchData] = useState<any>([])
  const [componentName, setComponentName] = useState<string>("")

  const { data: user } = useSession()

  const childrenWithProps = React.Children.map(children, (child: any) => {
    return React.cloneElement(child, { docsSearchData, setDocsSearchData });
  });

  useLayoutEffect(() => {
    if (childrenWithProps[0].props.children) {
      setComponentName(childrenWithProps[0].props.children[0]._owner.type.name)
    }
  }, [pathname])

  return (
    <div className="h-full pb-[2rem] min-h-[100vh]  bg-bg-layout">
      {!chat &&
        <div id="border" className={`h-[80px] pr-[1rem] fixed inset-y-0 w-full z-[50] flex justify-between bg-white ${!minimizeSidebar ? "md:pl-[16rem]" : "md:pl-[75px]"} duration-300`}>
          <div className="flex items-center justify-center pl-[3rem] font-[600]">
            <p>Selamat Datang, <span className="text-main capitalize">{user?.user.name}</span></p>
          </div>
          <div className="flex items-center justify-center">
            <Search setDocsSearchData={setDocsSearchData} docsSearchData={docsSearchData} />
          </div>
        </div>
      }
      <div id="border" className={`md-flex max-sm:hidden h-full ${!minimizeSidebar ? "w-[16rem]" : "w-[75px]"} flex-col fixed ${showSidebar && "z-[50]"} inset-y-0 duration-300`}>
        <Sidebar category={category} />
      </div>
      <main className={`${componentName === "DocViewerPage" && "fixed top-0 left-0 w-full h-full"} ${!chat ? "mt-[80px] md:pt-12 md:pr-10" : "mt-0 pt-0 pr-0"} ${!minimizeSidebar ? `${!chat ? "md:pl-[calc(16rem+3rem)]" : "md:pl-[16rem]"}` : `${!chat ? "md:pl-[calc(75px+3rem)]" : "md:pl-[75px]"}`} duration-300`}>
        {childrenWithProps}
      </main>
    </div>
  );
};

export default Layout;

