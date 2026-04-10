import { AnalysisResult } from "../utils/api";

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Score Ring */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `6px solid ${result.match_score >= 70 ? "#22c55e" : result.match_score >= 40 ? "#f59e0b" : "#ef4444"}`,
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          {result.match_score}%
        </div>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>Match Score</p>
      </div>

      {/* Matched Skills */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Matched Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {result.matched_skills.map((skill) => (
            <span
              key={skill}
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "0.25rem 0.75rem",
                borderRadius: 16,
                fontSize: "0.875rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Missing Skills / Gaps */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Skill Gaps</h3>
        <ul>
          {result.missing_skills.map((ms) => (
            <li key={ms.skill}>
              <strong>{ms.skill}</strong>{" "}
              <span style={{ color: ms.importance === "critical" ? "#ef4444" : "#f59e0b" }}>
                ({ms.importance})
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bullet Rewrites */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Bullet Suggestions</h3>
        {result.bullet_suggestions.map((bs, i) => (
          <div key={i} style={{ marginBottom: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: 8 }}>
            <p style={{ color: "#999", textDecoration: "line-through" }}>{bs.original}</p>
            <p style={{ color: "#111", fontWeight: 500 }}>{bs.rewritten}</p>
            <small style={{ color: "#888" }}>Section: {bs.section}</small>
          </div>
        ))}
      </section>

      {/* Summary */}
      <section>
        <h3>Summary</h3>
        <p>{result.summary}</p>
      </section>
    </div>
  );
}
