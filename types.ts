
export type Role = "School Student" | "Undergraduate" | "Postgraduate" | "Researcher" | "Startup Founder / Innovator";
export type Language = "English" | "Hindi" | "Bengali" | "Tamil" | "Telugu" | "Kannada" | "Marathi" | "Gujarati" | "Malayalam" | "Punjabi" | "Assamese" | "Odia" | "Manipuri" | "Mixed / Other";

export type TabId = 'roadmap' | 'rnd' | 'startup' | 'paper' | 'visual' | 'library';

export type StartupToolId = 
  | 'blueprint' 
  | 'competitor' 
  | 'pitch' 
  | 'roadmap' 
  | 'finance' 
  | 'funding' 
  | 'prd' 
  | 'legal' 
  | 'brand' 
  | 'gtm' 
  | 'simulator' 
  | 'tech';

export type PaperToolId =
  | 'deep_explain'
  | 'lit_review'
  | 'gap_finder'
  | 'compare'
  | 'reproduce'
  | 'visualize'
  | 'extract'
  | 'prereq'
  | 'citation'
  | 'simplify'
  | 'presentation'
  | 'code'
  | 'paraphrase'
  | 'review'
  | 'fusion'     // Live Web + Paper Fusion
  | 'drafter'    // Paper Pipeline Constructor
  | 'validator'  // Research Validation Engine
  | 'diagram_gen'; // NEW: Scientific Diagram Generator

export type RndToolId = 
  | 'discovery'
  | 'proposal'
  | 'experiment'
  | 'dataset'
  | 'score'
  | 'patent'
  | 'comparison'
  | 'cross_disciplinary'
  | 'funding'
  | 'industry'
  | 'roadmap'
  | 'collaboration'
  | 'ethics'
  | 'ara'           // Autonomous Research Agent
  | 'collab_swarm'  // Multi-Agent Collaboration
  | 'hypothesis'    // AI Hypothesis Generator
  | 'data_analyst'  // Live Dataset Analyzer
  | 'unknowns'      // Discovery Mode
  | 'code_sandbox'  // NEW: Code Execution Sandbox
  | 'biotech'       // NEW: Biotech Super Agent
  | 'legal_research'// NEW: Legal Research Agent
  | 'quant';        // NEW: Finance Quant Agent

export type RoadmapToolId = 
  | 'adaptive'
  | 'gap_analyzer'
  | 'curator'
  | 'planner'
  | 'visualizer'
  | 'practice'
  | 'project'
  | 'exam'
  | 'career'
  | 'style'
  | 'doubt'
  | 'revision'
  | 'tutor'      // Autonomous Coursework Tutor
  | 'professor'; // Explain Like a Professor

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
  size: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
  // Specific for Roadmap visualization
  roadmapData?: RoadmapNode;
  // Specific for Search Grounding
  groundingSources?: GroundingSource[];
  // Specific for Image Analysis
  imagePreview?: string;
  // Specific for Paper Explainer
  attachments?: Attachment[];
}

export interface RoadmapNode {
  name: string;
  children?: RoadmapNode[];
  description?: string;
}

export interface UserContext {
  role: Role;
  language: Language;
}

export interface ChatSession {
  id: string;
  tab: TabId;
  messages: Message[];
  title: string;
  timestamp: number;
}

export interface ResearchPaper {
    title: string;
    authors: string[];
    year: string;
    abstract: string;
    url: string;
    source: 'arXiv' | 'Semantic Scholar';
}
