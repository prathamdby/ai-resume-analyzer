# Resumind - AI Resume Analyzer

An intelligent resume analysis platform that provides personalized feedback to help you land your dream job. Get detailed insights on your resume's ATS compatibility, content quality, structure, and more.

## ✨ Features

- 🤖 **AI-Powered Analysis** - Claude 3.7 Sonnet evaluation of your resume content and structure via Puter.js
- 📊 **ATS Score** - Check how well your resume performs with Applicant Tracking Systems
- 🎯 **Job-Specific Feedback** - Tailored analysis based on specific job descriptions and companies
- 📈 **Detailed Scoring** - Comprehensive scoring across multiple categories:
  - Overall Performance Score
  - ATS Compatibility
  - Tone & Style
  - Content Quality
  - Structure & Layout
  - Skills Assessment
- 💡 **Actionable Tips** - Specific suggestions for improvement in each category
- 📱 **Responsive Design** - Modern, production-ready UI with Tailwind CSS 4
- 🔐 **Secure Authentication** - User authentication and data storage via Puter.js
- 📄 **PDF Support** - Upload and analyze PDF resumes with visual preview generation
- 📚 **Resume Management** - Track multiple resumes and their performance over time using Puter KV storage

## 🛠️ Tech Stack

- **Framework**: React Router v7 with TypeScript
- **Runtime**: Bun (for development and builds)
- **Styling**: Tailwind CSS v4 with custom animations
- **Backend Services**: Puter.js (Authentication, File Storage, AI, KV Database)
- **PDF Processing**: PDF.js (pdfjs-dist)
- **State Management**: Zustand
- **File Upload**: React Dropzone
- **AI Model**: Claude 3.7 Sonnet (via Puter.js)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- A modern web browser
- Access to Puter.js environment (automatically available when running in Puter)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/prathamdby/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Type Checking

Run TypeScript type checking and generate route types:

```bash
bun run typecheck
```

## 📖 How to Use

1. **Sign In**: Authenticate with Puter.js to access the platform
2. **Upload Resume**: Navigate to the upload page (`/upload`) and provide:
   - Company name (optional)
   - Job title (required)
   - Job description (required)
   - Your resume in PDF format
3. **Get Analysis**: The AI analyzes your resume against the job description and generates:
   - Overall performance score
   - Category-specific scores (ATS, Tone & Style, Content, Structure, Skills)
   - Actionable tips marked as "good" or "improve" for each category
4. **Review Results**: View your detailed feedback on the resume detail page
5. **Track Progress**: Return to the home page to see all your analyzed resumes

### Available Routes

- **`/`** (home) - Dashboard showing all analyzed resumes
- **`/auth`** - Authentication page (sign in/sign out)
- **`/upload`** - Upload and analyze a new resume
- **`/resume/:id`** - View detailed analysis for a specific resume
- **`/wipe`** - Data management and cleanup utilities

## 🔧 Development

### Build for Production

```bash
bun run build
```

### Run Production Build

```bash
bun run start
```

This serves the production build via `react-router-serve` on port 3000.

## 🐳 Deployment

### Docker Deployment

The project includes a multi-stage Dockerfile optimized for Bun:

```bash
# Build the image
docker build -t resumind .

# Run the container
docker run -p 3000:3000 resumind
```

The Dockerfile uses `oven/bun:1` as the base image and follows best practices with separate stages for development dependencies, production dependencies, and the final build.

### Platform Deployment

The application can be deployed to any platform that supports Bun or Node.js applications:

- **Docker-based platforms**: AWS ECS, Google Cloud Run, Azure Container Apps
- **Bun-compatible platforms**: Railway, Fly.io, self-hosted VPS
- **Static + serverless**: Vercel, Netlify (with React Router adapter)

### Production Requirements

The production build requires:

```
├── package.json
├── bun.lockb
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

**Important**: The application requires access to the Puter.js runtime. Deploy in a Puter environment or ensure the Puter SDK script is loaded.

## 🔑 Puter.js Integration

This application relies on [Puter.js](https://puter.com) for:

- **Authentication**: User sign-in/sign-out via `puter.auth` API
- **File Storage**: PDF and image storage using `puter.fs` (filesystem API)
- **AI Processing**: Claude 3.7 Sonnet for resume analysis via `puter.ai.chat`
- **KV Database**: Key-value storage for resume metadata via `puter.kv`

The app uses a Zustand store (`usePuterStore`) in `app/lib/puter.ts` that wraps all Puter.js interactions and provides a type-safe interface. The store automatically initializes when the Puter SDK loads in the browser.

### Key Puter Features Used

- **`puter.ai.chat`** with vision capabilities to analyze PDF resumes
- **`puter.fs.upload`** to store PDF files and generated preview images
- **`puter.kv.set/get/list`** to persist and retrieve resume analysis data
- **`puter.auth.signIn/signOut`** for user session management

## 📁 Project Structure

```
├── app/
│   ├── components/         # Reusable UI components (Navbar, FileUploader, ScoreGauge, etc.)
│   ├── lib/
│   │   ├── puter.ts       # Zustand store wrapping Puter.js SDK
│   │   ├── pdf2img.ts     # PDF to image conversion using PDF.js
│   │   └── utils.ts       # Utility functions (UUID generation, etc.)
│   ├── routes/            # React Router v7 route modules
│   │   ├── home.tsx       # Resume list view
│   │   ├── upload.tsx     # Upload and analyze workflow
│   │   ├── resume.tsx     # Individual resume detail view
│   │   ├── auth.tsx       # Authentication page
│   │   └── wipe.tsx       # Data management/cleanup
│   ├── routes.ts          # Route configuration
│   ├── root.tsx           # Root layout component
│   └── app.css            # Global styles
├── constants/
│   └── index.ts           # AI prompts and response format schemas
├── types/
│   ├── index.d.ts         # Application type definitions
│   └── puter.d.ts         # Puter.js type definitions
├── public/                # Static assets (icons, images, pdf.worker)
└── build/                 # Production build output (generated)
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Install dependencies: `bun install`
4. Make your changes following the repository guidelines (see `AGENTS.md`)
5. Run type checking: `bun run typecheck`
6. Test manually: `bun run dev`
7. Commit your changes with a clear message: `git commit -m 'Add new feature'`
8. Push to the branch: `git push origin feature/new-feature`
9. Submit a pull request with:
   - Clear problem statement
   - Screenshots/recordings for UI changes
   - Notes on testing performed

### Development Guidelines

- Use **Bun** for all package management and scripts
- Follow **TypeScript** strict mode conventions
- Use **Tailwind CSS** utility classes (2-space indentation)
- Encapsulate Puter.js calls in `app/lib/puter.ts`
- Keep routes modular: page logic in `app/routes/`, shared UI in `app/components/`
- Maintain type safety: all PRs must pass `bun run typecheck`

## 📄 License

This project is available under the MIT License.

---

Built with ❤️ using React Router and powered by Puter.js AI.
