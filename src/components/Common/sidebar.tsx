"use client";

import {
  CaseStudiesIcon,
  ChatIcon,
  MenuIcon,
  PackageIcon,
  PostGeneratorIcon,
  UsersIcon,
} from "@/assets/icons";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

interface SidebarItem {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  href: string;
}

const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isIconOnly, setIsIconOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      { icon: PackageIcon, text: "Accounts", href: "/accounts" },
      { icon: UsersIcon, text: "Users", href: "/users" },
      { icon: CaseStudiesIcon, text: "Case Studies", href: "/case-studies" },
      { icon: ChatIcon, text: "Chats", href: "/chats" },
      {
        icon: PostGeneratorIcon,
        text: "Post Generator",
        href: "/post-generator",
      },
    ],
    []
  );

  useEffect(() => {
    const handleResize = () => {
      setIsIconOnly(window.innerWidth < 1256);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setActiveTab(`/${pathname.split("/")?.[1]}`);
  }, [pathname, sidebarItems]);

  const toggleIconOnly = () => {
    setIsIconOnly(!isIconOnly);
  };

  return (
    <>
      {user.isLoggedIn ? (
        <div
          className={`${
            isIconOnly ? "lg:w-[70px]" : "lg:w-64"
          }  border-r bg-gray-100/40 mr-auto flex dark:bg-gray-800/40 transition-all flex-col gap-2`}>
          <div className="flex h-[60px] items-center border-b px-4">
            {!isIconOnly && <h1 className="text-lg ml-2 font-semibold">Dashboard</h1>}
            <Button
              className="ml-auto shrink-0"
              size="icon"
              variant="ghost"
              id="sidebar-button-collapse-toggle"
              onClick={toggleIconOnly}
              disabled={window.innerWidth < 1256}>
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium space-y-2">
              {sidebarItems.map((item, idx) => (
                <Link
                  key={item.text}
                  href={item.href}
                  id={`sidebar-link-page-${idx}`}
                  className={`flex items-center gap-3 rounded-lg h-9 px-3 py-2 hover:bg-gray-200 active:bg-gray-300 text-gray-500 transition-all dark:text-gray-400 dark:hover:bg-gray-800 ${
                    activeTab === item.href
                      ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                      : ""
                  }`}>
                  {isIconOnly ? (
                    <item.icon className="h-4 w-4" />
                  ) : (
                    <>
                      <item.icon className="h-4 w-4" />
                      {item.text}
                    </>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : (
        <div
          className={`${
            isIconOnly ? "lg:w-[70px]" : "lg:w-64"
          }  border-r bg-gray-100/40 mr-auto flex dark:bg-gray-800/40 transition-all flex-col gap-2`}>
          <div className="flex h-[60px] items-center border-b px-4">
            {!isIconOnly && <h1 className="text-lg ml-2 font-semibold">Dashboard</h1>}
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium space-y-2">
              {Array.from(Array(4).keys()).map((i) => {
                return (
                  <div key={i} className="h-9 w-full flex items-center p-2 gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-3/5 rounded-full" />
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
