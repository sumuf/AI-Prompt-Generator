
"use client";

import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, Wand2, X, RefreshCw } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";
import {
  generatePromptAction,
  generateGoalSuggestionsAction,
  generateContextSuggestionsAction,
  generateConstraintsSuggestionsAction,
  refinePromptAction,
  generateRefinementSuggestionsAction,
} from "@/app/actions";
import type { GeneratePromptOutput } from "@/ai/flows/generate-prompt";
import { PromptDisplay } from "@/components/prompt-display";
import { CopyButton } from "@/components/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  className,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSuggesting: boolean;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <Popover open={isOpen} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className={cn("w-[--radix-popover-trigger-width] p-0", className)} align="start">
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
  // Tab state
  const [activeTab, setActiveTab] = useState<'generate' | 'refine'>('generate');
  
  // Generate tab state
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
  
  // Refine tab state
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [refinementInstructions, setRefinementInstructions] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Refinement suggestions state
  const [isSuggestingRefinements, setIsSuggestingRefinements] = useState(false);
  const [refinementSuggestions, setRefinementSuggestions] = useState<string[]>([]);
  const [isRefinementPopoverOpen, setIsRefinementPopoverOpen] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const goalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contextTextareaRef = useRef<HTMLTextAreaElement>(null);
  const constraintsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalOrTask: "",
      context: "",
      constraints: "",
    },
  });

  // Debounced suggestion fetchers with 3-second delay
  const fetchGoalSuggestions = useCallback(async (query: string) => {
    setIsSuggestingGoal(true);
    setIsGoalPopoverOpen(true);
    try {
      const result = await generateGoalSuggestionsAction({ query });
      setIsSuggestingGoal(false);
      if (result.data && result.data.suggestions.length > 0) {
        setGoalSuggestions(result.data.suggestions);
        setIsGoalPopoverOpen(true);
      } else {
        setGoalSuggestions([]);
        setIsGoalPopoverOpen(false);
      }
    } catch (error) {
      setIsSuggestingGoal(false);
      setGoalSuggestions([]);
      setIsGoalPopoverOpen(false);
    }
  }, []);

  const fetchContextSuggestions = useCallback(async (query: string, goalOrTask: string) => {
    setIsSuggestingContext(true);
    setIsContextPopoverOpen(true);
    try {
      const result = await generateContextSuggestionsAction({ query, goalOrTask });
      setIsSuggestingContext(false);
      if (result.data && result.data.suggestions.length > 0) {
        setContextSuggestions(result.data.suggestions);
        setIsContextPopoverOpen(true);
      } else {
        setContextSuggestions([]);
        setIsContextPopoverOpen(false);
      }
    } catch (error) {
      setIsSuggestingContext(false);
      setContextSuggestions([]);
      setIsContextPopoverOpen(false);
    }
  }, []);

  const fetchConstraintsSuggestions = useCallback(async (query: string, goalOrTask: string, context: string) => {
    setIsSuggestingConstraints(true);
    setIsConstraintsPopoverOpen(true);
    try {
      const result = await generateConstraintsSuggestionsAction({ query, goalOrTask, context });
      setIsSuggestingConstraints(false);
      if (result.data && result.data.suggestions.length > 0) {
        setConstraintsSuggestions(result.data.suggestions);
        setIsConstraintsPopoverOpen(true);
      } else {
        setConstraintsSuggestions([]);
        setIsConstraintsPopoverOpen(false);
      }
    } catch (error) {
      setIsSuggestingConstraints(false);
      setConstraintsSuggestions([]);
      setIsConstraintsPopoverOpen(false);
    }
  }, []);

  // Refinement suggestions fetcher
  const fetchRefinementSuggestions = useCallback(async (originalPrompt: string) => {
    setIsSuggestingRefinements(true);
    setIsRefinementPopoverOpen(true);
    try {
      const result = await generateRefinementSuggestionsAction({ originalPrompt });
      setIsSuggestingRefinements(false);
      if (result.data && result.data.suggestions.length > 0) {
        setRefinementSuggestions(result.data.suggestions);
        setIsRefinementPopoverOpen(true);
      } else {
        setRefinementSuggestions([]);
        setIsRefinementPopoverOpen(false);
      }
    } catch (error) {
      setIsSuggestingRefinements(false);
      setRefinementSuggestions([]);
      setIsRefinementPopoverOpen(false);
    }
  }, []);

  // Create debounced versions with different delays
  const debouncedFetchGoalSuggestions = useDebounce(fetchGoalSuggestions, 3000);
  const debouncedFetchContextSuggestions = useDebounce(fetchContextSuggestions, 3000);
  const debouncedFetchConstraintsSuggestions = useDebounce(fetchConstraintsSuggestions, 3000);
  const debouncedFetchRefinementSuggestions = useDebounce(fetchRefinementSuggestions, 1100);

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("goalOrTask", value);
    
    if (value.trim().length > 3) {
      // Show loading state immediately for better UX
      setIsSuggestingGoal(true);
      setIsGoalPopoverOpen(true);
      debouncedFetchGoalSuggestions(value);
    } else {
      // Clear suggestions if input is too short
      setGoalSuggestions([]);
      setIsGoalPopoverOpen(false);
      setIsSuggestingGoal(false);
    }
  };
  
  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("context", value);
    const goalOrTask = form.getValues("goalOrTask");
    
    if (value.trim().length > 3 && goalOrTask) {
      // Show loading state immediately for better UX
      setIsSuggestingContext(true);
      setIsContextPopoverOpen(true);
      debouncedFetchContextSuggestions(value, goalOrTask);
    } else {
      // Clear suggestions if input is too short or goal is missing
      setContextSuggestions([]);
      setIsContextPopoverOpen(false);
      setIsSuggestingContext(false);
    }
  };

  const handleConstraintsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue("constraints", value);
    const { goalOrTask, context } = form.getValues();
    
    if (value.trim().length > 3 && goalOrTask && context) {
      // Show loading state immediately for better UX
      setIsSuggestingConstraints(true);
      setIsConstraintsPopoverOpen(true);
      debouncedFetchConstraintsSuggestions(value, goalOrTask, context);
    } else {
      // Clear suggestions if input is too short or dependencies are missing
      setConstraintsSuggestions([]);
      setIsConstraintsPopoverOpen(false);
      setIsSuggestingConstraints(false);
    }
  };

  const onSuggestionSelect = (
    field: keyof FormValues,
    suggestion: string,
    setSuggestions: (s: string[]) => void,
    setPopoverOpen: (o: boolean) => void,
    textareaRef?: React.RefObject<HTMLTextAreaElement>
  ) => {
    form.setValue(field, suggestion);
    setSuggestions([]);
    setPopoverOpen(false);
    
    // Refocus the textarea after selection to maintain cursor visibility
    setTimeout(() => {
      if (textareaRef?.current) {
        textareaRef.current.focus();
        // Position cursor at the end of the text
        const length = suggestion.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 100);
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

  const handleImprovePrompt = async () => {
    if (!originalPrompt.trim() || !refinementInstructions.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both the original prompt and refinement instructions.",
      });
      return;
    }

    setIsRefining(true);
    const result = await refinePromptAction({
      originalPrompt,
      refinementInstructions,
    });
    setIsRefining(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error Refining Prompt",
        description: result.error,
      });
    } else if (result.data) {
      setOriginalPrompt(result.data.refinedPrompt);
      setRefinementInstructions('');
      toast({
        title: "Prompt Refined!",
        description: "Your prompt has been successfully improved.",
      });
    }
  };

  const handleOriginalPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setOriginalPrompt(value);
    
    // Clear existing suggestions when original prompt changes
    setRefinementSuggestions([]);
    setIsRefinementPopoverOpen(false);
    setIsSuggestingRefinements(false);
  };

  const handleRefinementInstructionsFocus = () => {
    // Only generate suggestions when user clicks/focuses on the refinement instructions field
    if (originalPrompt.trim().length > 20 && refinementSuggestions.length === 0) {
      setIsSuggestingRefinements(true);
      setIsRefinementPopoverOpen(true);
      debouncedFetchRefinementSuggestions(originalPrompt);
    } else if (refinementSuggestions.length > 0) {
      // Show existing suggestions if they're already loaded
      setIsRefinementPopoverOpen(true);
    }
  };

  const onRefinementSuggestionSelect = (suggestion: string) => {
    setRefinementInstructions(suggestion);
    setRefinementSuggestions([]);
    setIsRefinementPopoverOpen(false);
  };

  const handleClearRefine = () => {
    setOriginalPrompt('');
    setRefinementInstructions('');
    setRefinementSuggestions([]);
    setIsRefinementPopoverOpen(false);
    setIsSuggestingRefinements(false);
    toast({
      title: "Refine Form Cleared",
      description: "All refine fields have been reset.",
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl flex flex-col gap-8">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground py-1 px-3 rounded-full mb-4 border border-accent">
            <Wand2 className="h-5 w-5" />
            <h1 className="text-2xl md:text-4xl font-headline font-bold tracking-tight">
              Prompt Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Craft powerful, structured AI prompts for any goal or task.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'refine')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Prompt</TabsTrigger>
            <TabsTrigger value="refine">Refine Prompts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
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
                              isOpen={isGoalPopoverOpen && goalSuggestions.length > 0}
                              onOpenChange={setIsGoalPopoverOpen}
                              isSuggesting={isSuggestingGoal}
                              suggestions={goalSuggestions}
                              onSelect={(s) => onSuggestionSelect("goalOrTask", s, setGoalSuggestions, setIsGoalPopoverOpen, goalTextareaRef)}
                              className="w-[calc(var(--radix-popover-trigger-width)_-_2px)]"
                            >
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  ref={goalTextareaRef}
                                  placeholder="e.g., 'Draft a LinkedIn summary'"
                                  className="min-h-[100px] text-base"
                                  {...field}
                                  onChange={handleGoalChange}
                                />
                                 <div className="absolute bottom-0 left-0 w-full h-1" />
                              </div>
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
                             isOpen={isContextPopoverOpen && contextSuggestions.length > 0}
                             onOpenChange={setIsContextPopoverOpen}
                             isSuggesting={isSuggestingContext}
                             suggestions={contextSuggestions}
                             onSelect={(s) => onSuggestionSelect("context", s, setContextSuggestions, setIsContextPopoverOpen, contextTextareaRef)}
                             className="w-[calc(var(--radix-popover-trigger-width)_-_2px)]"
                           >
                            <FormControl>
                              <div className="relative">
                               <Textarea
                                  ref={contextTextareaRef}
                                  placeholder="e.g., 'A software engineer with 5 years of experience transitioning into product management.'"
                                  className="min-h-[120px] text-base"
                                  {...field}
                                  onChange={handleContextChange}
                               />
                               <div className="absolute bottom-0 left-0 w-full h-1" />
                              </div>
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
                             isOpen={isConstraintsPopoverOpen && constraintsSuggestions.length > 0}
                             onOpenChange={setIsConstraintsPopoverOpen}
                             isSuggesting={isSuggestingConstraints}
                             suggestions={constraintsSuggestions}
                             onSelect={(s) => onSuggestionSelect("constraints", s, setConstraintsSuggestions, setIsConstraintsPopoverOpen, constraintsTextareaRef)}
                             className="w-[calc(var(--radix-popover-trigger-width)_-_2px)]"
                           >
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  ref={constraintsTextareaRef}
                                  placeholder="e.g., 'The summary must be under 200 words and written in a professional yet approachable tone.'"
                                  className="min-h-[80px] text-base"
                                  {...field}
                                  onChange={handleConstraintsChange}
                                />
                                <div className="absolute bottom-0 left-0 w-full h-1" />
                              </div>
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
          </TabsContent>

          <TabsContent value="refine">
            <Card className="shadow-lg">
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>Refine Your Prompt</CardTitle>
                  <CardDescription>
                    Paste your original prompt and provide instructions on how to improve it.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearRefine}
                  disabled={isRefining}
                  className="-mt-1 -mr-1"
                  aria-label="Clear refine form"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Original/Generated Prompt
                  </label>
                  <div className="relative">
                    <Textarea
                      value={originalPrompt}
                      onChange={handleOriginalPromptChange}
                      className="min-h-[200px] text-base pr-12"
                      placeholder="Paste your original or generated prompt here..."
                    />
                    {originalPrompt.trim() && (
                      <CopyButton 
                        textToCopy={originalPrompt} 
                        className="absolute top-2 right-2" 
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Refinement Instructions
                  </label>
                  <SuggestionPopover
                    isOpen={isRefinementPopoverOpen && refinementSuggestions.length > 0}
                    onOpenChange={setIsRefinementPopoverOpen}
                    isSuggesting={isSuggestingRefinements}
                    suggestions={refinementSuggestions}
                    onSelect={onRefinementSuggestionSelect}
                    className="w-[--radix-popover-trigger-width] max-w-none"
                  >
                    <Input
                      type="text"
                      value={refinementInstructions}
                      onChange={(e) => setRefinementInstructions(e.target.value)}
                      onFocus={handleRefinementInstructionsFocus}
                      className="text-base"
                      placeholder="How would you like to improve this prompt?"
                    />
                  </SuggestionPopover>
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    onClick={handleImprovePrompt}
                    disabled={!originalPrompt.trim() || !refinementInstructions.trim() || isRefining}
                    size="lg" 
                    className="w-full sm:w-auto"
                  >
                    {isRefining ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        improvePrompt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
