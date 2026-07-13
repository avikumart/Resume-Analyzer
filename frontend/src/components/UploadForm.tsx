import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { analyzeResume, ApiRequestError, AnalysisResult } from "../utils/api";
import styles from "../styles/Home.module.css";

interface UploadFormProps {
  apiOnline: boolean;
  onAnalysisStart: () => void;
  onResult: (result: AnalysisResult) => void;
  onRetryConnection: () => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

function validateFile(candidate: File): string | null {
  const extension = candidate.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return "Choose a PDF, DOCX, or TXT resume.";
  }
  if (candidate.size > MAX_FILE_SIZE) {
    return "Your resume must be smaller than 4 MB for this deployment.";
  }
  if (candidate.size === 0) return "The selected file is empty.";
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadForm({
  apiOnline,
  onAnalysisStart,
  onResult,
  onRetryConnection,
}: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((candidate?: File) => {
    if (!candidate) return;
    const validationError = validateFile(candidate);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }
    setFile(candidate);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      selectFile(event.dataTransfer.files[0]);
    },
    [selectFile],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Add your resume before starting the analysis.");
      return;
    }
    if (jobDescription.trim().length < 80) {
      setError("Add a fuller job description (at least 80 characters) for a useful comparison.");
      return;
    }
    if (!apiOnline) {
      setError("The analysis API is offline. Retry the connection before submitting.");
      return;
    }

    setLoading(true);
    onAnalysisStart();
    try {
      const result = await analyzeResume(file, jobDescription.trim());
      onResult(result);
    } catch (requestError) {
      const message =
        requestError instanceof ApiRequestError
          ? requestError.message
          : "Analysis failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeading}>
        <div>
          <span className={styles.eyebrow}>New analysis</span>
          <h2>Compare your resume to a role</h2>
        </div>
        <span className={styles.secureNote}>Files are processed securely</span>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <label className={styles.fieldLabel} htmlFor="resume-file">
            <span className={styles.stepNumber}>1</span> Upload your resume
          </label>
          <span className={styles.fieldHint}>PDF, DOCX, or TXT · 4 MB max</span>
        </div>

        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${file ? styles.dropzoneReady : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id="resume-file"
            className={styles.visuallyHidden}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
          {file ? (
            <div className={styles.selectedFile}>
              <span className={styles.fileIcon} aria-hidden="true">✓</span>
              <div>
                <strong>{file.name}</strong>
                <span>{formatFileSize(file.size)} · Ready to analyze</span>
              </div>
              <button
                className={styles.textButton}
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </button>
            </div>
          ) : (
            <button className={styles.dropzoneButton} type="button" onClick={() => inputRef.current?.click()}>
              <span className={styles.uploadIcon} aria-hidden="true">↑</span>
              <strong>Drop your resume here</strong>
              <span>or click to choose a file</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabelRow}>
          <label className={styles.fieldLabel} htmlFor="job-description">
            <span className={styles.stepNumber}>2</span> Paste the job description
          </label>
          <span className={styles.fieldHint}>{jobDescription.trim().length.toLocaleString()} characters</span>
        </div>
        <textarea
          id="job-description"
          className={styles.textarea}
          placeholder="Paste the responsibilities, required skills, and qualifications from the job posting…"
          value={jobDescription}
          onChange={(event) => {
            setJobDescription(event.target.value);
            if (error) setError(null);
          }}
          rows={10}
          disabled={loading}
        />
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          <span aria-hidden="true">!</span>
          <div>
            <strong>We couldn&apos;t start the analysis</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!apiOnline && (
        <button className={styles.retryButton} type="button" onClick={onRetryConnection}>
          Retry API connection
        </button>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={loading || !file || jobDescription.trim().length < 80 || !apiOnline}
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Analyzing your match…
          </>
        ) : (
          <>Analyze resume <span aria-hidden="true">→</span></>
        )}
      </button>
      <p className={styles.submitHint} aria-live="polite">
        {loading
          ? "Your resume is being compared with the role. This usually takes a few seconds."
          : "You’ll receive a match score, skill gaps, and stronger bullet suggestions."}
      </p>
    </form>
  );
}
