
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export function CopyButton({ textToCopy, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    if (!navigator.clipboard) {
      toast({
        variant: "destructive",
        title: "Browser not supported",
        description: "Clipboard API is not available in your browser.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the text. Please try again.",
      });
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button onClick={copy} variant="outline" size="sm" className={className} aria-label="Copy prompt">
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">{isCopied ? "Copied!" : "Copy Prompt"}</span>
    </Button>
  );
}
