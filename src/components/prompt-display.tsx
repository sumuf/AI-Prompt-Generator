
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GeneratePromptOutput } from "@/ai/flows/generate-prompt";
import { User, Target, BookText, Lightbulb, FileText, Wand2 } from "lucide-react";
import { CopyButton } from "./copy-button";

// Helper function to format the entire prompt object into a single string for copying.
const formatPromptForCopy = (prompt: GeneratePromptOutput): string => {
  const fewShotsText = prompt.fewShots
    .map((fs) => `- Input: ${fs.input}\n  Output: ${fs.output}`)
    .join("\n");

  return `## Role
${prompt.role}

## Task
${prompt.task}

## Context
${prompt.context}

## Few-shots
${fewShotsText}

## Report Format
${prompt.reportFormat}

---

### Prompt Optimization Tips
${prompt.optimizationTips}`;
};

const PromptSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <h3 className="flex items-center gap-3 font-semibold text-foreground text-lg">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/50 text-accent-foreground border border-accent">
        {icon}
      </span>
      {title}
    </h3>
    <div className="pl-11 text-muted-foreground prose-sm max-w-none">{children}</div>
  </div>
);

export function PromptDisplay({ prompt }: { prompt: GeneratePromptOutput }) {
  const fullPromptText = formatPromptForCopy(prompt);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Your Generated Prompt</CardTitle>
          <CardDescription>Use this structured prompt in your desired AI tool.</CardDescription>
        </div>
        <CopyButton textToCopy={fullPromptText} />
      </CardHeader>
      <CardContent className="space-y-6">
        <PromptSection icon={<User size={18} />} title="Role">
          <p>{prompt.role}</p>
        </PromptSection>
        <Separator />
        <PromptSection icon={<Target size={18} />} title="Task">
          <p>{prompt.task}</p>
        </PromptSection>
        <Separator />
        <PromptSection icon={<BookText size={18} />} title="Context">
          <p>{prompt.context}</p>
        </PromptSection>
        <Separator />
        <PromptSection icon={<Lightbulb size={18} />} title="Few-shots">
          <div className="space-y-3">
            {prompt.fewShots.map((shot, index) => (
              <div key={index} className="rounded-md border bg-background p-3">
                <p>
                  <span className="font-semibold text-foreground">Input: </span>
                  {shot.input}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Output: </span>
                  {shot.output}
                </p>
              </div>
            ))}
          </div>
        </PromptSection>
        <Separator />
        <PromptSection icon={<FileText size={18} />} title="Report Format">
          <p>{prompt.reportFormat}</p>
        </PromptSection>
        <Separator />
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
          <PromptSection icon={<Wand2 size={18} />} title="Optimization Tips">
            <p className="text-primary/90">{prompt.optimizationTips}</p>
          </PromptSection>
        </div>
      </CardContent>
    </Card>
  );
}
