"use client";
import { FC } from "react";
import ActiveLink from "./ActiveLink";
import { Link } from "lucide-react";
import { IconCategoryAdmin, IconDocumentAdmin, IconUserAdmin } from "@/pages/_assest/icon/icon";
import { usePathname } from "next/navigation";


const SidebarRoute: FC = () => {
  const pathname = usePathname()

  const routes = [
    {
      icon: <IconUserAdmin w={20} className={`text-[1.5rem] ${!pathname?.toLowerCase().includes("user") ? "text-main-gray-text2" : "text-white"}`} active={pathname?.toLowerCase().includes("user") ? true : false} />,
      href: "/admin/user",
      label: "User",
    },
    {
      icon: <IconDocumentAdmin w={20} className={`text-[1.5rem] ${!pathname?.toLowerCase().includes("document") ? "text-main-gray-text2" : "text-white"}`} active={pathname?.toLowerCase().includes("document") ? true : false} />,
      href: "/admin/document",
      label: "Document",
    },
    {
      icon: <IconCategoryAdmin w={20} className={`text-[1.5rem] ${!pathname?.toLowerCase().includes("category") ? "text-main-gray-text2" : "text-white"}`} />,
      href: "/admin/category",
      label: "Category",
    },
  ];
  return (
    <div className="flex flex-col gap-[.5rem]">
      {routes.map((route, index) => (
        <ActiveLink
          key={index}
          icon={route.icon}
          href={route.href}
          label={route.label}
        />
      ))}
    </div>
  );
};

export default SidebarRoute;
