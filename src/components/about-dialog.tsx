
"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-6 w-6" />
          <span className="sr-only">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>About AI Prompt Generator</DialogTitle>
          <DialogDescription>
            Craft powerful, structured AI prompts for any goal or task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">How to Use</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <span className="font-semibold text-foreground">Goal or Task:</span> Start by describing what you want the AI to do. Be clear and concise.
              </li>
              <li>
                <span className="font-semibold text-foreground">Context:</span> Provide relevant background information that the AI will need to complete the task. The more detailed, the better.
              </li>
              <li>
                <span className="font-semibold text-foreground">Constraints (Optional):</span> Add any limitations or specific requirements, like word count or tone.
              </li>
               <li>As you type in each field, the AI will offer suggestions to help you. Click on a suggestion to use it.</li>
              <li>Click <span className="font-semibold text-foreground">Generate Prompt</span> and the AI will create a structured prompt for you.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Understanding the Output</h3>
            <p>
              The generated prompt is broken down into several parts to ensure the best possible response from an AI model:
            </p>
            <ul className="list-disc list-outside pl-5 mt-2 space-y-1">
              <li><span className="font-semibold text-foreground">Role:</span> Defines the persona the AI should adopt.</li>
              <li><span className="font-semibold text-foreground">Task:</span> The specific action the AI needs to perform.</li>
              <li><span className="font-semibold text-foreground">Context:</span> The background information you provided.</li>
              <li><span className="font-semibold text-foreground">Few-shots:</span> A high-quality example to guide the AI's output.</li>
              <li><span className="font-semibold text-foreground">Report Format:</span> Specifies how the final response should be structured.</li>
              <li><span className="font-semibold text-foreground">Optimization Tips:</span> Suggestions to further improve your prompt.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
