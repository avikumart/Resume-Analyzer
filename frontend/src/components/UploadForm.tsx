import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import { analyzeResume, AnalysisResult } from "../utils/api";

interface UploadFormProps {
  onResult: (result: AnalysisResult) => void;
}

export default function UploadForm({ onResult }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeResume(file, jobDescription);
      onResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "#0070f3" : "#ccc"}`,
          borderRadius: 8,
          padding: "2rem",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag &amp; drop your resume (PDF, DOCX, TXT) or click to browse</p>
        )}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          style={{ marginTop: "0.5rem" }}
        />
      </div>

      <textarea
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={8}
        style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}
      />

      <button onClick={handleSubmit} disabled={loading || !file || !jobDescription.trim()}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
}
