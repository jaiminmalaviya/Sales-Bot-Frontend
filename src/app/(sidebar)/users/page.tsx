"use client";

import { AddUser } from "@/components/User/addUser";
import DeleteDialogBtn from "@/components/Common/deleteDialog";
import DynamicTable from "@/components/Common/dynamicTable";
import { EditUser } from "@/components/User/editUser";
import { SquareLoader } from "@/components/Common/loader";
import PaginationComponent from "@/components/Common/pagination";
import CustomAvatar from "@/components/ui/custom-avatar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { PlusIcon } from "@radix-ui/react-icons";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface User {
  _id: { $oid: string };
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt?: { $date: string };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const User = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, _] = useState(5);
  const [totalItems, setTotalItems] = useState(5);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshData = useCallback(async () => {
    if (user.token !== null) {
      try {
        setLoading(true);
        const response = await axios.get<{
          data: User[];
          pagination: { total_count: number };
        }>(`${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/user/list`, {
          params: {
            limit: itemsPerPage,
            skip: (currentPage - 1) * itemsPerPage,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        });
        const { data, pagination } = response.data;
        setUsers(data);
        setTotalItems(pagination.total_count || 10);
      } catch (error: any) {
        if (error.response.data.message === "No users found") {
          setCurrentPage(1);
          return;
        }
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
  }, [currentPage, itemsPerPage, user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const columns = [
    {
      key: "name",
      label: "User Name",
      render: (userName: string, row: User) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <CustomAvatar seed={row.email + "1"} />
          </div>
          <span>{userName || "AlphaBI"}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "key",
      label: "Date",
      render: (_: string, row: User) => (
        <div className="text-xs">
          {row.createdAt ? formatDate(row.createdAt.$date) : "N/A"}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Users</h1>
        </div>
        {user.role === "ADMIN" && (
          <AddUser token={user.token} refreshData={refreshData}>
            <PlusIcon className="mr-1 block" /> Add User
          </AddUser>
        )}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 text-xs">
        {loading ? (
          <DynamicTable
            columns={columns.map((c) => {
              c.render = () => (
                <Skeleton className="w-3/5 h-3 my-3 rounded-full" />
              );
              return c;
            })}
            data={Array.from(Array(itemsPerPage).keys()).map((i) => {
              return {
                _id: {
                  $oid: i,
                },
              };
            })}
            editButton={() => (
              <Skeleton className="w-3/5 h-3 my-3 rounded-full" />
            )}
          />
        ) : (
          <>
            <DynamicTable
              columns={columns}
              data={users}
              editButton={
                user.role === "ADMIN"
                  ? (row, idx) => (
                      <EditUser
                        rowData={row}
                        token={user.token}
                        email={user.email}
                        editPath="/api/auth/update"
                        refreshData={refreshData}
                      >
                        <Button
                          className="mr-2"
                          size="sm"
                          variant="outline"
                          id={`users-button-edit-${idx}`}
                        >
                          Edit
                        </Button>
                      </EditUser>
                    )
                  : undefined
              }
              deleteButton={
                user.role === "ADMIN"
                  ? (row, idx) => (
                      <DeleteDialogBtn
                        size="sm"
                        variant="outline"
                        itemId={row._id.$oid}
                        deletePath="/api/auth/delete"
                        token={user.token}
                        id={`users-button-delete-${idx}`}
                        refreshData={refreshData}
                      >
                        Delete
                      </DeleteDialogBtn>
                    )
                  : undefined
              }
            />

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
};

export default User;
