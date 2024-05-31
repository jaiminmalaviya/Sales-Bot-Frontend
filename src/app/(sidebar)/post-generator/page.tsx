"use client";

import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import PostWriter from "@/components/PostGenerator/postWriter";
import PostPreview from "@/components/PostGenerator/postPreview";

interface Post {
  _id: string;
  message: string;
}

const PostGenerator = () => {
  const [generatedPost, setGeneratedPost] = useState<Post>({
    message: "",
    _id: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Post Generator</h1>
        </div>
      </header>
      <main className="flex flex-1 text-xs border rounded-lg m-4">
        <div className="w-[55%]">
          <PostWriter
            setGeneratedPost={setGeneratedPost}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        </div>
        <PostPreview
          generatedPost={generatedPost}
          setGeneratedPost={setGeneratedPost}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default PostGenerator;
