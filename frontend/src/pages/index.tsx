import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadForm from "../components/UploadForm";
import ResultsDashboard from "../components/ResultsDashboard";
import { AnalysisResult, getApiHealth } from "../utils/api";
import styles from "../styles/Home.module.css";

type ApiStatus = "checking" | "online" | "offline";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const resultsRef = useRef<HTMLDivElement>(null);

  const checkConnection = useCallback(async () => {
    setApiStatus("checking");
    try {
      await getApiHealth();
      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  const handleResult = (analysis: AnalysisResult) => {
    setResult(analysis);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <Head>
        <title>Resume Match Analyzer</title>
        <meta
          name="description"
          content="Compare your resume with a job description and get an AI-powered match analysis."
        />
      </Head>
      <div className={styles.page}>
        <header className={styles.topbar}>
          <a className={styles.brand} href="#top" aria-label="Resume Match Analyzer home">
            <span className={styles.brandMark}>R</span>
            <span>Resume Match</span>
          </a>
          <div className={`${styles.statusBadge} ${styles[apiStatus]}`}>
            <span className={styles.statusDot} aria-hidden="true" />
            {apiStatus === "checking" ? "Checking API" : apiStatus === "online" ? "API connected" : "API offline"}
          </div>
        </header>

        <main id="top" className={styles.main}>
          <section className={styles.hero}>
            <span className={styles.heroLabel}>AI-powered resume intelligence</span>
            <h1>See how well your resume matches the job.</h1>
            <p>
              Upload your resume and paste the role. Get a focused match score, missing skills,
              and concrete rewrites you can use before applying.
            </p>
            <div className={styles.featureRow} aria-label="Analysis features">
              <span>Match scoring</span>
              <span>Skill-gap analysis</span>
              <span>Bullet rewrites</span>
            </div>
          </section>

          <UploadForm
            apiOnline={apiStatus === "online"}
            onAnalysisStart={() => setResult(null)}
            onResult={handleResult}
            onRetryConnection={checkConnection}
          />

          <div ref={resultsRef} className={styles.resultsAnchor}>
            {result && <ResultsDashboard result={result} />}
          </div>
        </main>

        <footer className={styles.footer}>
          Resume Match Analyzer · Results are suggestions; review them before updating your resume.
        </footer>
      </div>
      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #f4f7f5; color: #16231d; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        button, textarea, input { font: inherit; }
      `}</style>
    </>
  );
}
