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
import { TagsInput } from "react-tag-input-component";
import FileDrop from "./fileDrop";

interface AddCaseStudyProps {
  children: React.ReactNode;
  token: string | null;
  refreshData: () => void;
}

interface FormValues {
  title: string;
  keywords: string;
  drive_url: string;
  file: File | null;
}

export function AddCaseStudy({ children, token, refreshData }: AddCaseStudyProps) {
  const sheetClose = useRef<HTMLButtonElement>(null);

  const formSchema = z.object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters." })
      .trim()
      .refine((value) => value.length > 0, {
        message: "Title cannot be empty or whitespace",
      }),
    keywords: z
      .string()
      .min(2, { message: "Keywords must be at least 2 characters." })
      .trim()
      .refine((value) => value.length > 0, {
        message: "Must add at least one keyword",
      }),
    drive_url: z.string().url({ message: "Invalid URL format for Drive URL" }).trim().optional(),
    file: z.any().refine(
      (value) => {
        if (!(value instanceof File)) {
          return false;
        }
        const allowedExtensions = [".md"];
        const extension = value.name.split(".").pop()?.toLowerCase();
        return extension && allowedExtensions.includes(`.${extension}`);
      },
      {
        message: "File must be a .md file",
      }
    ),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      keywords: "",
      file: null,
    },
  });

  const handleSheetTrigger = () => {
    form.clearErrors();
  };

  const onSubmit = async (formData: FormValues) => {
    if (sheetClose.current) sheetClose.current.click();
    try {
      if (token !== null) {
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("keywords", formData.keywords);
        formDataToSend.append("drive_url", formData.drive_url);
        if (formData.file) {
          formDataToSend.append("file", formData.file);
        }

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/case/create`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        refreshData();
        form.reset();
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
      <SheetTrigger
        asChild
        onClick={handleSheetTrigger}>
        {children}
      </SheetTrigger>
      <SheetContent className={`overflow-y-scroll`}>
        <SheetHeader>
          <SheetTitle>Add Case Study</SheetTitle>
          <SheetDescription>
            Fill in the case study details below. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Case Study Title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value === "" ? [] : field.value.split(",")}
                      onChange={(newTags: string[]) => field.onChange(newTags.join(","))}
                      name="keywords"
                      placeHolder="Press Enter to add Keywords"
                      classNames={{
                        input:
                          "flex min-w-52 flex-1 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="drive_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Drive URL</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      id="drive_url"
                      placeholder="Drive link"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FileDrop form={form} />
            <SheetFooter>
              <Button
                type="submit"
                className="mt-4">
                Save
              </Button>
              <SheetClose disabled={!!Object.keys(form.formState.errors).length}>
                <Button
                  type="button"
                  className="hidden"
                  disabled={!!Object.keys(form.formState.errors).length}
                  ref={sheetClose}
                  id="casestudies-button-add-confirm">
                  Save
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
