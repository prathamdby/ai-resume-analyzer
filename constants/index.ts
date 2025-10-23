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
        coldOutreachMessage?: string; //a concise, professional cold LinkedIn DM the user can send to the hiring manager (150-200 words max). Make it personalized based on the resume and job description, highlighting 2-3 key strengths that match the role. Keep it friendly yet professional, and include a clear call to action.
      }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Current Date: ${currentDate}

You are an expert in ATS (Applicant Tracking System) and resume analysis.
    Please analyze and rate this resume and suggest how to improve it.
    The rating can be low if the resume is bad.
    Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
    If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
    If available, use the job description for the job user is applying to to give more detailed feedback.
    If provided, take the job description into consideration.
    The job title is: ${jobTitle}
    The job description is: ${jobDescription}

    IMPORTANT: Additionally, provide 8-12 specific line-by-line improvements in the "lineImprovements" array:
    - Focus on bullet points, summary statements, and skill descriptions
    - Prioritize changes that add quantifiable metrics (numbers, percentages, time frames)
    - Replace weak or passive verbs with strong action verbs
    - Inject relevant keywords from the job description naturally
    - Improve clarity and conciseness where needed
    - Mark priority as "high" for changes that significantly impact ATS scoring or relevance
    - Mark priority as "medium" for moderate improvements
    - Mark priority as "low" for minor refinements
    - Categorize each improvement: "quantify" (adding metrics), "action-verb" (stronger verbs), "keyword" (job description alignment), "clarity" (readability), or "ats" (formatting/parsing)
    - Ensure "original" text is exact and specific enough to locate in the resume
    - Make "suggested" text a complete, ready-to-use replacement
    - Explain "reason" in 1-2 sentences focusing on the impact and why it matters

    When creating the cold outreach message:
    - Make it sound like a friendly, professional LinkedIn DM
    - Reference the company name and job title (and any specific known initiatives or themes from the job description)
    - Highlight 2-3 concrete strengths or accomplishments from the resume that align with the role
    - Keep it concise (120-180 words), conversational, and to the point
    - End with a clear call to action asking for a short chat or opportunity to discuss fit
    - Do not include placeholders; if you are not sure about a detail, omit it rather than fabricating

    Provide the feedback using the following format: ${AIResponseFormat}
    Return the analysis as a JSON object, without any other text and without the backticks.
    Do not include any other text or comments.`;
};
