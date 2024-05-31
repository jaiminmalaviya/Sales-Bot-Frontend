import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ChatGPTIcon, MailIcon, SendMessageIcon } from "@/assets/icons";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { useActiveChat } from "@/providers/ActiveChatContext";
import { UserContext } from "@/providers/UserProvider";

interface Message {
  _id?: { $oid: string };
  type: "human" | "ai";
  content: string;
  feedback?: number;
  updatedAt: { $date: string };
  createdAt: { $date: string };
  message_from: "email" | "ai" | "linkedin" | "human";
}

interface ChatToolsProps {
  token: string;
  appendMessage: (newMessage: Message) => void;
  isGeneratingAiMessage: boolean;
  setIsGeneratingAiMessage: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingMessage: boolean;
  setIsEditingMessage: React.Dispatch<React.SetStateAction<boolean>>;
  editedMessage: {
    message_id: string;
    message_content: string;
  };
  setEditedMessage: React.Dispatch<
    React.SetStateAction<{
      message_id: string;
      message_content: string;
    }>
  >;
  editMessage: (messageId: string, newContent: string) => void;
  lastMessage: string;
  toggleScrollToBottom: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatTools: React.FC<ChatToolsProps> = ({
  token,
  appendMessage,
  isGeneratingAiMessage,
  setIsGeneratingAiMessage,
  isEditingMessage,
  setIsEditingMessage,
  editedMessage,
  setEditedMessage,
  editMessage,
  lastMessage,
  toggleScrollToBottom,
}) => {
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [textarea1Content, setTextarea1Content] = useState("");
  const [textarea2Content, setTextarea2Content] = useState("");
  const { activeChat } = useActiveChat();
  const { updateUserUpdatedAt } = useContext(UserContext)!;

  const ref = useRef<HTMLDivElement>(null);
  const textareaRef1 = useRef<HTMLTextAreaElement>(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      if (isSwitchOn && textareaRef1.current) {
        textareaRef1.current.style.height = `${textareaRef1.current.scrollHeight}px`;
        ref.current.style.height = `${textareaRef1.current.scrollHeight + 44}px`;
      } else if (!isSwitchOn && textareaRef1.current && textareaRef2.current) {
        const maxHeight = Math.max(
          textareaRef1.current.scrollHeight,
          textareaRef2.current.scrollHeight
        );
        ref.current.style.height = `${maxHeight + 44}px`;
        textareaRef1.current.style.height = `${textareaRef1.current.scrollHeight}px`;
        textareaRef2.current.style.height = `${textareaRef2.current.scrollHeight}px`;
      }
    }
  };

  const sendMessage = useCallback(async () => {
    try {
      const messageToSend = textarea1Content.trim() || textarea2Content.trim();

      if (!messageToSend) {
        return;
      }

      const formData = {
        client_message: messageToSend,
        use_ai: isSwitchOn,
        message_type: textarea1Content ? "human" : "ai",
      };

      if (textarea1Content) {
        const newMessage: Message = {
          type: textarea1Content ? "human" : "ai",
          content: messageToSend,
          updatedAt: { $date: new Date().toISOString() },
          createdAt: { $date: new Date().toISOString() },
          message_from: "human",
        };
        appendMessage(newMessage);
      }
      setTextarea1Content("");
      setTextarea2Content("");
      updateUserUpdatedAt(activeChat, new Date().toISOString());
      (isSwitchOn || textarea2Content) &&
        (setIsGeneratingAiMessage(true), toggleScrollToBottom((t) => !t));

      const {
        data: { data },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${activeChat}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      if (isSwitchOn || textarea2Content) {
        const newAiMessage: Message = {
          type: data.type,
          _id: { $oid: data._id },
          content: data.content,
          updatedAt: { $date: data.updatedAt },
          createdAt: { $date: data.updatedAt },
          message_from: data.message_from,
        };
        appendMessage(newAiMessage);
      }

      updateUserUpdatedAt(activeChat, new Date().toISOString());
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAiMessage(false);
    }
  }, [
    activeChat,
    appendMessage,
    isSwitchOn,
    setIsGeneratingAiMessage,
    setTextarea1Content,
    setTextarea2Content,
    textarea1Content,
    textarea2Content,
    updateUserUpdatedAt,
    token,
  ]);

  const handleGenerateWithAI = async () => {
    try {
      if (!lastMessage) {
        return;
      }
      setIsGeneratingAiMessage(true);
      toggleScrollToBottom((t) => !t);

      updateUserUpdatedAt(activeChat, new Date().toISOString());
      const formData = {
        client_message: lastMessage,
        use_ai: true,
        message_type: "human",
        generate_with_ai: true,
      };
      const {
        data: { data },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${activeChat}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );
      const newAiMessage: Message = {
        type: data.type,
        _id: { $oid: data._id },
        content: data.content,
        updatedAt: { $date: data.updatedAt },
        createdAt: { $date: data.updatedAt },
        message_from: "ai",
      };
      appendMessage(newAiMessage);
      updateUserUpdatedAt(activeChat, new Date().toISOString());
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAiMessage(false);
    }
  };

  const handleEditMessage = useCallback(async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/chat/${editedMessage.message_id}`,
        { client_message: textarea1Content.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      editMessage(editedMessage.message_id, textarea1Content.trim());
      setTextarea1Content("");
      setIsEditingMessage(!isEditingMessage);
    } catch (error: any) {
      console.error("Failed to save and submit: ", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [
    editedMessage,
    editMessage,
    isEditingMessage,
    setIsEditingMessage,
    setTextarea1Content,
    token,
    textarea1Content,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        isEditingMessage ? handleEditMessage() : sendMessage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sendMessage, handleEditMessage, isEditingMessage]);

  useEffect(() => {
    if (isEditingMessage) {
      setIsSwitchOn(true);
      setTextarea1Content(editedMessage.message_content);
    }
  }, [isEditingMessage, editedMessage]);

  useEffect(() => {
    handleInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textarea1Content, textarea2Content]);

  return (
    <div
      ref={ref}
      className={`border rounded-md flex flex-col justify-between items-center max-h-60 mb-2 mt-1 mx-4 focus-visible:ring-1 ${
        isTextareaFocused ? "ring-1 ring-ring" : ""
      }`}>
      {isSwitchOn ? (
        <Textarea
          ref={textareaRef1}
          id="chat-input-conv-textarea-1"
          onInput={handleInput}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={() => setIsTextareaFocused(false)}
          className="resize-none flex-1 max-h-48 shadow-none border-none focus-visible:ring-0"
          placeholder="Client message here"
          value={textarea1Content}
          onChange={(e) => setTextarea1Content(e.target.value)}
        />
      ) : (
        <div className="flex flex-1 w-full">
          <div className="flex flex-col relative flex-1 w-full">
            <Textarea
              ref={textareaRef2}
              id="chat-input-conv-textarea-2"
              onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                handleInput();
                setTextarea2Content(e.target.value);
              }}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              className={`resize-none flex-1 max-h-48 shadow-none border-none focus-visible:ring-0`}
              placeholder="Your message here"
              value={textarea2Content}
              onChange={(e) => setTextarea2Content(e.target.value)}
              disabled={!!textarea1Content && !textarea2Content}
            />
          </div>
          <Separator orientation="vertical" className="bg-gray-400" />
          <div className="flex relative flex-col flex-1 w-full">
            <Textarea
              id="chat-input-conv-textarea-1"
              ref={textareaRef1}
              onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                handleInput();
                setTextarea1Content(e.target.value);
              }}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              className="resize-none flex-1 max-h-48 shadow-none border-none focus-visible:ring-0"
              placeholder="Client message here"
              value={textarea1Content}
              onChange={(e) => setTextarea1Content(e.target.value)}
              disabled={!!textarea2Content && !textarea1Content}
            />
          </div>
        </div>
      )}
      <div className="flex w-full px-3 pb-2 justify-between relative mb-0.5">
        <div className="flex items-center space-x-2">
          <Label htmlFor="chat-switch" className="text-base">
            <ChatGPTIcon />
          </Label>
          <Switch
            id="chat-switch"
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
            defaultChecked={isSwitchOn}
            onCheckedChange={(e: boolean) => {
              setIsSwitchOn(e);
              setTextarea1Content("");
              setTextarea2Content("");
            }}
            checked={isSwitchOn}
            disabled={isEditingMessage}
          />
        </div>

        {isEditingMessage ? (
          <div className="flex gap-2">
            <Button
              className=" h-8 p-0 px-3"
              id="chat-button-edit-cancel"
              variant={"outline"}
              onClick={() => {
                setEditedMessage({
                  message_content: "",
                  message_id: "",
                });
                setTextarea1Content("");
                setIsEditingMessage(false);
              }}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 h-8 p-0 px-3 text-white"
              onClick={handleEditMessage}
              id="chat-button-edit-confirm">
              Edit
            </Button>
          </div>
        ) : (
          <div className="flex">
            <Button
              className="h-8 p-0 px-3 mr-2 text-white"
              variant={"default"}
              onClick={handleGenerateWithAI}
              id="chat-generate-with-ai-button"
              disabled={isGeneratingAiMessage}>
              Generate with AI
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 h-8 p-0 px-3 text-white"
              variant={"icon"}
              onClick={sendMessage}
              disabled={isGeneratingAiMessage}
              id="chat-button-send">
              <SendMessageIcon />
            </Button>
          </div>
        )}
        <span className="absolute -bottom-[6px] right-3 text-[11px] text-gray-700 font-medium">
          Press <span className="font-bold"> Shift+Enter</span> to send message
        </span>
      </div>
    </div>
  );
};

export default ChatTools;
