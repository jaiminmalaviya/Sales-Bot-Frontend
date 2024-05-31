import { SearchIcon } from "@/assets/icons";
import CustomAvatar from "../ui/custom-avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { formatMessageDate } from "@/lib/relativeDate";
import { useActiveChat } from "@/providers/ActiveChatContext";

interface ChatSidebarProps {
  users: {
    _id: { $oid: string };
    client: string;
    company: string;
    updatedAt: { $date: Date };
  }[];
}

export function ChatSidebar({ users }: ChatSidebarProps) {
  const path = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const getSorted = (arr: any[]) => {
    const temp = Array.from(arr);
    temp.sort((a: any, b: any) => {
      return (new Date(b?.updatedAt?.$date) as any) - (new Date(a?.updatedAt?.$date) as any) || 0;
    });

    return temp;
  };
  const { activeChat, setActiveChat } = useActiveChat();

  useEffect(() => {
    setActiveChat(path.split("/").slice(-1).join(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        router.replace("/chats");
      }
    });
  }, [router]);

  useEffect(() => {
    if (!search || search.trim() === "") {
      setChats(getSorted(users));
      return;
    }

    let temp = users;
    const regex = new RegExp(search.trim(), "i");
    temp = temp.filter((obj) => regex.test(obj.client) || regex.test(obj.company));

    setChats(getSorted(temp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, users]);

  if (!users || users.length === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center w-80 bg-gray-50 border-r p-4 border-gray-200 dark:border-gray-800">
        <p className="font-bold text-base">No chats found</p>
        <p className="text-gray-500 text-center mt-4">
          Start chat by generating an icebreaker for an{" "}
          <Link href="/accounts" className="text-blue-500 underline">
            Account
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-80 bg-gray-50 border-r py-4 border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-4 mx-4 mb-4 pb-[1px]">
        <div className="flex-1 min-w-0">
          <div className="hidden md:flex items-center relative">
            <SearchIcon className="w-4 h-4 left-[12px] text-gray-500 absolute dark:text-gray-400" />
            <Input
              aria-expanded="true"
              aria-owns="search-options"
              className="w-full bg-transparent pl-10 py-[19px] placeholder:text-[13px] text-base md:text-sm"
              id="chat-input-search"
              placeholder="Search"
              type="search"
              onChange={(e: any) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <ul className="grid">
          {chats.map((chat, idx) => (
            <div
              key={chat._id.$oid}
              className={
                activeChat === chat._id.$oid
                  ? "bg-slate-200 border-l-[6px] border-blue-700"
                  : "border-t-[1px]"
              }>
              <Link
                className="flex items-center gap-4 px-4 py-4"
                href={`/chats/${chat._id.$oid}`}
                id={`chat-link-conv-${idx}`}>
                <div className="relative w-10 h-10">
                  <CustomAvatar seed={chat.client + "1"} />
                </div>
                <div className="flex-1 grid gap-1">
                  <div className="font-semibold text-sm leading-none truncate">{chat.client}</div>
                  <div className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">
                    {chat.company}
                  </div>
                </div>
                <div className="text-xs self-baseline text-gray-500 dark:text-gray-400 text-right">
                  {formatMessageDate(new Date(chat.updatedAt.$date))}
                </div>
              </Link>
            </div>
          ))}
          <Separator />
        </ul>
      </ScrollArea>
    </div>
  );
}
