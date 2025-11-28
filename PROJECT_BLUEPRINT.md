
# Application Blueprint: phamA2G

This document provides a high-level overview of the project structure, key components, and core functionality of the `phamA2G` application.

## 1. Project Overview

- **Framework**: Next.js (with App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Generative AI**: Google Genkit (`gemini-1.5-pro`)
- **Database & Auth**: Firebase (Firestore, Firebase Auth)
- **Deployment**: Firebase App Hosting

## 2. Directory Structure

```
.
├── src
│   ├── ai                  # Genkit AI flows and configuration
│   │   ├── flows/
│   │   └── genkit.ts
│   ├── app                 # Next.js App Router (Pages & Layouts)
│   │   ├── dashboard/      # Protected dashboard routes
│   │   ├── login/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components          # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── *.tsx           # App-specific components
│   ├── hooks               # Custom React hooks
│   ├── lib                 # Core libraries and utilities
│   │   ├── firebase.ts
│   │   └── utils.ts
│   └── services            # Backend services (e.g., Firebase interactions)
│       └── notes.ts
├── public/                 # Static assets (images, fonts, etc.)
├── firebase.json           # Firebase project configuration
├── firestore.rules         # Firestore security rules
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

## 3. Core Functionality Breakdown

### 3.1. AI Features (`src/ai`)

- **`genkit.ts`**: Initializes and configures the Genkit AI plugin with the `gemini-1.5-pro` model. This is the central point for all AI capabilities.
- **`flows/`**: This directory contains the server-side Genkit "flows" that orchestrate calls to the AI model.
    - **`generate-notes.ts`**: Creates detailed study notes from user inputs (course, subject, topic).
    - **`generate-quiz.ts`**: Generates multiple-choice quizzes based on a specified topic and difficulty.
    - **`generate-feedback.ts`**: Analyzes incorrect quiz answers to provide personalized feedback.
    - **`summarize-document.ts`**: Summarizes long-form text provided by the user.
    - **`follow-up-on-notes.ts`**: Handles conversational follow-up questions about generated notes.

### 3.2. Application Pages (`src/app`)

- **`/` (page.tsx)**: The public-facing landing page.
- **`/login` & `/signup`**: User authentication pages.
- **`/dashboard`**: The main hub for authenticated users.
    - **`layout.tsx`**: The primary layout for the dashboard, including the main navigation sidebar and header.
    - **`page.tsx`**: The main dashboard page, providing an overview and links to features.
    - **`ai-note-generator/`**: The UI for the AI Note Generator.
    - **`ai-quiz-generator/`**: The UI for the AI Quiz Generator.
    - **`ai-document-summarizer/`**: The UI for summarizing documents.
    - **`notes/`**: Displays all notes saved by the user from Firebase.
    - **`profile/`, `billing/`, `settings/`**: User account management pages.

### 3.3. Components (`src/components`)

- **App-Specific Components**:
    - **`note-generator-form.tsx`**: The form for generating AI notes, which calls the `generateNotes` flow.
    - **`quiz-generator-form.tsx`**: The setup form for creating a new quiz.
    - **`quiz-taker.tsx`**: The interface for taking a generated quiz.
    - **`quiz-results.tsx`**: Displays the user's quiz score and AI-generated feedback.
    - **`user-nav.tsx`**: The user profile dropdown in the dashboard header.
- **UI Components (`ui/`)**: Standard, reusable UI elements like `Button`, `Card`, `Input`, etc., provided by shadcn/ui.

### 3.4. Services & Data (`src/services`, `src/lib`)

- **`services/notes.ts`**: Contains functions (`getNotes`, `addNote`, `deleteNote`) for interacting with the `notes` collection in Firestore. These are server actions used by the frontend components.
- **`lib/firebase.ts`**: Initializes the connection to your Firebase project using the provided configuration. It exports the `db` (Firestore) and `auth` instances used throughout the app.
- **`lib/utils.ts`**: Standard utility functions, primarily `cn` for merging Tailwind CSS classes.

### 3.5. Authentication & Security

- **Logic**: Currently, navigation to the dashboard is handled via simple `<Link>` components. No actual authentication logic (e.g., checking user state) is implemented yet.
- **`firestore.rules`**: Defines the security rules for your Firestore database. It specifies who can read or write to different collections (e.g., only authenticated users can write to their own notes).
