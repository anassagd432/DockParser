# DockParser (InvoiceFlow AI)

DockParser is an AI-powered invoice and contract processing application. It leverages **Supabase** for backend storage and Edge Functions, and **Google Gemini 3.0 Pro** for intelligent document parsing.

## Features

-   **AI Parsing**: Extracts structured data (invoice details, contract rules) from PDFs and images using Google Gemini 3.0 Pro.
-   **Supabase Integrated**: Uses Supabase for Auth, Storage, and Edge Functions.
-   **Modern Tech Stack**: Built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.
-   **Responsive Design**: Interactive and reliable UI.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Supabase Account and Project
-   Google AI Studio API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/DockParser.git
    cd DockParser
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Copy the `.env.example` file to `.env`:
    ```bash
    cp .env.example .env
    ```

    Fill in your Supabase credentials in `.env`:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Backend Setup (Supabase)

This project relies on Supabase Edge Functions.

1.  Set your Gemini API Key in Supabase secrets:
    ```bash
    supabase secrets set GEMINI_API_KEY=your_google_ai_key
    ```
2.  Deploy the Edge Functions:
    ```bash
    supabase functions deploy process-invoice
    supabase functions deploy create-checkout
    ```

### Running Locally

```bash
npm run dev
```

## Build

To build for production:

```bash
npm run build
```

## License

MIT
