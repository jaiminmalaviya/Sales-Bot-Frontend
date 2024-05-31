import React, { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";

interface IconWithTooltipProps {
  tooltipText: string;
  onClick?: () => void;
  children?: ReactNode;
}

const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ tooltipText, onClick, children }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="link" className="p-1 focus-visible:ring-0" onClick={onClick}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IconWithTooltip;
