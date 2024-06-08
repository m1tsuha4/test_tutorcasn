"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "./Icon";
import { useContext } from "react";
import { AppContexs } from "@/pages/_app";
interface activelink {
  icon: any;
  href: any;
  label: any;
}
const ActiveLink = ({ icon, href, label }: activelink) => {
  const router = useRouter();
  const pathname = usePathname();
  const { minimizeSidebar, setMinimizeSidebar } = useContext(AppContexs)

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

  return (
    <Link href={href} passHref>
      <div
        onClick={onClick}
        className={`${pathname?.toLowerCase().includes(label.toLowerCase()) ? "bg-main text-white font-[500]" : "text-main-gray-text font-[500]"}  flex items-center gap-2 mx-[.5rem] px-[1rem] py-[.8rem] rounded-[.5rem]`}
      >
        {/* <i className={`bx ${icon} text-[1.5rem] ${!pathname?.toLowerCase().includes(label.toLowerCase()) && "text-main-gray-text2"}`} /> */}
        {icon}

        {!minimizeSidebar &&
          <span className="text-sm">{label}</span>
        }
      </div>
    </Link>
  );
};

export default ActiveLink;
