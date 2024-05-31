import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { redirect, useRouter } from "next/navigation";

interface DeleteDialogBtnProps {
  size?: "sm" | "icon" | "lg";
  variant: "outline" | "link" | "ghost";
  children: React.ReactNode;
  itemId: string;
  token: string | null;
  id: string;
  deletePath: string;
  refreshData: () => void;
}

export default function DeleteDialogBtn({
  size,
  variant,
  children,
  itemId,
  id,
  token,
  deletePath,
  refreshData,
}: DeleteDialogBtnProps) {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_ROUTE}${deletePath}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        data: { _id: itemId },
      });
      if (data?.account_deleted === true) {
        router.push("/accounts");
      } else {
        refreshData();
      }
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
          size={size}
          id={id}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the item from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel id={`${id}-cancel`}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className=" bg-red-500 hover:bg-red-400"
            id={`${id}-confirm`}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
