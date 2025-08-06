
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { setApiKeyAction, getApiKeyAction } from "./actions";
import Link from "next/link";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    async function fetchApiKey() {
      setIsFetching(true);
      const result = await getApiKeyAction();
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error Fetching API Key",
          description: result.error,
        });
      } else if (result.apiKey) {
        form.setValue("apiKey", result.apiKey);
      }
      setIsFetching(false);
    }
    fetchApiKey();
  }, [form, toast]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const result = await setApiKeyAction(values);

    setIsLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error Saving API Key",
        description: result.error,
      });
    } else {
      toast({
        title: "API Key Saved!",
        description: "Your Gemini API key has been configured.",
      });
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your Google Gemini API Key. This is stored securely and
              is only used on the server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Gemini API Key</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder={isFetching ? "Loading..." : "Enter your API key"}
                            {...field}
                            disabled={isFetching}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                          onClick={() => setShowApiKey(!showApiKey)}
                          disabled={isFetching}
                          aria-label={showApiKey ? "Hide API key" : "Show API key"}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading || isFetching}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
