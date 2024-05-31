"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PaginationComponent from "@/components/Common/pagination";
import DynamicTable from "@/components/Common/dynamicTable";
import { useAuth } from "@/providers/AuthProvider";
import SearchBar from "@/components/Common/searchBar";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Account {
  _id: { $oid: string };
  name: string;
  website: string;
  industry: string;
  contacts: { name: string }[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAndSetAccounts = useCallback(async () => {
    if (user.token !== null) {
      try {
        setIsLoading(true);
        const response = await axios.get<{
          data: Account[];
          pagination: { total_count: number };
        }>(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/client/company?limit=${itemsPerPage}&skip=${
            currentPage - 1
          }&account=${searchTerm}&sales_owner=${user.name}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAccounts(response.data.data);
        setTotalItems(response.data.pagination.total_count || 10);
      } catch (error: any) {
        setCurrentPage(1);
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentPage, itemsPerPage, searchTerm, user]);

  useEffect(() => {
    fetchAndSetAccounts();
  }, [fetchAndSetAccounts]);

  const columns = [
    { key: "name", label: "Account Name" },
    {
      key: "website",
      label: "Website Link",
      render: (website: string) =>
        website ? <p className="underline truncate max-w-48 text-blue-500">{website}</p> : <p></p>,
    },
    {
      key: "industry",
      label: "Industry",
      render: (industry: string) => {
        if (!industry) return <span className="text-gray-500">No industry available</span>;
        const industries = industry.split(/,|\//);
        return (
          <div className="flex flex-col md:flex-row gap-x-2">
            <span className="truncate max-w-44 inline-block">{industries[0]}</span>
            {industries.length > 1 && (
              <span className="text-gray-500 underline self-center">
                +{industries.length - 1} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "contacts",
      label: "Contacts",
      render: (contacts: { name: string }[]) => (
        <div className="flex flex-col md:flex-row gap-x-2">
          {contacts.length > 0 ? (
            <>
              {contacts[0].name}
              {contacts.length > 1 && (
                <span className="text-gray-500 underline self-center">
                  +{contacts.length - 1} more
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500">No contacts available</span>
          )}
        </div>
      ),
    },
    {
      key: "key",
      label: "Date",
      render: (_: string, row: Account) => (
        <div className="text-xs">{row.createdAt ? formatDate(row.createdAt.$date) : "N/A"}</div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1 justify-between flex">
          <h1 className="text-lg font-semibold">Accounts</h1>
          <div className="flex gap-4">
            <div className="self-center">
              <SearchBar setSearchTerm={setSearchTerm} />
            </div>
            <Select
              defaultValue={`${itemsPerPage}`}
              onValueChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(Number(e));
              }}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder={"Items Per Page"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 text-xs">
        {isLoading ? (
          <DynamicTable
            columns={columns.map((c) => {
              c.render = () => <Skeleton className="w-1/2 h-3 my-3 rounded-full" />;
              return c;
            })}
            data={Array.from(Array(itemsPerPage).keys()).map((i) => {
              return {
                _id: {
                  $oid: i,
                },
              };
            })}
            editButton={() => <Skeleton className="w-3/5 h-3 my-3 rounded-full" />}
          />
        ) : accounts.length === 0 ? (
          <>
            {searchTerm === "" ? (
              <p className="text-center text-gray-500 mt-8 text-base">No accounts available</p>
            ) : (
              <p className="text-center text-gray-500 mt-8 text-base">
                No data for &apos;{searchTerm}&apos;
              </p>
            )}
          </>
        ) : (
          <>
            <DynamicTable columns={columns} data={accounts} />
            <PaginationComponent
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
