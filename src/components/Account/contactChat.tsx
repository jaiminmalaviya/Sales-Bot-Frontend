import { ChatConversation } from "@/components/Chats/chatConversation";
import { SquareLoader } from "@/components/Common/loader";
import { toast } from "@/components/ui/use-toast";
import { ActiveChatProvider, useActiveChat } from "@/providers/ActiveChatContext";
import { useAuth } from "@/providers/AuthProvider";
import { UserContext } from "@/providers/UserProvider";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

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

interface ContactChatProps {
  chatId: string | undefined;
}

const ContactChat: React.FC<ContactChatProps> = ({ chatId }) => {
  const [chat, setChat] = useState<Chat | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const [totalCount, setTotalCount] = useState<number>(0);
  const { setActiveChat } = useActiveChat();
  const [skip, setSkip] = useState<number>(0);
  const limit = 10;

  useEffect(() => {
    if (chatId) setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      setIsLoading(true);
      const temp = await axios
        .get(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${chatId}`, {
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
  }, [chatId, user]);

  const fetchMore = async (offset: number) => {
    const results = await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${chatId}`, {
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

  if (!chatId) {
    return (
      <div className="flex m-auto items-center justify-center text-xl mt-52 font-bold">
        Chat Not Found
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 relative">
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
};

export default ContactChat;
