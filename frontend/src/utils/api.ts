import axios, { AxiosError } from "axios";

// Always use the frontend origin. Next.js proxies /api/* to the server-only
// BACKEND_URL, preventing stale public environment variables and CORS drift.
const API_BASE = "/api";

export interface MissingSkill {
  skill: string;
  importance: string;
}

export interface BulletSuggestion {
  original: string;
  rewritten: string;
  section: string;
}

export interface AnalysisResult {
  id: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  bullet_suggestions: BulletSuggestion[];
  summary: string;
}

export interface ApiHealth {
  status: string;
  service: string;
  timestamp: string;
}

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function toApiRequestError(error: unknown): ApiRequestError {
  if (!(error instanceof AxiosError)) {
    return new ApiRequestError("Something unexpected happened. Please try again.");
  }

  const status = error.response?.status;
  const responseData = error.response?.data as { detail?: string; message?: string } | undefined;

  if (responseData?.detail) return new ApiRequestError(responseData.detail, status);
  if (responseData?.message) return new ApiRequestError(responseData.message, status);
  if (error.code === "ECONNABORTED") {
    return new ApiRequestError("The analysis took too long. Please try again with a smaller resume.");
  }
  if (!error.response) {
    return new ApiRequestError("The API could not be reached. Check your connection and try again.");
  }

  return new ApiRequestError(`The analysis service returned an error (${status ?? "unknown"}).`, status);
}

export async function getApiHealth(): Promise<ApiHealth> {
  try {
    const { data } = await axios.get<ApiHealth>(`${API_BASE}/health`, { timeout: 10_000 });
    return data;
  } catch (error) {
    throw toApiRequestError(error);
  }
}

export async function analyzeResume(file: File, jobDescription: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_description", jobDescription);

  try {
    const { data } = await axios.post<AnalysisResult>(`${API_BASE}/analyze/`, formData, {
      timeout: 75_000,
    });
    return data;
  } catch (error) {
    throw toApiRequestError(error);
  }
}

export async function getHistory(): Promise<AnalysisResult[]> {
  const { data } = await axios.get<AnalysisResult[]>(`${API_BASE}/analyze/history`);
  return data;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const { data } = await axios.get<AnalysisResult>(`${API_BASE}/analyze/${encodeURIComponent(id)}`);
  return data;
}
