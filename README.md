# 📊 StatPath AI — Intelligent Skill Management & Competency Platform

> **Smart India Hackathon (SIH) Project**  
> Empowering India's Official Statistical System (MoSPI, NSSO, & State DES) with AI-driven, continuous competency development aligned with **Mission Karmayogi (FRAC Framework)**.

---

## 🌟 Overview

**StatPath AI** is an intelligent skill management and adaptive learning platform designed for statistical officers and government data analysts. Instead of periodic training programs, StatPath AI creates a continuous **Competency Twin** for every official, measuring skill levels, identifying gaps, and generating adaptive AI-guided learning pathways.

### Key Institutional Pillars
- 🏛️ **National Alignment**: MoSPI, NSSO, & iGOT Karmayogi (FRAC Competency Framework)
- 🤝 **State Partner Integration**: Directorate of Economics and Statistics (Govt of Karnataka)
- 🎯 **Role-Based Competencies**: Dynamic mapping from rule-based to role-based skill mastery
- 🌐 **Inclusive & Multilingual**: Supports 12+ Indian languages for seamless regional adoption

---

## 🔥 Key Features

### 1. 🎓 Learner Experience & AI Guidance
- **AI-Guided Learning Pathways**: Dynamic learning tracks tailored to specific statistical roles (e.g., Spatial Analytics, Sample Survey Design, National Accounts).
- **Daily Micro-Learning & MCQs**: Interactive daily bite-sized modules powered by Google Gemini AI for instant assessment generation.
- **Competency Tree**: Visual breakdown of technical, domain, and behavioral competencies.
- **Career Progression Engine**: Skill gap recommendations aligned with promotional roadmaps in government statistical Cadres.
- **AI Studio**: Interactive statistical playground and AI tutor assistant.

### 2. 👩‍🏫 Trainer & Educator Portal
- **Curriculum Builder**: Design role-specific modules and align assessments with NSQF/NCVET guidelines.
- **Class Analytics**: Real-time cohort progression tracking and skill deficiency alerts.
- **Automated Evaluation**: AI-assisted grading and item-response analytics.

### 3. 🏢 Admin & Governance Dashboard
- **Regional & Departmental Skill Maps**: Real-time insights into state-wide capability readiness for MoSPI & DES officials.
- **FRAC & NCVET Alignment**: Standardized framework compliance monitoring.

### 4. 🌐 Multilingual Accessibility
- Real-time language switching supporting 12+ official Indian languages (Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, etc.).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Modern CSS Modules & Global Design System with custom dark/glassmorphic aesthetics
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini API)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started & Setup Guide

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher (or `yarn` / `pnpm` / `bun`)
- **Git**

### Installation Steps

1. **Clone the Repository** (or navigate to project directory):
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd statpath-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Gemini API key (optional for AI generation features):
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production server after building |
| `npm run lint` | Runs ESLint to check for code quality issues |

---

## 📁 Folder Structure

```
statpath-ai/
├── public/                # Static assets (images, logos, data JSONs)
├── src/
│   ├── app/               # Next.js App Router pages & API routes
│   │   ├── about/         # Institutional vision & Mission Karmayogi alignment
│   │   ├── admin/         # Government administrator dashboard
│   │   ├── api/           # API routes (e.g. Gemini MCQ generator)
│   │   ├── auth/          # Login & Signup forms
│   │   ├── dashboard/     # Officer/Learner dashboard suite
│   │   ├── onboarding/    # Diagnostic competency assessment
│   │   ├── trainer/       # Educator/Trainer portal
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Landing page
│   ├── components/        # Reusable UI components (Header, Logo, Translator)
│   └── lib/               # Types, mock data, recommendation engine & contexts
├── package.json           # Dependencies & scripts
└── tsconfig.json          # TypeScript configuration
```

---

## 🌐 Hosting & Deployment

StatPath AI is optimized for seamless zero-config deployment on **Vercel** or any Node.js hosting platform (Netlify, AWS Amplify, Railway, Docker).

### Deploying on Vercel
1. Push your code to a GitHub / GitLab repository.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Set the Environment Variable `NEXT_PUBLIC_GEMINI_API_KEY` (if applicable).
4. Click **Deploy**. Vercel will automatically build and publish your project!

---

## 📄 License

Developed for **Smart India Hackathon (SIH)**. All rights reserved.
