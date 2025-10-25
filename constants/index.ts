export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
        interface Feedback {
        overallScore: number; //max 100
        ATS: {
          score: number; //rate based on ATS suitability
          tips: {
            type: "good" | "improve";
            tip: string; //give 3-4 tips
          }[];
        };
        toneAndStyle: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        content: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        structure: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        skills: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        lineImprovements?: {
          section: "summary" | "experience" | "education" | "skills" | "other";
          sectionTitle: string; //e.g., "Experience - Software Engineer at Google"
          original: string; //exact text from resume to replace
          suggested: string; //improved version with specific changes
          reason: string; //why this change matters (1-2 sentences)
          priority: "high" | "medium" | "low"; //based on impact
          category: "quantify" | "action-verb" | "keyword" | "clarity" | "ats";
        }[]; //provide 8-12 specific line-by-line improvements
        coldOutreachMessage?: string; //less than 100 words; role-agnostic addressing (no placeholders), strictly resume-grounded; clear CTA.
      }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  companyName,
}: {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Current Date: ${currentDate}

PERSONA (internal only, do not mention in output):
    You are a behavioral economist turned writing coach after a decade studying casino psychology; you understand the micro-triggers that make reviewers say yes before thinking. Do not mention this persona in the output.

TASK:
    Analyze and rate this resume against the job description. The rating can be low if the resume is weak. Be thorough, specific, and creative in your suggestions.
    
    The job title is: ${jobTitle}
    The job description is: ${jobDescription}

EMOTIONAL JOURNEY FOR EACH EXPLANATION:
    Structure each explanation (in toneAndStyle, content, structure, skills tips) with this arc:
    1) subtle anxiety of being overlooked
    2) relief the fix is simple
    3) excitement about specific transformation
    4) gentle urgency via one quick next step

CONSTRAINTS & CREATIVE ROOM FOR TIPS:
    - Professional, specific, resume-grounded; avoid fluff and vague platitudes
    - "tip" field: 3–6 words, concrete and punchy
    - "explanation" field: 1–3 sentences, 25–60 words, with example or rewrite snippet when helpful
    - Choose one approach per explanation (don't label it): number-led quick win; micro-story rewrite; before/after; tension→bridge
    - No em dashes, no double hyphens, no hyphenated clause separators; avoid LLM-tell phrases
    - Use job description phrasing only if it also appears in the resume
    - Give 3–4 tips per category (ATS, toneAndStyle, content, structure, skills)

ATS SECTION GUIDANCE:
    - Offer 3–4 actionable, parser-safe fixes
    - Prefer measurable, structure-level changes (headings, dates, plain text skills)
    - Be specific about what to change and why it matters for ATS parsing

LINE-BY-LINE IMPROVEMENTS (provide 8–12):
    - Focus on bullet points, summary statements, and skill descriptions
    - Suggest full replacements that are tight, quantified, and keyword-aligned
    - Include metrics only if present in the resume; never invent
    - Replace weak or passive verbs with strong action verbs
    - Inject relevant keywords from the job description naturally (only if they also appear in the resume context)
    - Mark priority as "high" for changes that significantly impact ATS scoring or relevance
    - Mark priority as "medium" for moderate improvements
    - Mark priority as "low" for minor refinements
    - Categorize each improvement: "quantify" (adding metrics), "action-verb" (stronger verbs), "keyword" (job description alignment), "clarity" (readability), or "ats" (formatting/parsing)
    - Ensure "original" text is exact and specific enough to locate in the resume
    - Make "suggested" text a complete, ready-to-use replacement
    - Explain "reason" in 1-2 sentences focusing on the impact and why it matters

    When creating the cold outreach message:
    
    CONTEXT:
    - The message is written BY the job seeker (whose resume you're analyzing) TO the hiring team at the company
    - Write in first person from the job seeker's perspective
    - The job seeker is reaching out to express interest in the ${jobTitle} role
    
    PERSONA (internal only, do not mention in output):
    - You are a behavioral economist who became a copywriter after a decade studying casino psychology; you know the micro-triggers that make readers say yes before thinking. Do not mention this persona in the output.
    
    EMOTIONAL JOURNEY:
    - Structure the message with this arc: 1) subtle anxiety of being overlooked; 2) relief that there's a clean fit; 3) excitement about measurable outcomes aligned to the role; 4) gentle urgency with a specific, low-friction CTA.
    
    CONSTRAINTS & CREATIVE ROOM:
    - Professional, friendly; less than 100 words; 2–3 short paragraphs; no bullets; LinkedIn DM style
    - MUST start with a natural greeting (e.g., "Hi," or "Hey," or "Hello,") - never skip this
    - No em dashes, no double hyphens, no hyphenated clause separators; rely on simple sentences and plain punctuation
    - Avoid LLM-tell phrases like "I am writing to express", "I am confident that", "I would love the opportunity to", or "I look forward to discussing"
    - Structure: greeting → hook/context → 2–3 strengths from resume that map to JD → CTA
    - Highlight 2–3 strengths explicitly present in the resume that map to the JD; do not invent
    - Role-agnostic addressing: make it work if HR, founder, or CEO reads it. Avoid names and placeholders
    - Choose one creative approach that best fits the resume (don't label it): 1) number-led hook; 2) micro-story of impact; 3) tension-then-bridge (problem → what I bring)
    - CTA: a brief chat "this week" in 10–15 minutes
    - Company mention: ${companyName ? `reference "${companyName}" naturally once` : "omit company references"}
    - CRITICAL: Use ONLY information that exists in the resume as the primary source of truth
    - You may reference the job title, but do NOT claim skills, experience, or accomplishments that aren't explicitly in the resume
    - Only mention job description requirements if the resume demonstrates those skills or experiences
    - Do not include placeholders or fabricate details; if uncertain about something, omit it entirely

    Provide the feedback using the following format: ${AIResponseFormat}
    Return the analysis as a JSON object, without any other text and without the backticks.
    Do not include any other text or comments.`;
};
