import React, { createContext, useContext, useState } from "react";

interface ActiveChatProviderProps {
  children: React.ReactNode;
}

interface ActiveChatContextType {
  activeChat: string;
  setActiveChat: React.Dispatch<React.SetStateAction<string>>;
}

const ActiveChatContext = createContext<ActiveChatContextType | undefined>(undefined);

export const ActiveChatProvider: React.FC<ActiveChatProviderProps> = ({ children }) => {
  const [activeChat, setActiveChat] = useState<string>("");

  return (
    <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
};

export const useActiveChat = () => {
  const context = useContext(ActiveChatContext);
  if (!context) {
    throw new Error("useActiveChat must be used within an ActiveChatProvider");
  }
  return context;
};
