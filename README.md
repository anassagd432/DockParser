# DockParser (InvoiceFlow AI)

**Turn messy freight bills into structured data in seconds.**

DockParser is an AI-Native document processing engine designed for the logistics industry. It leverages multimodal LLMs (Google Gemini 3.0 Pro) and Supabase Edge Functions to automatically extract, validate, and structure data from invoices and contracts with high precision.

**🌐 Live Demo:** [https://dock-parser.vercel.app/](https://dock-parser.vercel.app/)

![DockParser UI](/public/logo.png)

## 🚀 Features

-   **AI-Native Extraction**: Uses Gemini 3.0 Pro for multimodal understanding of complex invoice layouts.
-   **Rule-Based Validation**: Automatically checks invoices against extracted contract terms (Rate Cards).
-   **Real-time Dashboard**: Live status updates and processing queues via Supabase Realtime.
-   **Glassmorphism UI**: A modern, premium interface built with React 19, Tailwind CSS, and Framer Motion.
-   **Secure Storage**: Enterprise-grade file storage and Row Level Security (RLS) with Supabase.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
-   **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
-   **AI Model**: Google Gemini 2.5 Flash / 3.0 Pro
-   **State Management**: React Query / Custom Hooks

## ⚡ Getting Started

### Prerequisites

-   Node.js (v18+)
-   Supabase Account
-   Google Cloud Platform Account (for Gemini API)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/anassagd432/DockParser.git
    cd DockParser
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-semcret-anon-key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 👨‍💻 Author

**Anass Agdi**

-   **LinkedIn**: [Anass Agdi](https://www.linkedin.com/in/anass-agdi-918209381)
-   **X (Twitter)**: [@anass_agdi](https://x.com/anass_agdi)
-   **GitHub**: [anassagd432](https://github.com/anassagd432)

---

Built with ❤️ by Anass Agdi
