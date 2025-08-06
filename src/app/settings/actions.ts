
"use server";

import fs from "fs/promises";
import path from "path";

async function getApiKey(): Promise<string | null> {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    const envFileContent = await fs.readFile(envPath, "utf-8");
    const match = envFileContent.match(/^GEMINI_API_KEY=(.*)$/m);
    return match ? match[1] : null;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // .env file doesn't exist
    }
    console.error("Error reading API key:", error);
    return null;
  }
}

export async function getApiKeyAction(): Promise<{ apiKey: string | null; error?: string }> {
  try {
    const apiKey = await getApiKey();
    return { apiKey };
  } catch (error) {
    console.error("Error getting API key:", error);
    return {
      apiKey: null,
      error: `An unexpected error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function setApiKeyAction(data: {
  apiKey: string;
}): Promise<{ error?: string }> {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let envFileContent = "";
    try {
      envFileContent = await fs.readFile(envPath, "utf-8");
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    const lines = envFileContent.split("\n");
    const newLines = lines.filter((line) => !line.startsWith("GEMINI_API_KEY="));
    newLines.push(`GEMINI_API_KEY=${data.apiKey}`);
    
    await fs.writeFile(envPath, newLines.join("\n").trim());
    
    // This is a bit of a hack to get the new env var to be picked up
    // by Genkit without a server restart.
    process.env.GEMINI_API_KEY = data.apiKey;

    return {};
  } catch (error) {
    console.error("Error setting API key:", error);
    return {
      error: `An unexpected error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
