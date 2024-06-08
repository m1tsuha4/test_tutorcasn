import Sidebar from "./_components/Sidebar";
import Navbar from "./_components/Navbar";
import { useContext } from "react";
import { AppContexs } from "../_app";

const LayoutDashboard = ({ children }: any) => {
  const { minimizeSidebar, setMinimizeSidebar } = useContext(AppContexs)
  return (
    <div className="h-full">
      <div
        id="border"
        className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50"
      >
        <Navbar />
      </div>
      <div
        id="border"
        className={`md-flex max-sm:hidden h-full ${!minimizeSidebar ? "w-[16rem]" : "w-[75px]"} flex-col fixed inset-y-0 z-50 duration-300`}
      >
        <Sidebar />
      </div>
      <main className={`${!minimizeSidebar ? "pl-[calc(16rem+3rem)]" : "pl-[calc(75px+3rem)]"} pr-10 pt-12 h-full mt-[80px] ml-[16px] duration-300 min-h-[100vh] bg-bg-workspace`}>
        {children}
      </main>
    </div>
  );
};

export default LayoutDashboard;
