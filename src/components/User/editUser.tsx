import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import axios from "axios";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

interface EditUserProps {
  children: React.ReactNode;
  rowData: FormValues;
  token: string | null;
  email: string | null;
  refreshData: () => void;
  editPath: string;
}

type Role = "ADMIN" | "MEMBER";

interface FormValues {
  name: string;
  password?: string;
  role: Role;
  email?: string;
  _id: { $oid: string };
}

export function EditUser({
  children,
  rowData,
  refreshData,
  token,
  email,
  editPath,
}: EditUserProps) {
  const router = useRouter();
  const sheetClose = useRef<HTMLButtonElement>(null);
  const [confirmPasswordChange, setConfirmPasswordChange] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    role: z.enum(["ADMIN", "MEMBER"]),
    ...(confirmPasswordChange
      ? {
          password: z.string().min(6, { message: "Password must be at least 6 characters." }),
        }
      : {}),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: rowData.name,
      role: rowData.role,
    },
  });

  const onSubmit = async (formData: FormValues) => {
    if (sheetClose.current) sheetClose.current.click();
    if (rowData.email === email) router.push("/");

    const userId = rowData._id.$oid;
    try {
      if (token !== null) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}${editPath}`,
          { userId, ...formData },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );
        refreshData();
        toast({
          title: "Success",
          description: data.message,
          variant: "success",
        });
      } else {
        throw new Error("User token is null.");
      }
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
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className=" overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Make changes to the user&apos;s details here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="User Name" {...field} id="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!confirmPasswordChange && (
              <Button
                onClick={() => setConfirmPasswordChange(true)}
                id="users-edit-button-password">
                Change Password
              </Button>
            )}
            {confirmPasswordChange && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} id="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" id="users-select-role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ADMIN" id="users-select-role-admin">
                          Admin
                        </SelectItem>
                        <SelectItem value="MEMBER" id="users-select-role-member">
                          Member
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" className="mt-4" id="users-edit-button-save">
                Save changes
              </Button>
              <SheetClose disabled={!!Object.keys(form.formState.errors).length}>
                <Button
                  type="button"
                  className="hidden"
                  disabled={!!Object.keys(form.formState.errors).length}
                  ref={sheetClose}>
                  Save changes
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
