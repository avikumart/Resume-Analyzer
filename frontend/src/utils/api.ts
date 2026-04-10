import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export async function analyzeResume(file: File, jobDescription: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_description", jobDescription);

  const { data } = await axios.post<AnalysisResult>(`${API_BASE}/api/analyze/`, formData);
  return data;
}

export async function getHistory(): Promise<AnalysisResult[]> {
  const { data } = await axios.get<AnalysisResult[]>(`${API_BASE}/api/analyze/history`);
  return data;
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const { data } = await axios.get<AnalysisResult>(`${API_BASE}/api/analyze/${encodeURIComponent(id)}`);
  return data;
}
