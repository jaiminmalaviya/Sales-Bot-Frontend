"use client";

import { useEffect, useRef, useState } from "react";
import CustomAvatar from "../ui/custom-avatar";
import ChatMessage from "./chatMessage";
import ChatTools from "./chatTools";
import { ThreeDotLoaderSM } from "../Common/loader";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import LoadingDot from "../ui/loading-dot";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { formatConversationMessageDate } from "@/lib/relativeDate";

type MessageFrom = "email" | "ai" | "linkedin" | "human";

interface Message {
  _id?: { $oid: string };
  type: "human" | "ai";
  content: string;
  feedback?: number;
  updatedAt: { $date: string };
  createdAt: { $date: string };
  message_from: MessageFrom;
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

interface ChatConversationProps {
  chat: Chat;
  token: string;
  total_messages: number;
  fetchMore: (offset: number) => Promise<Chat>;
}

function areDatesEqual(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function ChatConversation({
  chat,
  token,
  total_messages,
  fetchMore,
}: ChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>(chat?.messages || []);
  const [lastHumanMessage, setLastHumanMessage] = useState<string>("");
  const [offset, setOffset] = useState(1);
  const [isGeneratingAiMessage, setIsGeneratingAiMessage] = useState(false);
  const [isMessageFetching, setIsMessageFetching] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [scrollToBottom, toggleScrollToBottom] = useState(false);
  const [showSendEmailIcon, setShowSendEmailIcon] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState({
    message_id: "",
    message_content: "",
  });
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const loaderBoxRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(loaderBoxRef, {});
  let prevDate: Date | null = null;

  const appendMessage = (newMessage: Message) => {
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    toggleScrollToBottom((t) => !t);
  };

  const handleMessageEdit = (message_id: string, message_content: string) => {
    setIsEditingMessage(true);
    setEditedMessage({
      message_id,
      message_content,
    });
  };

  const editMessage = (messageId: string, newContent: string, messageFrom?: MessageFrom) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id?.$oid === messageId
          ? {
              ...message,
              content: newContent,
              ...(messageFrom !== undefined && {
                message_from: messageFrom,
                updatedAt: { $date: new Date().toISOString() },
              }),
            }
          : message
      )
    );
  };

  useEffect(() => {
    const lastHumanMessage = messages.find((message) => message.type === "human");
    const lastAiMessage =
      messages[0]?.type === "ai" && ["ai", "human"].includes(messages[0]?.message_from)
        ? messages[0]
        : null;
    setLastHumanMessage(lastHumanMessage ? lastHumanMessage.content : "How can I help you?");
    setShowSendEmailIcon(lastAiMessage ? lastAiMessage._id?.$oid || null : null);
  }, [messages]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
  }, [scrollToBottom]);

  useEffect(() => {
    (async () => {
      if (isVisible && messages.length < total_messages) {
        const el = scrollAreaRef.current;
        if (el && loaderBoxRef.current) {
          el.scrollBy({
            top: loaderBoxRef.current.clientHeight + 0.1,
            behavior: "instant",
          });
        }
        setIsMessageFetching(true);

        setTimeout(async () => {
          const newMessages = await fetchMore(offset);
          setMessages((msgs) => [...msgs, ...newMessages.messages]);
          setOffset((o) => o + 1);
          setIsMessageFetching(false);
        }, 1000);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, total_messages]);

  if (!chat) {
    return undefined;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative w-10 h-10">
          <CustomAvatar seed={chat.client + "1"} />
        </div>
        <div className="grid gap-1">
          <div className="font-semibold text-lg leading-none">{chat.client}</div>
          <div className="text-xs leading-none text-gray-500 dark:text-gray-400">
            {chat.company}
          </div>
        </div>
      </div>
      <div
        ref={scrollAreaRef}
        className={`flex-1 pb-0 ${
          isMessageFetching ? "overflow-hidden" : "overflow-scroll"
        } max-h-full -mb-[18px]`}
        id="scroll">
        <div
          className="flex gap-6 p-4"
          ref={chatAreaRef}
          style={{ flexDirection: "column-reverse" }}
          id="msgs">
          {isGeneratingAiMessage && <ThreeDotLoaderSM />}
          {messages.map((message, index) => {
            const isHuman: boolean = message.type === "human";
            const currentDate: Date = new Date(message.createdAt.$date);
            const shouldDisplayDate: boolean =
              prevDate === null || !areDatesEqual(currentDate, prevDate);
            const displayPrevDate = prevDate;
            prevDate = currentDate;
            return (
              <div key={index} className={`flex flex-col`}>
                <div
                  key={message.updatedAt.$date}
                  className={`flex ${
                    isHuman ? "self-end flex-row-reverse" : "self-start"
                  } items-start gap-4 max-w-[85%]`}>
                  <ChatMessage
                    id={`chat-message-${index}`}
                    client={chat.client}
                    sales_owner={chat.sales_owner}
                    isHuman={isHuman}
                    showSendEmailIcon={showSendEmailIcon === message._id?.$oid}
                    message={message}
                    handleMessageEdit={handleMessageEdit}
                    chatThreads={chat.threads}
                    editMessage={editMessage}
                  />
                </div>
                {shouldDisplayDate && displayPrevDate && (
                  <div className="text-center mt-6 relative text-gray-500">
                    <Badge variant={"default"} className="bg-gray-500">
                      {formatConversationMessageDate(displayPrevDate)}
                    </Badge>
                    <Separator className="absolute top-1/2 -z-10 bg-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="text-center mb-6 relative text-gray-500">
            <Badge variant={"default"} className="bg-gray-500">
              {formatConversationMessageDate(
                new Date(messages[messages.length - 1].createdAt.$date)
              )}
            </Badge>
            <Separator className="absolute top-1/2 -z-10 bg-gray-400" />
          </div>
          <div
            className="flex w-full h-1 items-center justify-center dark:text-white"
            ref={loaderBoxRef}>
            <LoadingDot isLoading={isMessageFetching} />
          </div>
        </div>
      </div>
      <ChatTools
        token={token}
        lastMessage={lastHumanMessage}
        appendMessage={appendMessage}
        isGeneratingAiMessage={isGeneratingAiMessage}
        setIsGeneratingAiMessage={setIsGeneratingAiMessage}
        isEditingMessage={isEditingMessage}
        setIsEditingMessage={setIsEditingMessage}
        editedMessage={editedMessage}
        setEditedMessage={setEditedMessage}
        editMessage={editMessage}
        toggleScrollToBottom={toggleScrollToBottom}
      />
    </div>
  );
}
