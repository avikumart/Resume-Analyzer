import { useState } from "react";
import UploadForm from "../components/UploadForm";
import ResultsDashboard from "../components/ResultsDashboard";
import { AnalysisResult } from "../utils/api";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Smart Resume &amp; Job Match Analyzer</h1>
      <UploadForm onResult={setResult} />
      {result && <ResultsDashboard result={result} />}
    </main>
  );
}
