# Resumind - AI Resume Analyzer

An intelligent resume analysis platform that provides personalized feedback to help you land your dream job. Get detailed insights on your resume's ATS compatibility, content quality, structure, and more.

## ✨ Features

- 🤖 **AI-Powered Analysis** - Advanced AI evaluation of your resume content and structure
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
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **Secure Authentication** - User authentication and data storage via Puter.js
- 📄 **PDF Support** - Upload and analyze PDF resumes with visual preview
- 📚 **Resume Management** - Track multiple resumes and their performance over time

## 🛠️ Tech Stack

- **Frontend**: React Router v7, TypeScript, TailwindCSS
- **Backend**: Puter.js (Authentication, File Storage, AI, Database)
- **PDF Processing**: PDF.js
- **State Management**: Zustand
- **File Upload**: React Dropzone
- **Styling**: TailwindCSS with custom animations

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or your preferred package manager
- A Puter.js account (for AI features and authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prathamdby/ai-resume-analyzer.git
cd ai-resume-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port specified in your Vite configuration)

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

## 📖 How to Use

1. **Sign In**: Click "Sign In" to authenticate with Puter.js
2. **Upload Resume**: Navigate to the upload page and provide:
   - Company name you're applying to
   - Job title
   - Job description
   - Your resume in PDF format
3. **Get Analysis**: The AI will analyze your resume and provide detailed feedback
4. **Review Results**: View your scores, tips, and suggestions for improvement
5. **Track Progress**: Return to the home page to see all your analyzed resumes

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm run start
```

## 🐳 Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t resumind .

# Run the container
docker run -p 3000:3000 resumind
```

### Platform Deployment

The application can be deployed to any platform that supports Node.js applications:

- **Docker-based platforms**: AWS ECS, Google Cloud Run, Azure Container Apps
- **Node.js platforms**: Vercel, Netlify, Railway, Fly.io
- **Self-hosted**: Any VPS with Node.js support

### Production Requirements

Make sure to deploy the contents of the `build/` directory:
```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## 🔑 Puter.js Integration

This application relies on [Puter.js](https://puter.com) for:

- **Authentication**: User sign-in/sign-out
- **File Storage**: PDF and image storage
- **AI Processing**: Resume analysis and feedback generation
- **Database**: Key-value storage for resume data

To use the application, you'll need access to Puter.js services. The application will automatically connect to Puter.js when loaded in a Puter environment.

## 📁 Project Structure

```
├── app/
│   ├── components/     # React components
│   ├── lib/           # Utility libraries and Puter integration
│   ├── routes/        # React Router pages
│   └── root.tsx       # Root component
├── constants/         # Application constants and AI prompts
├── types/            # TypeScript type definitions
├── public/           # Static assets
└── build/           # Production build output
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and ensure they pass type checking
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is available under the MIT License.

---

Built with ❤️ using React Router and powered by Puter.js AI.
