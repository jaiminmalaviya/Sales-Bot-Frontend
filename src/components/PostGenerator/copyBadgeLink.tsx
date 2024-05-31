import React, { useState } from "react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { CheckIcon, CopyIcon } from "@/assets/icons";

interface CopyBadgeLinkProps {
  reference: string;
  key: number;
}

const CopyBadgeLink: React.FC<CopyBadgeLinkProps> = ({ reference, key }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Badge variant={"border"} className="max-w-[100%]" key={key}>
      <Link
        href={reference}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline truncate">
        {reference}
      </Link>
      <div className="cursor-pointer">
        {copied ? (
          <CheckIcon height={"14"} width={"14"} className="block ml-1" />
        ) : (
          <CopyIcon
            height={"14"}
            width={"14"}
            className="block mb-[1px] ml-1"
            onClick={handleCopy}
          />
        )}
      </div>
    </Badge>
  );
};

export default CopyBadgeLink;
