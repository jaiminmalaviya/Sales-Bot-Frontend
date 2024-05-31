import { Separator } from "@/components/ui/separator";
import { Skeleton } from "../ui/skeleton";
import {
  CheckIcon,
  ClipboardCopyIcon,
  CopyIcon,
  GlobeIcon,
  LinkedinIcon,
  PostReactionIcon,
} from "@/assets/icons";
import React, { useEffect, useRef, useState } from "react";
import CustomAvatar from "../ui/custom-avatar";
import { useAuth } from "@/providers/AuthProvider";
import PostTools from "./postTools";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import Link from "next/link";
import CopyBadgeLink from "./copyBadgeLink";

interface Post {
  _id: string;
  message: string;
  confidence_level?: string;
  post_status?: string;
  references?: string[];
}

type Props = {
  generatedPost: Post;
  isLoading: boolean;
  setGeneratedPost: React.Dispatch<React.SetStateAction<Post>>;
};

const PostPreview: React.FC<Props> = ({ generatedPost, setGeneratedPost, isLoading }) => {
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const handleInput = () => {
    if (ref.current) {
      const tempElement = document.createElement("div");
      tempElement.style.height = "auto";
      tempElement.style.fontSize = "14px";
      tempElement.style.lineHeight = "20px";
      tempElement.style.position = "absolute";
      tempElement.style.top = "9999px";
      tempElement.style.width = ref.current.offsetWidth + "px";
      tempElement.innerText = ref.current.value;
      document.body.appendChild(tempElement);

      const scrollHeight = tempElement.scrollHeight;
      document.body.removeChild(tempElement);
      ref.current.style.height = scrollHeight + 30 + "px";
    }
  };

  const renderHashtags = (text: string) => {
    const regex = /([^#]+)|(#\w+)/g;

    const parts = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[0] !== " ") {
        parts.push(match[0]);
      }
    }

    return parts.map((part, index) => {
      if (part.match(/^#(\w+)/)) {
        return (
          <span key={index} className="text-[#0A66C2] font-medium inline-block mr-2">
            {part}
          </span>
        );
      } else {
        return <React.Fragment key={index}>{part}</React.Fragment>;
      }
    });
  };

  useEffect(() => {
    setIsEditingContent(false);
  }, [isLoading]);

  useEffect(() => {
    handleInput();
  }, [editedContent, isEditingContent]);

  return (
    <div className="flex-1 xl:border-l max-xl:border-t">
      <div className="flex items-center mt-2 px-4 py-2">
        <h1 className="text-xl font-semibold">Post Preview</h1>
      </div>
      <Separator />
      <div className="2xl:max-w-[520px] xl:max-w-[480px] max-w-[500px] px-4 my-8 mx-auto">
        <div className="overflow-hidden bg-white rounded-lg shadow font-system ring-1 ring-inset ring-gray-200">
          <div className="py-5 pl-4 pr-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="relative inline-block shrink-0">
                    <div className="object-cover bg-gray-300 rounded-full w-12 h-12">
                      <CustomAvatar seed={user.email + "1"} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#1052B8] inline-flex items-center justify-center rounded-full ring-2 ring-white text-white">
                      <LinkedinIcon />
                    </span>
                  </span>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-sm">{user.name}</div>
                    </div>
                    <div className="text-gray-500 truncate max-w-[80%]">
                      LinkedIn Top Voice | Inspiring Growth Through Technology 🚀 | Chief
                      People&lsquo;s Officer 👬 | Transforming Culture & Talent in the IT Service
                      Industry | Director & Co-Founder AlphaBI
                    </div>
                    <div className="text-gray-500 flex gap-1">
                      <span>Now</span>
                      <span>•</span>
                      <GlobeIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative mt-5">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[55%]" />
                </div>
              ) : isEditingContent ? (
                <Textarea
                  className="text-gray-900 w-full border-0 shadow-none p-1"
                  value={editedContent}
                  id="post-input-read-textarea"
                  ref={ref}
                  onInput={handleInput}
                  onChange={(e) => {
                    setEditedContent(e.target.value);
                  }}
                />
              ) : (
                <p className="text-sm font-normal text-gray-900 whitespace-pre-wrap">
                  {renderHashtags(generatedPost.message)}
                </p>
              )}
              {!isLoading && (
                <>
                  {generatedPost.references && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {generatedPost.references?.map((reference, index) => (
                        <CopyBadgeLink reference={reference} key={index} />
                      ))}
                    </div>
                  )}
                  {generatedPost.confidence_level && (
                    <div className="flex text-sm mt-4 items-center justify-between">
                      {generatedPost.post_status && (
                        <>
                          <Badge variant={"secondary"}>
                            Confidence Level: {generatedPost.confidence_level}
                          </Badge>
                          <Badge
                            variant={
                              generatedPost.post_status === "yes" ? "success" : "destructive"
                            }>
                            Post Status: {generatedPost.post_status}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="pt-1 pb-3 pl-4 pr-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start -ml-2">
                <PostReactionIcon />
                <span className="text-xs font-medium text-gray-500">78</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-xs font-medium text-gray-500">4 comments</span>
                <span className="text-xs font-medium text-gray-500">•</span>
                <span className="text-xs font-medium text-gray-500">1 repost</span>
              </div>
            </div>
            <hr className="mt-3 border-gray-200" />
            <PostTools
              generatedPost={generatedPost}
              isEditingContent={isEditingContent}
              setIsEditingContent={setIsEditingContent}
              editedContent={editedContent}
              setEditedContent={setEditedContent}
              setGeneratedPost={setGeneratedPost}
              isLoading={isLoading}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
