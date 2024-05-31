import React, { useCallback, useEffect, useState } from "react";
import {
  CheckIcon,
  ClipboardCopyIcon,
  PencilIcon,
  SaveMessageIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/assets/icons";
import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "../ui/use-toast";

interface Post {
  _id: string;
  message: string;
}

type PostToolsProps = {
  generatedPost: Post;
  isEditingContent: boolean;
  setIsEditingContent: React.Dispatch<React.SetStateAction<boolean>>;
  editedContent: string;
  setEditedContent: React.Dispatch<React.SetStateAction<string>>;
  setGeneratedPost: React.Dispatch<React.SetStateAction<Post>>;
  isLoading: boolean;
  user: {
    id: string | null;
    name: string | null;
    token: string | null;
  };
};

const PostTools: React.FC<PostToolsProps> = ({
  generatedPost,
  isEditingContent,
  setIsEditingContent,
  editedContent,
  setEditedContent,
  setGeneratedPost,
  isLoading,
  user,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState<number | null>(null);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(generatedPost.message).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  useEffect(() => {
    setFeedbackValue(null);
  }, [isLoading]);

  const handleEditMessage = useCallback(async () => {
    try {
      setIsEditingContent(false);
      setGeneratedPost((prev) => ({
        ...prev,
        message: editedContent,
      }));

      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/post`,
        { post_message: editedContent, post_id: generatedPost._id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setGeneratedPost((prev) => ({ ...prev, _id: data.data._id }));
      setFeedbackValue(null);
    } catch (error: any) {
      console.error("Failed to save and submit: ", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        variant: "destructive",
      });
    }
  }, [
    setIsEditingContent,
    setGeneratedPost,
    editedContent,
    generatedPost._id,
    setFeedbackValue,
    user.token,
  ]);

  const handleFeedback = async (feedback: number) => {
    if (feedback === feedbackValue) {
      return;
    }

    setFeedbackValue(feedback);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/post`,
        {
          post_id: generatedPost._id,
          post_content: generatedPost.message,
          sales_owner: user.name,
          sales_owner_id: user.id,
          value: feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error("Failed to submit feedback: ", error);
      setFeedbackValue(0);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        handleEditMessage();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleEditMessage]);

  return (
    <div className="flex items-center justify-between mt-2">
      <Button
        variant={"ghost"}
        className={`flex items-center justify-center gap-1.5 px-1.5 py-2 text-sm font-semibold ${
          feedbackValue === 1
            ? "text-blue-700 hover:text-blue-700"
            : "text-gray-500"
        }`}
        id="post-button-read-like"
        onClick={() =>
          feedbackValue === 1 ? handleFeedback(0) : handleFeedback(1)
        }
        disabled={generatedPost._id === ""}
      >
        <ThumbsUpIcon
          className="w-5 h-5 mb-1"
          fill={feedbackValue === 1 ? "rgb(59 130 246)" : "white"}
        />
        Like
      </Button>
      <Button
        variant={"ghost"}
        className={`flex items-center justify-center gap-1.5 px-1.5 py-2 text-sm font-semibold ${
          feedbackValue === -1
            ? "text-red-700 hover:text-red-700"
            : "text-gray-500"
        }`}
        onClick={() =>
          feedbackValue === -1 ? handleFeedback(0) : handleFeedback(-1)
        }
        id="post-button-read-dislike"
        disabled={generatedPost._id === ""}
      >
        <ThumbsDownIcon
          className="w-5 h-5 mt-1"
          fill={feedbackValue === -1 ? "rgb(239 68 68)" : "white"}
        />
        Dislike
      </Button>
      <Button
        variant={"ghost"}
        className="flex items-center justify-center gap-1.5 px-1.5 py-2 text-sm font-semibold text-gray-500"
        onClick={handleCopyClick}
        id="post-button-read-copy"
        disabled={generatedPost._id === ""}
      >
        {copied ? (
          <>
            <CheckIcon className="w-[18px] h-[18px]" /> Copied
          </>
        ) : (
          <>
            <ClipboardCopyIcon className="w-[18px] h-[18px]" /> Copy
          </>
        )}
      </Button>
      {isEditingContent ? (
        <Button
          className="flex relative items-center justify-center gap-2 px-2 bg-green-500 hover:bg-green-600 h-8 text-white"
          onClick={handleEditMessage}
          id="post-button-read-save"
        >
          <SaveMessageIcon />
          Save
          <span className="absolute -bottom-[18px] right-0 text-[11px] text-gray-700/75 font-medium">
            Press <span className="font-bold"> Shift+Enter</span> to send
            message
          </span>
        </Button>
      ) : (
        <Button
          variant={"ghost"}
          className="flex items-center justify-center gap-1.5 px-1.5 py-2 text-sm font-semibold text-gray-500"
          onClick={() => {
            setEditedContent(generatedPost.message);
            setIsEditingContent(true);
          }}
          disabled={generatedPost._id === ""}
          id="post-button-read-edit"
        >
          <PencilIcon className="w-[18px] h-[18px]" />
          Edit
        </Button>
      )}
    </div>
  );
};

export default PostTools;
