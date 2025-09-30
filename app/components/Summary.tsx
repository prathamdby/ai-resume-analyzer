import ScoreBadge from "./ScoreBadge";
import ScoreGauge from "./ScoreGauge";

const buildCategoryCopy = (
  title: string,
  summary: string | undefined,
): string => {
  if (summary && summary.trim().length > 0) {
    return summary;
  }

  switch (title) {
    case "Tone & Style":
      return "Ensure the language aligns with the company voice and reads naturally.";
    case "Content":
      return "Highlight quantifiable impact, relevant achievements, and matching keywords.";
    case "Structure":
      return "Keep the layout scannable with consistent sections and spacing.";
    case "Skills":
      return "List role-specific capabilities and tools that align with the description.";
    default:
      return "Focus on actionable improvements to raise this score.";
  }
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  const categories = [
    {
      title: "Tone & Style",
      score: feedback.toneAndStyle.score,
      highlight: feedback.toneAndStyle.tips?.[0]?.tip,
    },
    {
      title: "Content",
      score: feedback.content.score,
      highlight: feedback.content.tips?.[0]?.tip,
    },
    {
      title: "Structure",
      score: feedback.structure.score,
      highlight: feedback.structure.tips?.[0]?.tip,
    },
    {
      title: "Skills",
      score: feedback.skills.score,
      highlight: feedback.skills.tips?.[0]?.tip,
    },
  ];

  return (
    <section className="section-panel surface-card">
      <div className="flex flex-col gap-6 lg:flex-row">
        <ScoreGauge score={feedback.overallScore} />
        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Your resume performance</h2>
          <p className="text-sm text-slate-600">
            Each category below contributes to the overall score. Improve the weakest areas first to
            unlock the fastest progress.
          </p>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <li
            key={category.title}
            className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white/90 px-5 py-4 shadow-[var(--shadow-ring)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">{category.title}</p>
              <ScoreBadge score={category.score} size="sm" />
            </div>
            <p className="text-sm text-slate-600">
              {buildCategoryCopy(category.title, category.highlight)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Summary;

