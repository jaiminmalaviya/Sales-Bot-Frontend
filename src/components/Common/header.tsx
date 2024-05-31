"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { MountainIcon } from "@/assets/icons";
import axios from "axios";
import { toast } from "../ui/use-toast";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleConnectGmail = () => {
    router.push(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/auth/gmail?email=${user.email}`);
  };

  const handleDisconnectGmail = async () => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/gmail/disconnect?email=${user.email}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        }
      );
      router.push("/");
      toast({
        title: "Success",
        description: data.message,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error during API request:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6  border-b-2">
      <Link className="mr-6" href="/">
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <div className="ml-auto flex items-center gap-x-4">
        {user.isLoggedIn && (
          <>
            <div className="ml-6 text-lg font-semibold">Welcome back, {user.name}!</div>
            {!user.isGmailConnected ? (
              <Button variant="default" onClick={handleConnectGmail} id="button-connect-gmail">
                Connect Gmail
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleDisconnectGmail}
                id="button-disconnect-gmail">
                Disconnect Gmail
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} id="button-logout">
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
