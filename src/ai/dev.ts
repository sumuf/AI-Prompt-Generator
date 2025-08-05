
import { config } from 'dotenv';
config();

import '@/ai/flows/optimize-prompt.ts';
import '@/ai/flows/generate-prompt.ts';
import '@/ai/flows/generate-goal-suggestions.ts';
import '@/ai/flows/generate-context-suggestions.ts';
import '@/ai/flows/generate-constraints-suggestions.ts';
