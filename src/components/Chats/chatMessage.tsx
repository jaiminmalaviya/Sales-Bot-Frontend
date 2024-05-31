import React, { useEffect, useState } from "react";
import CustomAvatar from "../ui/custom-avatar";
import {
  ChatGPTColorIcon,
  CheckIcon,
  ClipboardCopyIcon,
  GmailIcon,
  LinkedinIcon,
  MailIcon,
  PencilIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/assets/icons";
import { toast } from "../ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import axios from "axios";
import { ChatSendEmail } from "./chatSendEmail";

type MessageFrom = "email" | "ai" | "linkedin" | "human";

interface Message {
  _id?: { $oid: string };
  type: string;
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

interface ChatMessageProps {
  id: string;
  isHuman: boolean;
  message: Message;
  client: string;
  sales_owner: string;
  handleMessageEdit: (message_id: string, message_content: string) => void;
  chatThreads?: Thread[];
  showSendEmailIcon: boolean;
  editMessage: (messageId: string, newContent: string, messageFrom?: MessageFrom) => void;
}

export default function ChatMessage({
  isHuman,
  message,
  client,
  sales_owner,
  id,
  handleMessageEdit,
  chatThreads,
  showSendEmailIcon,
  editMessage,
}: ChatMessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [hasFeedback, setHasFeedback] = useState<boolean>(message.feedback !== undefined);
  const [feedback, setFeedback] = useState(1);
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const { user } = useAuth();

  const messageLines = message.content.split("\n");

  const handleMouseEnter = () => {
    setTimeout(() => {
      setShowOptions(true);
    }, 100);
  };
  const handleMouseLeave = () => {
    setTimeout(() => {
      setShowOptions(false);
    }, 300);
  };

  const handleFeedbackClick = async (e: any) => {
    if (!e.target.innerText || (e.target.innerText !== "1" && e.target.innerText !== "-1")) {
      return;
    }

    const text = e.target.innerText;
    let temp;

    if (String(feedback) !== text) {
      setHasFeedback(true);
      temp = Number(text);
    } else {
      temp = hasFeedback ? 0 : feedback;
      setHasFeedback((old) => !old);
    }
    await handleFeedback(temp);
  };

  const handleFeedback = async (feedbackValue: number) => {
    if (hasFeedback && feedback === feedbackValue) {
      return;
    }

    setFeedback(feedbackValue);

    try {
      if (user.token !== null) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${message._id!.$oid}/rate`,
          {
            value: feedbackValue,
            message: message.content,
            user_id: user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        console.error("User token is null.");
      }
    } catch (error: any) {
      console.error("Failed to submit feedback: ", error);
      setFeedback(feedback);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const getIcon = (letter: string) => {
    switch (letter) {
      case "1":
        return (
          <ThumbsUpIcon
            height={"16"}
            width={"16"}
            stroke={hasFeedback && feedback === 1 ? "green" : "black"}
            className="pointer-events-none"
          />
        );
      case "-1":
        return (
          <ThumbsDownIcon
            height={"16"}
            width={"16"}
            stroke={hasFeedback && feedback === -1 ? "red" : "black"}
            className="pointer-events-none"
          />
        );
      case "E":
        return <PencilIcon height={"15"} width={"15"} className="pointer-events-none" />;
      case "C":
        return (
          <ClipboardCopyIcon height={"14"} width={"14"} className="pointer-events-none h-4 w-4" />
        );
      case "R":
        return <CheckIcon height={"18"} width={"18"} className="pointer-events-none" />;
      case "SE":
        return <MailIcon height={"18"} width={"18"} className="pointer-events-none" />;
      default:
        return undefined;
    }
  };

  useEffect(() => {
    if (message.feedback) {
      setHasFeedback(true);
      setFeedback(message.feedback);
    } else {
      setHasFeedback(false);
      setFeedback(1);
    }
  }, [message]);

  return (
    <>
      <div className="relative w-8 h-8">
        <CustomAvatar seed={isHuman ? client + "1" : user.email + "1"} />
      </div>
      <div className="flex-shrink-[100] flex flex-col gap-2 items-start">
        <div className={`flex items-center gap-2 ${isHuman ? "self-end" : "self-start"}`}>
          <div
            className={`rounded-xl lg:max-w-[550px] xl:max-w-[600px] 2xl:max-w-[700px] ml-auto ${
              isHuman ? "bg-blue-100" : "bg-gray-100"
            } p-4 dark:bg-gray-900`}>
            <p className="text-sm">
              {messageLines.map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          {!isHuman && (
            <div
              className={`cursor-pointer flex justify-between gap-2`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}>
              <div
                className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ zIndex: 5 }}
                id={`${id}-like`}
                onClick={handleFeedbackClick}>
                <p className="opacity-0 absolute">1</p>
                {getIcon("1")}
              </div>
              <div
                className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
                style={showOptions ? { zIndex: 4 } : { zIndex: 4 }}
                onClick={handleFeedbackClick}
                id={`${id}-dislike`}>
                <p className="opacity-0 absolute">-1</p>
                {getIcon("-1")}
              </div>
              <div
                className="w-7 h-7 py-2 bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
                style={showOptions ? { zIndex: 3 } : { translate: "-130%", zIndex: 3 }}
                id={`${id}-copy`}
                onClick={() => {
                  navigator.clipboard.writeText(message.content);
                  setShowCheckIcon(true);
                  setTimeout(() => {
                    setShowCheckIcon(false);
                  }, 3000);
                }}>
                <p className="opacity-0 absolute">C</p>
                {showCheckIcon ? getIcon("R") : getIcon("C")}
              </div>
              <div
                className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
                id={`${id}-edit`}
                style={showOptions ? { zIndex: 2 } : { translate: "-385%", zIndex: 2 }}
                onClick={async () => {
                  handleMessageEdit(message._id!.$oid, message.content);
                }}>
                <p className="opacity-0 absolute">E</p>
                {getIcon("E")}
              </div>
              {showSendEmailIcon && (
                <div
                  className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
                  id={`${id}-send-email`}
                  style={showOptions ? { zIndex: 1 } : { translate: "-385%", zIndex: 1 }}>
                  <p className="opacity-0 absolute">E</p>
                  <ChatSendEmail
                    senderEmail={user.email}
                    messageBody={message.content}
                    threads={chatThreads}
                    messageId={message._id?.$oid}
                    editMessage={editMessage}>
                    {getIcon("SE")}
                  </ChatSendEmail>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={`${isHuman && "self-end"} flex gap-1.5 items-center`}>
          <div className="font-medium leading-none text-gray-800 dark:text-gray-400">
            {isHuman ? client : sales_owner}
          </div>
          <span className="leading-none text-gray-500">•</span>
          <time className="leading-none text-gray-500 dark:text-gray-400">
            {new Date(message.updatedAt.$date).toLocaleString("en-in", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          {message.message_from !== "human" && (
            <>
              <span className="leading-none text-gray-500">•</span>
              {message.message_from === "ai" && <ChatGPTColorIcon height={15} width={15} />}
              {message.message_from === "email" && <GmailIcon height={14} width={14} />}
              {message.message_from === "linkedin" && (
                <span className="w-[15px] h-[15px] bg-[#1052B8] inline-flex items-center justify-center rounded-full ring-2 ring-white text-white">
                  <LinkedinIcon />
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
