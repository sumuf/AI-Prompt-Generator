
"use client";

import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Wand2, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  generatePromptAction,
  generateGoalSuggestionsAction,
  generateContextSuggestionsAction,
  generateConstraintsSuggestionsAction,
} from "@/app/actions";
import type { GeneratePromptOutput } from "@/ai/flows/generate-prompt";
import { PromptDisplay } from "@/components/prompt-display";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";

const formSchema = z.object({
  goalOrTask: z
    .string()
    .min(10, "Please describe your goal or task in at least 10 characters.")
    .max(500, "Goal or task should not exceed 500 characters."),
  context: z
    .string()
    .min(10, "Please provide some context, at least 10 characters.")
    .max(1000, "Context should not exceed 1000 characters."),
  constraints: z
    .string()
    .max(500, "Constraints should not exceed 500 characters.")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SuggestionPopover = ({
  isOpen,
  onOpenChange,
  isSuggesting,
  suggestions,
  onSelect,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSuggesting: boolean;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  children: React.ReactNode;
}) => (
  <Popover open={isOpen} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
      <Command>
        <CommandList>
          {isSuggesting && (
            <div className="p-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Getting suggestions...</span>
            </div>
          )}
          {!isSuggesting && suggestions.length === 0 && (
            <div className="p-2 text-sm text-center text-muted-foreground">
              No suggestions found.
            </div>
          )}
          {suggestions.map((suggestion, i) => (
            <CommandItem key={i} onSelect={() => onSelect(suggestion)} value={suggestion}>
              {suggestion}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingGoal, setIsSuggestingGoal] = useState(false);
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([]);
  const [isGoalPopoverOpen, setIsGoalPopoverOpen] = useState(false);
  
  const [isSuggestingContext, setIsSuggestingContext] = useState(false);
  const [contextSuggestions, setContextSuggestions] = useState<string[]>([]);
  const [isContextPopoverOpen, setIsContextPopoverOpen] = useState(false);

  const [isSuggestingConstraints, setIsSuggestingConstraints] = useState(false);
  const [constraintsSuggestions, setConstraintsSuggestions] = useState<string[]>([]);
  const [isConstraintsPopoverOpen, setIsConstraintsPopoverOpen] = useState(false);

  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratePromptOutput | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalOrTask: "",
      context: "",
      constraints: "",
    },
  });

  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

  const debounceSuggestion = (
    fetcher: () => Promise<{ data?: { suggestions: string[] }; error?: string }>,
    setLoading: (loading: boolean) => void,
    setSuggestions: (suggestions: string[]) => void,
    setPopoverOpen: (open: boolean) => void
  ) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    setLoading(true);
    suggestionTimeoutRef.current = setTimeout(async () => {
      const result = await fetcher();
      setLoading(false);
      if (result.data && result.data.suggestions.length > 0) {
        setSuggestions(result.data.suggestions);
        setPopoverOpen(true);
      } else {
        setSuggestions([]);
        setPopoverOpen(false);
      }
    }, 1000);
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("goalOrTask", value);
    if (value.length > 3) {
      debounceSuggestion(
        () => generateGoalSuggestionsAction({ query: value }),
        setIsSuggestingGoal,
        setGoalSuggestions,
        setIsGoalPopoverOpen
      );
    } else {
      setGoalSuggestions([]);
      setIsGoalPopoverOpen(false);
    }
  };
  
  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("context", value);
    const goalOrTask = form.getValues("goalOrTask");
    if (value.length > 3 && goalOrTask) {
      debounceSuggestion(
        () => generateContextSuggestionsAction({ query: value, goalOrTask }),
        setIsSuggestingContext,
        setContextSuggestions,
        setIsContextPopoverOpen
      );
    } else {
      setContextSuggestions([]);
      setIsContextPopoverOpen(false);
    }
  };

  const handleConstraintsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("constraints", value);
    const { goalOrTask, context } = form.getValues();
    if (value.length > 3 && goalOrTask && context) {
      debounceSuggestion(
        () => generateConstraintsSuggestionsAction({ query: value, goalOrTask, context }),
        setIsSuggestingConstraints,
        setConstraintsSuggestions,
        setIsConstraintsPopoverOpen
      );
    } else {
      setConstraintsSuggestions([]);
      setIsConstraintsPopoverOpen(false);
    }
  };

  const onSuggestionSelect = (
    field: keyof FormValues,
    suggestion: string,
    setSuggestions: (s: string[]) => void,
    setPopoverOpen: (o: boolean) => void
  ) => {
    form.setValue(field, suggestion);
    setSuggestions([]);
    setPopoverOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedPrompt(null);
    const result = await generatePromptAction(values);
    setIsLoading(false);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error Generating Prompt",
        description: result.error,
      });
    } else if (result.data) {
      setGeneratedPrompt(result.data);
      toast({
        title: "Prompt Generated!",
        description: "Your new prompt has been successfully generated.",
      });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleClear = () => {
    form.reset({
      goalOrTask: "",
      context: "",
      constraints: "",
    });
    setGeneratedPrompt(null);
    setGoalSuggestions([]);
    setIsGoalPopoverOpen(false);
    setContextSuggestions([]);
    setIsContextPopoverOpen(false);
    setConstraintsSuggestions([]);
    setIsConstraintsPopoverOpen(false);
    toast({
      title: "Form Cleared",
      description: "All fields have been reset.",
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl flex flex-col gap-8">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground py-1 px-3 rounded-full mb-4 border border-accent">
            <Wand2 className="h-5 w-5" />
            <h1 className="text-2xl md:text-4xl font-headline font-bold tracking-tight">
              AI Prompt Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Craft powerful, structured AI prompts for any goal or task.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Create Your Prompt</CardTitle>
              <CardDescription>
                Fill in the details below, and our AI will forge a structured
                prompt for you.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={isLoading}
              className="-mt-1 -mr-1"
              aria-label="Clear form"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="goalOrTask"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Goal or Task</FormLabel>
                      <SuggestionPopover
                        isOpen={isGoalPopoverOpen}
                        onOpenChange={setIsGoalPopoverOpen}
                        isSuggesting={isSuggestingGoal}
                        suggestions={goalSuggestions}
                        onSelect={(s) => onSuggestionSelect("goalOrTask", s, setGoalSuggestions, setIsGoalPopoverOpen)}
                      >
                         <FormControl>
                           <Textarea
                              placeholder="e.g., 'Draft a LinkedIn summary'"
                              className="min-h-[100px] text-base"
                              {...field}
                              onChange={handleGoalChange}
                            />
                         </FormControl>
                      </SuggestionPopover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Context</FormLabel>
                      <SuggestionPopover
                        isOpen={isContextPopoverOpen}
                        onOpenChange={setIsContextPopoverOpen}
                        isSuggesting={isSuggestingContext}
                        suggestions={contextSuggestions}
                        onSelect={(s) => onSuggestionSelect("context", s, setContextSuggestions, setIsContextPopoverOpen)}
                      >
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'A software engineer with 5 years of experience transitioning into product management.'"
                            className="min-h-[120px] text-base"
                            {...field}
                            onChange={handleContextChange}
                          />
                        </FormControl>
                      </SuggestionPopover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Constraints (Optional)</FormLabel>
                       <SuggestionPopover
                        isOpen={isConstraintsPopoverOpen}
                        onOpenChange={setIsConstraintsPopoverOpen}
                        isSuggesting={isSuggestingConstraints}
                        suggestions={constraintsSuggestions}
                        onSelect={(s) => onSuggestionSelect("constraints", s, setConstraintsSuggestions, setIsConstraintsPopoverOpen)}
                      >
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'The summary must be under 200 words and written in a professional yet approachable tone.'"
                            className="min-h-[80px] text-base"
                            {...field}
                            onChange={handleConstraintsChange}
                          />
                        </FormControl>
                      </SuggestionPopover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Prompt
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div ref={resultsRef}>
          {generatedPrompt && (
            <div className="animate-in fade-in-50 duration-500">
              <PromptDisplay prompt={generatedPrompt} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
