import { AnalysisResult } from "../utils/api";
import styles from "../styles/Home.module.css";

interface ResultsDashboardProps {
  result: AnalysisResult;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good foundation";
  return "Needs tailoring";
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <section className={styles.resultsCard} aria-labelledby="results-title">
      <div className={styles.resultsHeader}>
        <div>
          <span className={styles.eyebrow}>Analysis complete</span>
          <h2 id="results-title">Your match report</h2>
        </div>
        <span className={styles.analysisId}>Report {result.id.slice(0, 8)}</span>
      </div>

      <div className={styles.scorePanel}>
        <div
          className={styles.scoreRing}
          style={{ "--score": `${Math.min(100, Math.max(0, result.match_score)) * 3.6}deg` } as React.CSSProperties}
          aria-label={`Match score ${result.match_score} percent`}
        >
          <div><strong>{Math.round(result.match_score)}</strong><span>%</span></div>
        </div>
        <div>
          <span className={styles.scoreLabel}>{scoreLabel(result.match_score)}</span>
          <p>{result.summary}</p>
        </div>
      </div>

      <div className={styles.resultGrid}>
        <section className={styles.resultSection}>
          <div className={styles.sectionTitle}>
            <h3>Matched skills</h3>
            <span>{result.matched_skills.length}</span>
          </div>
          <div className={styles.skillList}>
            {result.matched_skills.map((skill) => <span className={styles.matchedSkill} key={skill}>{skill}</span>)}
          </div>
        </section>

        <section className={styles.resultSection}>
          <div className={styles.sectionTitle}>
            <h3>Skills to strengthen</h3>
            <span>{result.missing_skills.length}</span>
          </div>
          <div className={styles.gapList}>
            {result.missing_skills.map((item) => (
              <div className={styles.gapItem} key={item.skill}>
                <span>{item.skill}</span>
                <small className={styles[item.importance.replaceAll("-", "")] || styles.recommended}>
                  {item.importance}
                </small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.suggestionsSection}>
        <div className={styles.sectionTitle}>
          <h3>Suggested bullet rewrites</h3>
          <span>{result.bullet_suggestions.length}</span>
        </div>
        <div className={styles.suggestionList}>
          {result.bullet_suggestions.map((suggestion, index) => (
            <article className={styles.suggestion} key={`${suggestion.section}-${index}`}>
              <span className={styles.sectionPill}>{suggestion.section}</span>
              <div className={styles.beforeAfter}>
                <div><small>Before</small><p>{suggestion.original}</p></div>
                <div className={styles.after}><small>Stronger version</small><p>{suggestion.rewritten}</p></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
