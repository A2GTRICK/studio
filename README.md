# A2G Smart Notes - Pharmacy Learning Platform

This is a Next.js application built with Firebase, ShadCN UI, Tailwind CSS, and Genkit for AI features. It serves as a comprehensive digital partner for pharmacy students in India.

## Features

-   **User Authentication:** Secure login and signup functionality with Firebase Auth.
-   **Notes Library:** A comprehensive, filterable library of expert-written notes for various pharmacy courses and years.
-   **AI-Powered Tools:**
    -   **AI Notes Generator:** Create detailed study notes on any topic from the syllabus.
    -   **AI Exam Question Generator:** Generate high-probability exam questions based on past papers and syllabus analysis.
    -   **MCQ Practice:** Generate practice quizzes with instant feedback and AI-powered performance analysis.
-   **Premium Subscription Model:** Monetization-ready with options to buy individual items or subscribe to a premium plan.
-   **Admin Panel:** A dedicated section for admins to manage the notes library.
-   **Academic Services:** A showcase for professional academic support services.
-   **Smart Dashboard:** A personalized dashboard with progress tracking and AI-driven study suggestions.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file (if provided) or by creating a new one. Populate it with your Firebase project configuration and a designated admin email.

    ```env
    # Firebase Configuration
    FIREBASE_API_KEY="YOUR_API_KEY"
    FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    # ... and other Firebase config keys

    # Admin User Email
    NEXT_PUBLIC_ADMIN_EMAIL="your_admin_email@example.com"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is configured for deployment on Firebase App Hosting. Simply connect your repository in the Firebase console and configure the build settings.
