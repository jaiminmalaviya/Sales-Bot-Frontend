"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/user/${user.email}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + user.token,
            },
          }
        );
        const userData = response.data.data;
        const { _id, name, email, token, role, is_gmail_connected } = userData;
        login(_id, name, email, token, role, is_gmail_connected);
        router.push("/accounts");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    };

    if (user.email) {
      fetchUserData();
    }
  }, [user.email]);

  return null;
}
