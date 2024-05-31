import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "../ui/separator";
import { useActiveChat } from "@/providers/ActiveChatContext";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "../ui/use-toast";
import { CircleLoader } from "../Common/loader";
import { UserContext } from "@/providers/UserProvider";

type MessageFrom = "email" | "ai" | "linkedin" | "human";

interface Thread {
  thread_id: string;
  subject: string;
  client_email: string;
}

interface ChatSendEmailProps {
  children?: React.ReactNode;
  senderEmail?: string | null;
  messageBody: string;
  threads?: Thread[];
  messageId?: string;
  editMessage: (messageId: string, newContent: string, messageFrom?: MessageFrom) => void;
}

export const ChatSendEmail: React.FC<ChatSendEmailProps> = ({
  children,
  senderEmail,
  messageBody,
  threads,
  messageId,
  editMessage,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState(messageBody);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { activeChat } = useActiveChat();
  const { updateUserUpdatedAt } = useContext(UserContext)!;

  const [selectedThread, setSelectedThread] = useState<Thread>(() => {
    return threads ? threads[0] : { thread_id: "", client_email: "", subject: "" };
  });

  const handleThreadChange = (threadId: string) => {
    const thread = threads?.find((thread) => thread.thread_id === threadId);
    if (thread) {
      setSelectedThread(thread);
    }
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const sendEmail = async () => {
    try {
      setLoading(true);
      if (
        message.trim().length <= 0 ||
        !selectedThread.thread_id ||
        !selectedThread.client_email ||
        !messageId ||
        !activeChat
      ) {
        let errorMessage = "Something went wrong";
        if (message.trim().length <= 0) errorMessage = "Please enter a message.";
        else if (!selectedThread.thread_id) errorMessage = "Email chat has not been initiated.";
        else if (!selectedThread.client_email) errorMessage = "Client email is unavailable.";
        return toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/gmail/send/${user.email}`,
        {
          recipient_email: selectedThread.client_email,
          message_body: message,
          subject: selectedThread.subject,
          thread_id: selectedThread.thread_id,
          message_id: messageId,
          chat_id: activeChat,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      );
      editMessage(messageId!, message, "email");
      updateUserUpdatedAt(activeChat, new Date().toISOString());

      toast({
        title: "Success",
        description: data.message,
        variant: "success",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMessage(messageBody);
  }, [open, messageBody]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"icon"} className="focus-visible:ring-0">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden gap-0 outline-0 min-w-[620px]">
        <DialogHeader className="bg-blue-50 px-5 py-2 flex-row items-center justify-between pr-10">
          <DialogTitle>New message</DialogTitle>
          <Select defaultValue={threads && threads[0].thread_id} onValueChange={handleThreadChange}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Subject</SelectLabel>
                {threads?.map((thread) => (
                  <SelectItem
                    className="max-w-[420px] truncate"
                    key={thread.thread_id}
                    value={thread.thread_id}>
                    {thread.subject}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </DialogHeader>
        <div className="px-5 w-auto">
          <div className="">
            <div className="my-2 flex">
              <span className="font-medium text-black mr-2">To:</span>
              <span className="line-clamp-1 text-gray-600">{selectedThread.client_email}</span>
            </div>
            <Separator />
            <div className="my-2 flex">
              <span className="font-medium text-black mr-2">Subject:</span>
              <span className="line-clamp-1 text-gray-600">{selectedThread.subject}</span>
            </div>
            <Separator />
            <div className="my-2 flex">
              <span className="font-medium text-black mr-2">From:</span>
              <span className="line-clamp-1 text-gray-600">{senderEmail}</span>
            </div>
            <Separator />
            <div className="mt-2">
              <Textarea
                className="min-h-[300px] border-0 shadow-none focus-visible:ring-0 resize-none px-0"
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={handleMessageChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="mx-5 my-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={sendEmail} disabled={loading}>
            {loading && <CircleLoader />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
