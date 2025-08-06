# AI PromptGenerator

An AI-powered prompt generation tool that helps you create structured, effective prompts for various tasks and goals.

## Features

- **Input Interface**: User-friendly interface for entering your desired goal or task, context, and constraints
- **Prompt Generation**: Generates structured prompts (Role, Task, Context, Few-shots, Report format) using AI
- **Prompt Optimization**: AI-driven optimization tips to enhance prompt effectiveness
- **Structured Display**: Clear presentation of generated prompts with organized sections
- **Copy Functionality**: Easy copy-to-clipboard for use in other applications

## Tech Stack

- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI**: Google Genkit with Gemini 2.0 Flash
- **TypeScript**: Full type safety
- **Theme**: Dark/light mode support

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (copy `.env` to `.env.local` and add your API keys)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:9002](http://localhost:9002) in your browser

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Design

PromptForge uses a clean, professional design with:
- Primary color: Soft blue (#A7C4BC) for trust and reliability
- Background: Light desaturated blue (#F0F4F3) for a calm backdrop
- Accent: Muted teal (#73A58B) for highlights
- Typography: Inter font family for optimal readability
