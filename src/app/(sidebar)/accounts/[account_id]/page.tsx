"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { SquareLoader } from "@/components/Common/loader";
import { useAuth } from "@/providers/AuthProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListTags from "@/components/Account/listTags";
import PostWriter from "@/components/PostGenerator/postWriter";
import PostPreview from "@/components/PostGenerator/postPreview";
import ContactChat from "@/components/Account/contactChat";
import { UserContext } from "@/providers/UserProvider";
import { ActiveChatProvider } from "@/providers/ActiveChatContext";
import ContactDetailsCard from "@/components/Account/contactDetailsCard";
import DeleteDialogBtn from "@/components/Common/deleteDialog";

interface Contact {
  _id: { $oid: string };
  account: { $oid: string };
  company_name: string;
  emails: string[];
  linkedin_profile: string;
  name: string;
  sales_owner_name: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  chat_id?: { $oid: string };
}

interface AccountData {
  _id: { $oid: string };
  contacts: Contact[];
  description: string;
  name: string;
  industry: string;
  sales_owner_name: string;
  tags: string[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
  website: string;
}

interface Post {
  _id: string;
  message: string;
  confidence_level?: string;
  post_status?: string;
  references?: string[];
}

type Tab = "contact-details" | "chat" | "post-generator";

const SingleAccountPage = ({ params }: any) => {
  const { account_id } = params;
  const [accountData, setAccountData] = useState<AccountData>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("contact-details");

  const [generatedPost, setGeneratedPost] = useState<Post>({
    message: "",
    _id: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleContactChange = (contactId: string) => {
    const index = accountData?.contacts?.findIndex((contact) => contact._id.$oid === contactId)!;
    setSelectedContact(index);
  };

  const fetchAccountData = useCallback(async () => {
    if (user.token !== null) {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/client/company/${account_id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.status === 200) {
          setAccountData(res.data);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    }
  }, [account_id, toast, user]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleTabClick = (tabValue: Tab) => {
    setActiveTab(tabValue);
  };

  const updateUserUpdatedAt = (userId: string, newUpdatedAt: string) => {};

  const contactDetails = {
    name: accountData?.contacts[selectedContact]?.name,
    emails: accountData?.contacts[selectedContact]?.emails,
    accountName: accountData?.name,
    linkedinUrl: accountData?.contacts[selectedContact]?.linkedin_profile,
    website: accountData?.website,
    industry: accountData?.industry,
    description: accountData?.description,
  };

  if (accountData === undefined) return <SquareLoader />;

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
        <div className="flex-1 font-semibold text-lg">{accountData.name}</div>
        {accountData !== undefined && (
          <Select
            defaultValue={accountData.contacts[selectedContact]?._id.$oid}
            onValueChange={handleContactChange}
            value={accountData.contacts[selectedContact]?._id.$oid}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Select Contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Contact</SelectLabel>
                {accountData.contacts?.map((contact) => (
                  <SelectItem
                    className="max-w-[420px] truncate"
                    key={contact._id.$oid}
                    value={contact._id.$oid}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <DeleteDialogBtn
          variant="outline"
          itemId={accountData.contacts[selectedContact]?._id.$oid}
          deletePath={`/api/client/contact`}
          token={user.token}
          id={`contact-button-delete-${accountData.contacts[selectedContact]?._id.$oid}`}
          refreshData={fetchAccountData}>
          Delete
        </DeleteDialogBtn>
      </header>
      <main className="grid grid-cols-4 text-xs">
        <div className="flex-1 col-span-3 h-[calc(100vh-140px)] border-r-2 overflow-y-scroll no-scrollbar">
          <Tabs
            defaultValue="contact-details"
            onValueChange={(value) => handleTabClick(value as Tab)}>
            <div className="flex justify-between border-b p-4 sm:p-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="contact-details">Contact Details</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="post-generator">Post Generator</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4">
                <div className="text-right text-gray-500">
                  <p className="text-xs">Last updated at: </p>
                  {accountData.contacts[selectedContact]?.updatedAt && (
                    <p className="text-xs">
                      {new Date(accountData?.updatedAt?.$date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`flex flex-col justify-between gap-6 ${
                activeTab === "chat" ? "p-0" : "p-4 sm:p-6 sm:pt-4"
              }`}>
              <TabsContent value="contact-details">
                <ContactDetailsCard contactDetails={contactDetails} />
              </TabsContent>
              <TabsContent value="chat">
                <div className="h-[calc(100vh-140px)] flex">
                  <UserContext.Provider value={{ updateUserUpdatedAt }}>
                    <ActiveChatProvider>
                      <ContactChat chatId={accountData.contacts[selectedContact]?.chat_id?.$oid} />{" "}
                    </ActiveChatProvider>
                  </UserContext.Provider>
                </div>
              </TabsContent>
              <TabsContent value="post-generator">
                <main className="flex flex-col xl:flex-row flex-1 text-xs border rounded-lg">
                  <PostWriter
                    setGeneratedPost={setGeneratedPost}
                    setIsLoading={setIsLoading}
                    isLoading={isLoading}
                    accountTags={accountData.tags}
                    industry={accountData.industry}
                  />
                  <PostPreview
                    generatedPost={generatedPost}
                    setGeneratedPost={setGeneratedPost}
                    isLoading={isLoading}
                  />
                </main>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <ListTags items={accountData.tags || []} />
      </main>
    </div>
  );
};

export default SingleAccountPage;
