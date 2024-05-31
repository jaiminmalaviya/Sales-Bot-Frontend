"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/providers/AuthProvider";
import { PlusIcon } from "@radix-ui/react-icons";
import { AddCaseStudy } from "@/components/CaseStudy/addCaseStudy";
import DeleteDialogBtn from "@/components/Common/deleteDialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SquareLoader } from "@/components/Common/loader";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const badgeColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-gray-500",
  "bg-orange-500",
  "bg-teal-500",
];

interface CaseStudy {
  file_path: string;
  keywords: string[];
  title: string;
  _id: { $oid: string };
  createdAt?: { $date: string };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const LoaderCard = () => {
  return (
    <Card>
      <CardHeader className="h-[63%]">
        <Skeleton className="w-4/5 h-6 mb-1" />
        <div className="flex gap-4">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-16 h-5" />
        </div>
      </CardHeader>
      <CardFooter className="border-t justify-between pt-4">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
};

const Page = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshData = useCallback(async () => {
    setLoading(true);
    if (user.token !== null) {
      try {
        const { data } = await axios.get<CaseStudy[]>(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/case/get-case`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCaseStudies(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Case Studies</h1>
        </div>
        {user.role === "ADMIN" && (
          <AddCaseStudy token={user.token} refreshData={refreshData}>
            <Button size={"sm"} id="casestudies-button-add">
              <PlusIcon className="mr-1 block" />
              Add Case Studies
            </Button>
          </AddCaseStudy>
        )}
      </header>
      <main className="p-4 grid gap-6 md:gap-8 md:p-6 text-xs md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <>
            <LoaderCard />
            <LoaderCard />
          </>
        ) : (
          <>
            {caseStudies.length === 0 ? (
              <p className="text-center text-gray-500 mt-8 text-base col-span-4">
                No case studies found
              </p>
            ) : (
              caseStudies?.map((study, idx) => (
                <Card key={study._id.$oid}>
                  <CardHeader className="py-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl mb-2">
                        {study.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {study.keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            className={`${
                              badgeColors[index % badgeColors.length]
                            } text-white`}
                            variant="outline"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 flex gap-1">
                        <span className="underline">File Path:</span>
                        {study.file_path}
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="border-t justify-between pt-4">
                    <div className="text-sm">
                      <CardDescription className="text-xs">
                        Created At
                      </CardDescription>
                      <CardTitle className="text-xs">
                        {study.createdAt
                          ? formatDate(study.createdAt.$date)
                          : "N/A"}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <DeleteDialogBtn
                          id={`casestudies-button-delete-${idx}`}
                          size="sm"
                          variant="outline"
                          itemId={study._id.$oid}
                          token={user.token}
                          refreshData={refreshData}
                          deletePath="/api/case/delete"
                        >
                          Delete
                        </DeleteDialogBtn>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Page;
