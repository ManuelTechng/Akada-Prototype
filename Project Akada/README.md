# Akada - AI-Powered Education Platform

Akada is an AI-powered platform designed to help Nigerian students explore, plan, and apply to international academic programs in technology. It provides personalized guidance, comprehensive resources, and a streamlined application process.

## Features

-   **AI-Powered Program Search:** Find the perfect program with smart filters that match your academic profile, budget, and career goals.
-   **GPT/Gemini Chat Assistant:** Get instant answers to your questions about programs, applications, visas, and more from our AI assistant.
-   **Essay & SOP Review:** Receive AI-powered feedback on your essays and statements of purpose to improve your chances of acceptance.
-   **Application Tracker:** Stay organized with a comprehensive checklist and timeline for each application.
-   **Scholarship & Visa Portal:** Access comprehensive information about scholarships and visa requirements for Nigerian students.

## Technologies Used

-   React
-   Tailwind CSS
-   Vite
-   Supabase
-   OpenAI API
-   Lucide React

## Prerequisites

Before running the application, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [npm](https://www.npmjs.com/) (Node Package Manager)

## Installation

1.  Clone the repository:

    ```bash
    git clone [repository URL]
    cd [repository directory]
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the project root directory.
2.  Add the following environment variables to the `.env` file:

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    VITE_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

    Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_OPENAI_API_KEY` with your actual Supabase and OpenAI API keys.

## Running the Application

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to the address provided by the development server (usually `http://localhost:3000`).

## Building for Production

To build the application for production, run the following command:

```bash
npm run build
