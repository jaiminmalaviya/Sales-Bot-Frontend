import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TagsInput } from "react-tag-input-component";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "../ui/use-toast";
import { CircleLoader } from "../Common/loader";

type TabValue = "General" | "Company";

interface Post {
  _id: string;
  message: string;
  confidence_level?: string;
  post_status?: string;
  references?: string[];
}

type Props = {
  setGeneratedPost: React.Dispatch<React.SetStateAction<Post>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  accountTags?: string[];
  industry?: string;
};

const PostWriter: React.FC<Props> = ({
  setGeneratedPost,
  setIsLoading,
  isLoading,
  accountTags,
  industry,
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>("General");
  const { user } = useAuth();

  const handleTabClick = (tabValue: TabValue) => {
    form.clearErrors();
    setActiveTab(tabValue);
  };

  const formSchema = z.object({
    keywords: z.string(),
    industry: z.string(),
    instruction: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: accountTags ? accountTags?.join(", ") : "",
      industry: industry ? industry?.split(/,|\//).join(", ") : "",
      instruction: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const keywords = form.getValues("keywords").trim();
    const industry = form.getValues("industry").trim();

    if (!keywords) form.setError("keywords", { message: "Keywords cannot be empty" });
    if (!industry) form.setError("industry", { message: "Industry cannot be empty" });

    if (user.token === null || (activeTab !== "General" && activeTab !== "Company")) return;

    try {
      setIsLoading(true);

      let url;
      let postData;

      if (activeTab === "General" && keywords && industry) {
        url = `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/post/ai`;
        postData = { ...values, user_id: user.id };
      } else if (activeTab === "Company" && keywords) {
        url = `${process.env.NEXT_PUBLIC_BASE_ROUTE}/api/post/data`;
        postData = { ...values, user_id: user.id };
      } else {
        return;
      }
      form.reset();

      const response = await axios.post(url, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = response.data;
      if (activeTab === "General")
        setGeneratedPost({
          _id: data._id,
          message: data.message,
          confidence_level: data.confidence_level,
          post_status: data.post_status,
          references: data.references,
        });
      else setGeneratedPost({ _id: data._id, message: data.message });
    } catch (error: any) {
      console.error("Error generating post with AI:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="General" onValueChange={(value) => handleTabClick(value as TabValue)}>
      <div className="flex items-center px-4 py-2">
        <h1 className="text-2xl font-semibold">Write Post</h1>
        <TabsList className="ml-auto">
          <TabsTrigger
            value="General"
            className="text-zinc-600 dark:text-zinc-200"
            id="post-button-write-general">
            General
          </TabsTrigger>
          <TabsTrigger
            value="Company"
            className="text-zinc-600 dark:text-zinc-200"
            id="post-button-write-company">
            Company
          </TabsTrigger>
        </TabsList>
      </div>
      <Separator />

      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Enter your keywords *</FormLabel>
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
                  <FormDescription>
                    Enter a few keywords related to your industry or topic of interest. (e.g.,
                    leadership, technology trends, marketing strategies)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TabsContent value="General" className="m-0">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <FormControl>
                      <TagsInput
                        value={field.value === "" ? [] : field.value.split(",")}
                        onChange={(newTags: string[]) => field.onChange(newTags.join(","))}
                        name="industry"
                        placeHolder="Press Enter to add Industry"
                        classNames={{
                          input:
                            "flex min-w-52 flex-1 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50",
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the industry related to the LinkedIn post, e.g., technology, finance,
                      healthcare, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Input
                      id="post-input-write-instructions"
                      type="text"
                      placeholder="Enter instructions"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide instructions for creating the LinkedIn post, including tone, style, or
                    additional considerations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button
                type="reset"
                variant={"outline"}
                onClick={() => {
                  form.reset();
                  form.clearErrors();
                }}
                className="flex-1"
                id="post-button-write-clear">
                Clear
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
                id="post-button-write-generate">
                {isLoading ? (
                  <>
                    <CircleLoader />
                    Processing...
                  </>
                ) : (
                  "Generate Post"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Tabs>
  );
};

export default PostWriter;
