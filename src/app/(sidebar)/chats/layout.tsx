"use client";

import React, { useEffect, useState } from "react";
import { ChatSidebar } from "@/components/Chats/chatSidebar";
import axios from "axios";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import { ActiveChatProvider } from "@/providers/ActiveChatContext";
import { UserContext } from "@/providers/UserProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "@/assets/icons";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Page = ({ children }: React.PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const { user } = useAuth();

  const updateUserUpdatedAt = (userId: string, newUpdatedAt: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id.$oid === userId ? { ...user, updatedAt: { $date: newUpdatedAt } } : user
      )
    );
  };

  useEffect(() => {
    if (!user || user.name === null) {
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const temp = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/list?sales_owner=${user.name}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = temp.data.data;
        setUsers(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Chats</h1>
        </div>
      </header>
      <main className="p-4 flex gap-6 md:gap-8 md:p-0 text-xs">
        {loading ? (
          <div className="h-[calc(100vh-140px)] flex flex-1 flex-col border-0 border-gray-200 dark:border-gray-800">
            <div className="flex-1 flex overflow-hidden">
              <div className="hidden md:flex flex-col w-80 bg-gray-50 border-r p-4 border-gray-200 dark:border-gray-800">
                <div className="hidden md:flex items-center relative mb-4">
                  <SearchIcon className="w-4 h-4 left-[12px] text-gray-500 absolute dark:text-gray-400" />
                  <Input
                    aria-expanded="true"
                    aria-owns="search-options"
                    className="w-full bg-transparent pl-10 py-[19px] placeholder:text-[13px] text-base md:text-sm"
                    id="search"
                    placeholder="Search"
                    type="search"
                    disabled={true}
                  />
                </div>
                <Separator />
                {Array.from(Array(5).keys()).map((i) => {
                  return (
                    <div key={i} className="w-full h-16 flex gap-2 items-center border-b-2">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 flex flex-col justify-between gap-2">
                        <Skeleton className="w-4/5 h-2 rounded-full" />
                        <Skeleton className="w-3/5 h-2 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <UserContext.Provider value={{ updateUserUpdatedAt }}>
            <ActiveChatProvider>
              <div className="h-[calc(100vh-140px)] flex flex-1 flex-col border-0 border-gray-200 dark:border-gray-800">
                <div className="flex-1 flex overflow-hidden">
                  <ChatSidebar users={users} />
                  {children}
                </div>
              </div>
            </ActiveChatProvider>
          </UserContext.Provider>
        )}
      </main>
    </div>
  );
};

export default Page;
