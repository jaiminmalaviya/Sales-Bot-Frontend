import { createContext } from "react";

interface UsersContextType {
  updateUserUpdatedAt: (userId: string, newUpdatedAt: string) => void;
}

export const UserContext = createContext<UsersContextType | undefined>(undefined);
