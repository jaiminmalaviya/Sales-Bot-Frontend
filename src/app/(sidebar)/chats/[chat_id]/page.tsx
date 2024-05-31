"use client";

import { ChatConversation } from "@/components/Chats/chatConversation";
import { SquareLoader } from "@/components/Common/loader";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";

interface Message {
  _id?: { $oid: string };
  type: "human" | "ai";
  content: string;
  feedback?: number;
  updatedAt: { $date: string };
  createdAt: { $date: string };
  message_from: "email" | "ai" | "linkedin" | "human";
}

interface Thread {
  thread_id: string;
  subject: string;
  client_email: string;
}

interface Chat {
  _id: { $oid: string };
  client: string;
  company: string;
  sales_owner: string;
  messages: Message[];
  threads?: Thread[];
  linkedin_profile?: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

export default function Page({ params }: { params: { chat_id: string } }) {
  const [chat, setChat] = useState<Chat>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  const { chat_id } = params;
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const temp = await axios
        .get(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${chat_id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          params: {
            skip,
            limit,
          },
        })
        .then((res) => {
          setSkip(res.data.pagination.offset || 0);
          setTotalCount(res.data.pagination.total_count || 0);
          return res.data.data;
        })
        .catch((error: any) => {
          console.error(error);
          toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "Something went wrong",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });

      setChat(temp);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_id, user]);

  const fetchMore = async (offset: number) => {
    const results = await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${chat_id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        params: {
          skip: offset,
          limit,
        },
      })
      .then((res) => {
        setSkip(res.data.pagination.offset || 0);
        setTotalCount(res.data.pagination.total_count || 0);
        return res.data.data;
      })
      .catch((error: any) => {
        console.error(error);
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Something went wrong",
          variant: "destructive",
        });
      });

    return results;
  };

  if (chat_id === "id") {
    return undefined;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full">
        <SquareLoader />
      </div>
    );
  }

  if (!chat) {
    return undefined;
  }

  return (
    <ChatConversation
      chat={chat}
      token={user.token!}
      total_messages={totalCount}
      fetchMore={fetchMore}
    />
  );
}
