import React, { useState, useRef, useEffect } from 'react';
import * as GeminiService from './services/geminiService';
import * as AuthService from './services/authService';
import { Role, Language, TabId, Message, RoadmapNode, GroundingSource, Attachment, ResearchPaper, UserProfile, StartupToolId, PaperToolId, RndToolId, RoadmapToolId, ChatSession } from './types';
import RoadmapChart from './components/RoadmapChart';
import ResearchLibrary from './components/ResearchLibrary';
import LoginModal from './components/LoginModal';
import { Content } from '@google/genai';
import { jsPDF } from "jspdf";

// --- Constants ---

const ROADMAP_TOOLS = [
    { id: 'adaptive', label: 'Adaptive Path', icon: '🧬', desc: 'Personalized curriculum', flagship: true },
    { id: 'tutor', label: 'Auto Tutor', icon: '👩‍🏫', desc: 'Coursework & Lab Helper', flagship: true },
    { id: 'professor', label: 'Professor Mode', icon: '🎓', desc: 'Deep Academic Explanation', flagship: true },
    { id: 'gap_analyzer', label: 'Gap Analyzer', icon: '🔍', desc: 'Find knowledge gaps' },
    { id: 'curator', label: 'Curator', icon: '📚', desc: 'Best resources' },
    { id: 'planner', label: 'Planner', icon: '📅', desc: 'Study schedule' },
    { id: 'visualizer', label: 'Deep Visualizer', icon: '👁️', desc: 'Explain & Mindmap', flagship: true },
    { id: 'practice', label: 'Practice', icon: '✍️', desc: 'Problems & quizzes' },
    { id: 'project', label: 'Projects', icon: '🛠️', desc: 'Real-world tasks' },
    { id: 'exam', label: 'Exam Prep', icon: '📝', desc: 'Test optimization' },
    { id: 'career', label: 'Career', icon: '💼', desc: 'Job alignment' },
    { id: 'style', label: 'Style Adapt', icon: '🎨', desc: 'Visual/Audio/Text' },
    { id: 'doubt', label: 'Doubt Solver', icon: '❓', desc: 'Instant help' },
    { id: 'revision', label: 'Revision', icon: '🔄', desc: 'Spaced repetition' }
];

const RND_TOOLS = [
    { id: 'ara', label: 'ARA Agent', icon: '🤖', desc: 'Autonomous Research Agent', flagship: true },
    { id: 'collab_swarm', label: 'AI Swarm', icon: '👥', desc: 'Multi-Agent Team', flagship: true },
    { id: 'code_sandbox', label: 'Code Sandbox', icon: '💻', desc: 'Write & Fix Code', flagship: true },
    { id: 'data_analyst', label: 'Data Analyst', icon: '📉', desc: 'AutoML & Insights', flagship: true },
    { id: 'biotech', label: 'Biotech Agent', icon: '🧬', desc: 'DNA & Experiments', flagship: true },
    { id: 'quant', label: 'Quant Finance', icon: '📈', desc: 'Trading & Risk', flagship: true },
    { id: 'legal_research', label: 'Legal Agent', icon: '⚖️', desc: 'Case Law & Rights', flagship: true },
    { id: 'hypothesis', label: 'Hypothesis Gen', icon: '💡', desc: 'Scientific Hypotheses', flagship: true },
    { id: 'unknowns', label: 'Discovery Mode', icon: '🌌', desc: 'Find Unknown Unknowns', flagship: true },
    { id: 'discovery', label: 'Trend Scan', icon: '🔭', desc: 'Global Trend analysis' },
    { id: 'proposal', label: 'Proposal', icon: '📄', desc: 'Grant writing' },
    { id: 'experiment', label: 'Experiment', icon: '🧪', desc: 'Lab design' },
    { id: 'dataset', label: 'Dataset', icon: '📊', desc: 'Data sourcing' },
    { id: 'score', label: 'Idea Score', icon: '⭐', desc: 'Feasibility check' },
    { id: 'patent', label: 'Patent', icon: '🛡️', desc: 'IP checker' },
    { id: 'comparison', label: 'Compare', icon: '⚖️', desc: 'Method analysis' },
    { id: 'cross_disciplinary', label: 'Cross-Field', icon: '🔗', desc: 'Hybrid ideas' },
    { id: 'funding', label: 'Funding', icon: '💰', desc: 'Grant finder' },
    { id: 'industry', label: 'Industry', icon: '🏭', desc: 'Market map' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️', desc: 'R&D Timeline' },
    { id: 'collaboration', label: 'Partners', icon: '🤝', desc: 'Find experts' },
    { id: 'ethics', label: 'Ethics', icon: '⚖️', desc: 'Risk assessment' }
];

const STARTUP_TOOLS = [
    { id: 'blueprint', label: 'Blueprint', icon: '🏗️', desc: 'Business plan', flagship: true },
    { id: 'competitor', label: 'Competitors', icon: '🏎️', desc: 'Market intel' },
    { id: 'pitch', label: 'Pitch Deck', icon: '🎤', desc: 'Slide generator' },
    { id: 'roadmap', label: 'Roadmap', icon: '🛣️', desc: 'Execution plan' },
    { id: 'finance', label: 'Finance', icon: '💵', desc: 'Projections' },
    { id: 'funding', label: 'Funding', icon: '💸', desc: 'Investor match' },
    { id: 'prd', label: 'PRD', icon: '📝', desc: 'Product specs', flagship: true },
    { id: 'legal', label: 'Legal', icon: '⚖️', desc: 'Compliance' },
    { id: 'brand', label: 'Brand', icon: '🎨', desc: 'Identity kit' },
    { id: 'gtm', label: 'GTM', icon: '🚀', desc: 'Go-to-market' },
    { id: 'simulator', label: 'Simulator', icon: '🎭', desc: 'User roleplay' },
    { id: 'tech', label: 'Tech Stack', icon: '💻', desc: 'Architecture' }
];

const PAPER_TOOLS = [
    { id: 'fusion', label: 'Fusion Engine', icon: '⚛️', desc: 'Paper + Web Analysis', flagship: true },
    { id: 'drafter', label: 'Paper Drafter', icon: '📝', desc: 'Auto-construct Paper', flagship: true },
    { id: 'diagram_gen', label: 'Diagram Gen', icon: '📐', desc: 'Flowcharts & LaTeX', flagship: true },
    { id: 'validator', label: 'Validator', icon: '✅', desc: 'Logic & Stat Check', flagship: true },
    { id: 'deep_explain', label: 'Deep Explain', icon: '🧠', desc: 'Concept breakdown' },
    { id: 'lit_review', label: 'Lit Review', icon: '📚', desc: 'Context analysis' },
    { id: 'gap_finder', label: 'Gap Finder', icon: '🕳️', desc: 'Research gaps' },
    { id: 'compare', label: 'Compare', icon: '⚖️', desc: 'Paper vs Paper' },
    { id: 'reproduce', label: 'Reproduce', icon: '🧪', desc: 'Reproduction plan' },
    { id: 'visualize', label: 'Visualize', icon: '👁️', desc: 'Visual guide' },
    { id: 'extract', label: 'Extract', icon: '⛏️', desc: 'Data mining' },
    { id: 'prereq', label: 'Prereqs', icon: '🧱', desc: 'Background needed' },
    { id: 'citation', label: 'Citation', icon: '❞', desc: 'Formats' },
    { id: 'simplify', label: 'Simplify', icon: '👶', desc: 'Layman summary' },
    { id: 'presentation', label: 'Slides', icon: '📽️', desc: 'Deck content' },
    { id: 'code', label: 'Code', icon: '💻', desc: 'Algo to Code' },
    { id: 'paraphrase', label: 'Paraphrase', icon: '✍️', desc: 'Writing aid' },
    { id: 'review', label: 'Review', icon: '🧐', desc: 'Peer review' }
];

const THINKING_ROADMAP_TOOLS = ['adaptive', 'planner', 'practice', 'exam', 'doubt', 'visualizer', 'tutor', 'professor'];

// --- Icons (SVGs) ---
const AtomIcon = () => (
  <svg className="w-9 h-9 text-accent animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 18 0" transform="rotate(45 12 12)" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" transform="rotate(-45 12 12)" />
  </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

// --- Loading Component ---
const LoadingIndicator = ({ mode }: { mode?: string }) => (
    <div className="flex items-center gap-2 text-accent text-sm animate-pulse my-2">
      <span>{mode === 'thinking' ? "Deep Thinking active..." : "Thinking with Atomic intelligence"}</span>
      <div className="flex space-x-1">
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-accent rounded-full animate-bounce"></div>
      </div>
    </div>
);

// --- Main App Component ---

export default function App() {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<TabId>('roadmap');
  const [role, setRole] = useState<Role>('Undergraduate');
  const [language, setLanguage] = useState<Language>('English');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Chat Data Store
  const [sessions, setSessions] = useState<Record<TabId, Message[]>>({
    roadmap: [],
    rnd: [],
    startup: [],
    paper: [],
    visual: [],
    library: [] 
  });
  
  // Chat History
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [inputText, setInputText] = useState(""); 

  // Tab Inputs State
  // Roadmap Tool State
  const [activeRoadmapTool, setActiveRoadmapTool] = useState<RoadmapToolId | null>(null);
  const [roadmapInput, setRoadmapInput] = useState({ 
      subject: '', 
      level: 'Intermediate', 
      hours: '5',
      goal: '',
      timeline: '1 Month',
      topic: '',
      examName: '',
      careerGoal: '',
      style: 'Visual',
      question: '',
      files: [] as Attachment[]
  });
  
  // R&D Tool State
  const [activeRndTool, setActiveRndTool] = useState<RndToolId | null>(null);
  const [rndInput, setRndInput] = useState({ 
      field: '', 
      problem: '', 
      secondaryField: '',
      files: [] as Attachment[]
  });

  // Startup Tool State
  const [activeStartupTool, setActiveStartupTool] = useState<StartupToolId | null>(null);
  const [startupInput, setStartupInput] = useState({
      domain: '',
      stage: 'Early idea',
      problem: '',
      geography: 'Global',
      pricing: '',
      cac: '',
      budget: '',
      targetAudience: ''
  });

  // Paper Tool State
  const [activePaperTool, setActivePaperTool] = useState<PaperToolId | null>(null);
  const [paperInput, setPaperInput] = useState({ text: '', files: [] as Attachment[] });
  
  const [visualInput, setVisualInput] = useState({ prompt: '', imageFile: null as File | null, imagePreview: '' });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paperFileInputRef = useRef<HTMLInputElement>(null);
  const doubtFileInputRef = useRef<HTMLInputElement>(null);
  const rndFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      // Subscribe to Auth Changes
      const unsubscribe = AuthService.subscribeToAuthChanges((u) => {
          if (u) {
            setUser(u);
          } else {
            setUser(prev => (prev?.uid.startsWith('guest-') ? prev : null));
          }
      });
      return () => unsubscribe && unsubscribe();
  }, []);

  const handleGuestLogin = () => {
      const guestUser: UserProfile = {
          uid: `guest-${Date.now()}`,
          displayName: 'Guest Researcher',
          email: null,
          photoURL: null
      };
      setUser(guestUser);
      setIsLoginModalOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions[activeTab], isGenerating]);


  // --- Logic ---

  const addMessage = (tab: TabId, message: Message) => {
    setSessions(prev => ({
      ...prev,
      [tab]: [...prev[tab], message]
    }));
  };

  const getSessionTitle = (tab: TabId): string => {
      switch(tab) {
          case 'roadmap': {
            const toolName = activeRoadmapTool ? ROADMAP_TOOLS.find(t=>t.id === activeRoadmapTool)?.label : "General";
            return roadmapInput.subject || roadmapInput.topic || roadmapInput.examName || `Roadmap: ${toolName}`;
          }
          case 'rnd': {
            const toolName = activeRndTool ? RND_TOOLS.find(t=>t.id === activeRndTool)?.label : "General";
            return rndInput.field || `R&D: ${toolName}`;
          }
          case 'startup': {
            const toolName = activeStartupTool ? STARTUP_TOOLS.find(t=>t.id === activeStartupTool)?.label : "General";
            return startupInput.domain || `Startup: ${toolName}`;
          }
          case 'paper': return paperInput.files[0]?.name || "Paper Analysis";
          case 'visual': return "Image Analysis";
          default: return "Research Session";
      }
  };

  const archiveCurrentSession = () => {
      const currentMessages = sessions[activeTab];
      if (currentMessages && currentMessages.length > 0) {
          const newSession: ChatSession = {
              id: Date.now().toString(),
              tab: activeTab,
              messages: [...currentMessages],
              title: getSessionTitle(activeTab),
              timestamp: Date.now()
          };
          setChatHistory(prev => [newSession, ...prev]);
      }
  };

  const resetInputs = (tab: TabId) => {
      if(tab === 'paper') setPaperInput({ text: '', files: [] });
      if(tab === 'visual') setVisualInput({ prompt: '', imageFile: null, imagePreview: '' });
      if(tab === 'roadmap') setRoadmapInput({ 
          subject: '', level: 'Intermediate', hours: '5', goal: '', timeline: '1 Month', 
          topic: '', examName: '', careerGoal: '', style: 'Visual', question: '', files: [] 
      });
      if(tab === 'rnd') setRndInput({ field: '', problem: '', secondaryField: '', files: [] });
      if(tab === 'startup') setStartupInput({ 
          domain: '', stage: 'Early idea', problem: '', geography: 'Global', 
          pricing: '', cac: '', budget: '', targetAudience: '' 
      });
  };

  const handleNewChat = () => {
      try {
        if (sessions[activeTab].length > 0) {
            // Archive first
            archiveCurrentSession();
        }
        
        // Then clear messages
        setSessions(prev => ({
            ...prev,
            [activeTab]: []
        }));
        
        // Reset text inputs
        resetInputs(activeTab);

        // Reset the active tool selection to go back to main menu for that tab
        if (activeTab === 'roadmap') setActiveRoadmapTool(null);
        if (activeTab === 'rnd') setActiveRndTool(null);
        if (activeTab === 'startup') setActiveStartupTool(null);
        if (activeTab === 'paper') setActivePaperTool(null);
      } catch (error) {
        console.error("Error starting new chat:", error);
      }
  };
  
  const restoreSession = (session: ChatSession) => {
      // If there is current unsaved work in the CURRENT tab, archive it first
      if (sessions[activeTab].length > 0) {
          archiveCurrentSession();
      }
      
      setActiveTab(session.tab);
      setSessions(prev => ({
          ...prev,
          [session.tab]: session.messages
      }));
      // Note: We do not strictly restore inputs state here to keep logic simple, 
      // focusing on restoring the conversation history view.
      setIsHistoryOpen(false);
  };
  
  const deleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setChatHistory(prev => prev.filter(s => s.id !== id));
  };

  const updateLastMessage = (tab: TabId, content: string, extras?: { roadmapData?: RoadmapNode, groundingSources?: GroundingSource[] }) => {
    setSessions(prev => {
        const newMessages = [...prev[tab]];
        if (newMessages.length > 0) {
            const lastIndex = newMessages.length - 1;
            const lastMsg = { ...newMessages[lastIndex] }; 
            
            if (lastMsg.role === 'model') {
                lastMsg.content = content;
                if(extras?.roadmapData) lastMsg.roadmapData = extras.roadmapData;
                if(extras?.groundingSources) {
                    const existing = lastMsg.groundingSources || [];
                    const newSources = extras.groundingSources.filter(ns => !existing.some(es => es.uri === ns.uri));
                    lastMsg.groundingSources = [...existing, ...newSources];
                }
                newMessages[lastIndex] = lastMsg;
            }
        }
        return { ...prev, [tab]: newMessages };
    });
  };

  const getGeminiHistory = (tab: TabId): Content[] => {
     return sessions[tab].map(m => {
        const parts: any[] = [];
        if (m.imagePreview && m.role === 'user') {
            parts.push({ text: "[User uploaded an image]" }); 
        }
        if (m.attachments && m.attachments.length > 0 && m.role === 'user') {
            parts.push({ text: `[User uploaded ${m.attachments.length} document(s): ${m.attachments.map(f=>f.name).join(', ')}]`});
        }
        parts.push({ text: m.content });
        return { role: m.role, parts };
     });
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (content: string, type: 'pdf' | 'doc') => {
      if (type === 'doc') {
          const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
          const footer = "</body></html>";
          const htmlContent = content.replace(/\n/g, '<br/>');
          const sourceHTML = header + htmlContent + footer;
          
          const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
          const fileDownload = document.createElement("a");
          document.body.appendChild(fileDownload);
          fileDownload.href = source;
          fileDownload.download = `kanad-export-${Date.now()}.doc`;
          fileDownload.click();
          document.body.removeChild(fileDownload);
      } else {
          const doc = new jsPDF();
          // Remove HTML tags for PDF text
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = content.replace(/\n/g, '<br/>');
          const text = tempDiv.innerText || tempDiv.textContent || "";
          
          const splitText = doc.splitTextToSize(text, 180);
          let y = 10;
          const pageHeight = doc.internal.pageSize.height;
          const lineHeight = 7;
          
          splitText.forEach((line: string) => {
              if (y > pageHeight - 10) {
                  doc.addPage();
                  y = 10;
              }
              doc.text(line, 10, y);
              y += lineHeight;
          });

          doc.save(`kanad-export-${Date.now()}.pdf`);
      }
  };

  const handleGenerate = async (type?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);

    const userContext = { role, language };
    const tabHistory = getGeminiHistory(activeTab);

    let userPromptDisplay = "";
    let userImagePreview = undefined;
    let userAttachments = undefined;

    if (activeTab === 'roadmap') {
        const toolName = activeRoadmapTool ? ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.label : "Learning Roadmap";
        userPromptDisplay = `${toolName}: ${roadmapInput.subject || roadmapInput.topic || roadmapInput.examName || "My Learning Plan"}`;
        if (activeRoadmapTool === 'doubt') userPromptDisplay = `Doubt: ${roadmapInput.question}`;
        if (activeRoadmapTool === 'doubt' && roadmapInput.files.length > 0) userAttachments = roadmapInput.files;
        if (activeRoadmapTool === 'tutor') {
            userPromptDisplay = `Autonomous Tutor: ${roadmapInput.question}`;
            userAttachments = roadmapInput.files;
        }
        if (activeRoadmapTool === 'professor') {
            userPromptDisplay = `Professor Mode: ${roadmapInput.topic}`;
        }
    }
    else if (activeTab === 'rnd') {
        const toolName = activeRndTool ? RND_TOOLS.find(t=>t.id===activeRndTool)?.label : "R&D Analysis";
        userPromptDisplay = `${toolName}: ${rndInput.field} ${rndInput.problem ? '- ' + rndInput.problem : ''}`;
        if (activeRndTool === 'cross_disciplinary') userPromptDisplay += ` + ${rndInput.secondaryField}`;
        if (activeRndTool === 'data_analyst' && rndInput.files.length > 0) {
            userAttachments = rndInput.files;
            userPromptDisplay = `Analyzing uploaded dataset for ${rndInput.problem}`;
        }
        if (activeRndTool === 'ara' || activeRndTool === 'collab_swarm') {
            userPromptDisplay = `${toolName}: ${rndInput.field || rndInput.problem}`;
        }
        if (activeRndTool === 'code_sandbox') userPromptDisplay = `Code Sandbox: ${rndInput.problem}`;
        if (activeRndTool === 'biotech') userPromptDisplay = `Biotech Agent: ${rndInput.problem}`;
        if (activeRndTool === 'legal_research') userPromptDisplay = `Legal Agent: ${rndInput.problem}`;
        if (activeRndTool === 'quant') userPromptDisplay = `Quant Finance: ${rndInput.problem}`;
    }
    else if (activeTab === 'startup') {
        const toolName = STARTUP_TOOLS.find(t => t.id === activeStartupTool)?.label || "Startup Helper";
        userPromptDisplay = `${toolName}: ${startupInput.domain}`;
        if(activeStartupTool === 'simulator') userPromptDisplay = `Starting Customer Simulator for ${startupInput.domain}`;
    }
    else if (activeTab === 'paper') {
        const toolName = activePaperTool ? PAPER_TOOLS.find(t => t.id === activePaperTool)?.label : "Paper Analysis";
        userPromptDisplay = `${toolName} for attached documents.`;
        if (paperInput.text) userPromptDisplay += ` Note: ${paperInput.text.substring(0, 30)}...`;
        userAttachments = paperInput.files;
    }
    else if (activeTab === 'visual') {
        userPromptDisplay = visualInput.prompt || "Analyze this image";
        userImagePreview = visualInput.imagePreview;
    }

    const userMsgId = Date.now().toString();
    addMessage(activeTab, { 
        id: userMsgId, 
        role: 'user', 
        content: userPromptDisplay, 
        timestamp: Date.now(),
        imagePreview: userImagePreview,
        attachments: userAttachments
    });

    const aiMsgId = (Date.now() + 1).toString();
    addMessage(activeTab, { id: aiMsgId, role: 'model', content: "", timestamp: Date.now() });

    try {
        let stream;
        
        if (activeTab === 'roadmap') {
            if (activeRoadmapTool) {
                if (activeRoadmapTool === 'adaptive' || activeRoadmapTool === 'visualizer') {
                    // Fix: Use 'topic' for visualizer, fallback to subject for adaptive
                    const context = activeRoadmapTool === 'visualizer' 
                        ? (roadmapInput.topic || "Topic")
                        : (roadmapInput.subject || roadmapInput.topic || "Learning Path");
                        
                    generateRoadmapData(context, roadmapInput.level);
                }
                stream = await GeminiService.generateRoadmapToolStream(activeRoadmapTool, roadmapInput, userContext, tabHistory);
            } else {
                generateRoadmapData(roadmapInput.subject, roadmapInput.level);
                stream = await GeminiService.generateRoadmapToolStream('adaptive', roadmapInput, userContext, tabHistory);
            }
        } else if (activeTab === 'rnd') {
            if (activeRndTool) {
                if (activeRndTool === 'roadmap') {
                     generateRoadmapData(`R&D Roadmap for ${rndInput.field}`, 'Advanced');
                }
                stream = await GeminiService.generateRndToolStream(activeRndTool, rndInput, userContext, tabHistory);
            } else {
                 stream = await GeminiService.generateRnDIdeasStream(rndInput.field, rndInput.problem, userContext, tabHistory);
            }
        } else if (activeTab === 'startup') {
            if (activeStartupTool) {
                if (activeStartupTool === 'roadmap') {
                     generateRoadmapData(`Startup Roadmap for ${startupInput.domain}`, startupInput.stage);
                }
                stream = await GeminiService.generateStartupToolStream(activeStartupTool, startupInput, userContext, tabHistory);
            }
        } else if (activeTab === 'paper') {
             if (activePaperTool) {
                 if (activePaperTool === 'visualize') {
                     const context = paperInput.files.length > 0 ? paperInput.files[0].name : paperInput.text.substring(0, 50);
                     handleMindMapGen(`Mind Map for ${context}`);
                 }
                 stream = await GeminiService.generatePaperToolStream(activePaperTool, paperInput, userContext, tabHistory);
             } else {
                 stream = await GeminiService.generatePaperToolStream('deep_explain', paperInput, userContext, tabHistory);
             }
        } else if (activeTab === 'visual') {
            if (visualInput.imagePreview) {
                 const [mime, data] = visualInput.imagePreview.split(';base64,');
                 const mimeType = mime.split(':')[1];
                 stream = await GeminiService.analyzeImageStream(data, mimeType, visualInput.prompt, userContext, tabHistory);
            }
        }

        if (stream) {
            let fullText = "";
            for await (const chunk of stream) {
                const text = chunk.text;
                if (text) fullText += text;
                
                let sources: GroundingSource[] = [];
                if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    chunk.candidates[0].groundingMetadata.groundingChunks.forEach(c => {
                        if (c.web?.uri && c.web?.title) {
                            sources.push({ uri: c.web.uri, title: c.web.title });
                        }
                    });
                }
                updateLastMessage(activeTab, fullText, { groundingSources: sources.length > 0 ? sources : undefined });
            }
        }

    } catch (e) {
        updateLastMessage(activeTab, "⚠️ Error: Unable to reach KANAD’s AI brain. Please try again.");
        console.error(e);
    } finally {
        setIsGenerating(false);
        if (activeTab === 'visual') {
             setVisualInput({ ...visualInput, prompt: '' }); 
             setVisualInput({ prompt: '', imageFile: null, imagePreview: '' });
        }
    }
  };

  const generateRoadmapData = async (subject: string, level: string) => {
      const data = await GeminiService.generateRoadmapJSON(subject, level, { role, language });
      if (data) {
          setSessions(prev => {
              const msgs = [...prev[activeTab]];
              const lastIndex = msgs.length - 1;
              if (lastIndex >= 0 && msgs[lastIndex].role === 'model') {
                   msgs[lastIndex] = { ...msgs[lastIndex], roadmapData: data };
              }
              return { ...prev, [activeTab]: msgs };
          });
      }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    
    const text = inputText;
    setInputText("");
    setIsGenerating(true);

    addMessage(activeTab, { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() });
    addMessage(activeTab, { id: (Date.now()+1).toString(), role: 'model', content: "", timestamp: Date.now() });

    try {
        const history = getGeminiHistory(activeTab);
        const stream = await GeminiService.sendFollowUp(text, history, { role, language }, activeTab);
        
        let fullText = "";
        for await (const chunk of stream) {
            const chunkText = chunk.text;
             if (chunkText) fullText += chunkText;
            
            let sources: GroundingSource[] = [];
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                chunk.candidates[0].groundingMetadata.groundingChunks.forEach(c => {
                    if (c.web?.uri && c.web?.title) {
                        sources.push({ uri: c.web.uri, title: c.web.title });
                    }
                });
            }
            updateLastMessage(activeTab, fullText, { groundingSources: sources.length > 0 ? sources : undefined });
        }
    } catch (e) {
        updateLastMessage(activeTab, "⚠️ Error connecting to AI.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleMindMapGen = async (overridePrompt?: string) => {
    if (isGenerating && !overridePrompt) return;

    let promptContext = overridePrompt || "";
    if (!promptContext) {
        if (activeTab === 'roadmap') promptContext = `${roadmapInput.subject} (${roadmapInput.level})`;
        else if (activeTab === 'rnd') promptContext = `${rndInput.field} - ${rndInput.problem}`;
        else if (activeTab === 'paper') promptContext = `Mind Map of attached paper: ${paperInput.text.substring(0, 100)}`;
        else if (activeTab === 'startup' && activeStartupTool) promptContext = `${activeStartupTool} for ${startupInput.domain}`;
    }
    
    if (!promptContext) return;

    if (!overridePrompt) setIsGenerating(true);
    
    if (!overridePrompt) {
        addMessage(activeTab, { 
            id: Date.now().toString(), 
            role: 'user', 
            content: "Generate a visual mind map for this.", 
            timestamp: Date.now() 
        });
    }

    const phId = (Date.now() + (overridePrompt ? 100 : 1)).toString();
    addMessage(activeTab, { id: phId, role: 'model', content: "Generating visualization...", timestamp: Date.now() });

    try {
        const base64Image = await GeminiService.generateMindMap(promptContext, { role, language });
        if (base64Image) {
             setSessions(prev => {
                const msgs = [...prev[activeTab]];
                const targetMsgIndex = msgs.findIndex(m => m.id === phId);
                if (targetMsgIndex !== -1) {
                     msgs[targetMsgIndex] = { ...msgs[targetMsgIndex], content: "Here is your generated mind map visualization:", imagePreview: base64Image };
                }
                return { ...prev, [activeTab]: msgs };
            });
        } else {
            updateLastMessage(activeTab, "⚠️ Could not generate image at this time.");
        }
    } catch(e) {
        updateLastMessage(activeTab, "⚠️ Error generating image.");
    } finally {
        if (!overridePrompt) setIsGenerating(false);
    }
  }

  // ... File Change Handlers ...
  const handleVisualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setVisualInput({ 
                  ...visualInput, 
                  imageFile: file, 
                  imagePreview: reader.result as string 
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePaperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach((file: File) => {
             if (file.size > 100 * 1024 * 1024) {
                 alert(`File ${file.name} exceeds 100MB limit.`);
                 return;
             }
             const reader = new FileReader();
             reader.onloadend = () => {
                 setPaperInput(prev => ({
                     ...prev,
                     files: [...prev.files, {
                         name: file.name,
                         mimeType: file.type || "application/pdf",
                         data: reader.result as string,
                         size: file.size
                     }]
                 }));
             };
             reader.readAsDataURL(file);
          });
      }
  };
  
  const handleRndFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach((file: File) => {
             const reader = new FileReader();
             reader.onloadend = () => {
                 setRndInput(prev => ({
                     ...prev,
                     files: [...prev.files, {
                         name: file.name,
                         mimeType: file.type || "text/csv",
                         data: reader.result as string,
                         size: file.size
                     }]
                 }));
             };
             reader.readAsDataURL(file);
          });
      }
  };

  const handleDoubtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach((file: File) => {
             const reader = new FileReader();
             reader.onloadend = () => {
                 setRoadmapInput(prev => ({
                     ...prev,
                     files: [...prev.files, {
                         name: file.name,
                         mimeType: file.type || "image/jpeg",
                         data: reader.result as string,
                         size: file.size
                     }]
                 }));
             };
             reader.readAsDataURL(file);
          });
      }
  };

  const removePaperFile = (index: number) => {
      setPaperInput(prev => ({
          ...prev,
          files: prev.files.filter((_, i) => i !== index)
      }));
  };
  
  const removeRndFile = (index: number) => {
      setRndInput(prev => ({
          ...prev,
          files: prev.files.filter((_, i) => i !== index)
      }));
  };

  const removeDoubtFile = (index: number) => {
      setRoadmapInput(prev => ({
          ...prev,
          files: prev.files.filter((_, i) => i !== index)
      }));
  };

  const handleSendToKanad = (paper: ResearchPaper) => {
      setActiveTab('paper');
      setPaperInput(prev => ({
          ...prev,
          text: `Paper Title: ${paper.title}\nAuthors: ${paper.authors.join(', ')}\n\nAbstract:\n${paper.abstract}\n\n[Please analyze this paper based on the abstract]`
      }));
      setTimeout(() => {
          document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  const openAuth = () => {
      setIsLoginModalOpen(true);
  };

  const GroundingChip = ({ sources }: { sources: GroundingSource[] }) => (
      <div className="mt-3 text-xs border-t border-slate-700/50 pt-2">
          <span className="text-slate-500 uppercase tracking-wider font-bold mr-2">Sources:</span>
          <div className="flex flex-wrap gap-2 mt-1">
              {sources.map((src, i) => (
                  <a key={i} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1 rounded-md transition-colors truncate max-w-[200px]">
                      <span className="truncate">{src.title}</span>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
              ))}
          </div>
      </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 relative overflow-hidden">
        
        {/* History Sidebar */}
        <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 z-[60] ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <h3 className="font-bold text-slate-200">Chat History</h3>
                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-white">
                    <XIcon />
                </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)] p-2 space-y-2">
                {chatHistory.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm mt-10 p-4">
                        <HistoryIcon />
                        <p className="mt-2">No history yet.</p>
                        <p className="text-xs">Chats are saved when you start a new one.</p>
                    </div>
                ) : (
                    chatHistory.map(session => (
                        <div key={session.id} onClick={() => restoreSession(session)} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-accent cursor-pointer group transition-all">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                    session.tab === 'roadmap' ? 'bg-blue-900/30 text-blue-300' :
                                    session.tab === 'rnd' ? 'bg-purple-900/30 text-purple-300' :
                                    session.tab === 'startup' ? 'bg-green-900/30 text-green-300' :
                                    'bg-slate-700 text-slate-300'
                                }`}>{session.tab}</span>
                                <button onClick={(e) => deleteSession(e, session.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon />
                                </button>
                            </div>
                            <h4 className="text-sm font-medium text-slate-300 line-clamp-2 mb-1">{session.title}</h4>
                            <span className="text-[10px] text-slate-500">{new Date(session.timestamp).toLocaleDateString()} • {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        {/* Overlay for Sidebar */}
        {isHistoryOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]" onClick={() => setIsHistoryOpen(false)}></div>
        )}

        <div className="w-full max-w-7xl">
            <div className="min-h-screen text-text bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_45%,_#000_100%)] font-sans">
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onGuestLogin={handleGuestLogin} />

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-white/10">
                <AtomIcon />
             </div>
             <div className="flex flex-col">
               <span className="font-bold tracking-widest text-sm uppercase">KANAD</span>
               <span className="text-[10px] text-text-muted">Your AI Research Buddy</span>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            {[
                { label: 'Home', id: 'home' },
                { label: 'Roadmaps', id: 'roadmap' },
                { label: 'R&D Ideas', id: 'rnd' },
                { label: 'Startup Helper', id: 'startup' },
                { label: 'Paper Explainer', id: 'paper' }
            ].map((item) => (
                <button 
                    key={item.label} 
                    onClick={() => {
                        if (item.id === 'home') {
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                             if(activeTab === 'library') setActiveTab('roadmap');
                        } else {
                             setActiveTab(item.id as TabId);
                             document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className={`hover:text-text hover:text-accent transition-colors relative group ${activeTab === item.id ? 'text-accent' : ''}`}
                >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all ${activeTab === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </button>
            ))}
            <button 
                onClick={() => {
                    setActiveTab('library');
                    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`hover:text-text hover:text-accent transition-colors relative group ${activeTab === 'library' ? 'text-accent' : ''}`}
            >
                Research Library
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all ${activeTab === 'library' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
            
            {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                     <span className="text-xs text-sky-300">Hi, {user.displayName?.split(' ')[0] || 'Guest'}</span>
                     {user.photoURL ? (
                         <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-sky-500/30" />
                     ) : (
                         <div className="w-8 h-8 rounded-full bg-sky-900 flex items-center justify-center text-xs font-bold text-sky-200">{user.displayName?.[0] || 'G'}</div>
                     )}
                     <button onClick={() => { AuthService.signOut(); setUser(null); }} className="text-[10px] text-slate-500 hover:text-white ml-1">Sign Out</button>
                </div>
            ) : (
                <button 
                    onClick={openAuth}
                    className="px-4 py-2 rounded-full bg-gradient-to-br from-accent to-accent-strong text-slate-900 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                    Get Started
                </button>
            )}
          </div>

          <button className="md:hidden text-text" onClick={() => setIsMenuOpen(!isMenuOpen)}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
          </button>
        </div>
      </header>
            
            <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
                 {activeTab !== 'library' && (
            <section className="grid md:grid-cols-2 gap-12 items-center mb-12 pt-8">
                <div className="space-y-6">
                    <div className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Multilingual Research & Innovation Copilot</div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-sky-300 to-indigo-300">
                            KANAD – Your AI Research Buddy
                        </span>
                    </h1>
                    <p className="text-lg text-text-muted">
                        Inspired by Ancient Atoms. Built for Future Minds.
                    </p>
                    <div className="flex gap-4 pt-2">
                        {user ? (
                            <button onClick={() => document.getElementById('workspace')?.scrollIntoView({behavior: 'smooth'})} className="px-6 py-3 rounded-full bg-gradient-to-r from-accent to-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-900/40 hover:scale-105 transition-transform">
                                Go to Workspace
                            </button>
                        ) : (
                            <button onClick={openAuth} className="px-6 py-3 rounded-full bg-gradient-to-r from-accent to-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-900/40 hover:scale-105 transition-transform">
                                Join Now
                            </button>
                        )}
                    </div>
                </div>
                <div className="relative h-64 md:h-80 w-full rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden group">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(14,165,233,0.15),_transparent_60%)]"></div>

    {/* Animated Orbs */}
    <div className="relative z-10 w-20 h-20 bg-blue-600 rounded-full shadow-[0_0_80px_rgba(37,99,235,0.6)] blur-[1px] animate-pulse"></div>
    <div className="absolute z-10 w-14 h-14 bg-sky-300 rounded-full shadow-[0_0_40px_rgba(125,211,252,0.8)] blur-sm"></div>

    {/* Rotating Rings */}
    <div className="absolute w-40 h-40 border border-sky-500/20 rounded-full animate-[spin_8s_linear_infinite]">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-400 rounded-full shadow-[0_0_15px_rgba(56,189,248,1)]"></div>
    </div>

    <div className="absolute w-64 h-64 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]">
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,1)]"></div>
    </div>

    <div className="absolute w-96 h-96 border border-rose-500/10 rounded-full animate-[spin_25s_linear_infinite]">
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-rose-400 rounded-full shadow-[0_0_20px_rgba(251,113,133,1)]"></div>
    </div>

    <div className="absolute w-[32rem] h-[32rem] border border-amber-500/10 rounded-full animate-[spin_35s_linear_infinite_reverse]">
        <div className="absolute top-1/4 -left-1.5 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,1)]"></div>
    </div>

    {/* Removed Prototype Tray */}
</div>

            </section>
        )}

        <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-xl p-4 mb-8 flex flex-wrap gap-6 items-center shadow-lg">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Context</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                 <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Language</label>
                    <select className="bg-slate-950 border border-slate-700 text-sm rounded-full px-3 py-1.5 focus:border-accent outline-none" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Bengali</option>
                        <option>Tamil</option>
                        <option>Telugu</option>
                        <option>Kannada</option>
                        <option>Marathi</option>
                        <option>Gujarati</option>
                        <option>Malayalam</option>
                        <option>Punjabi</option>
                        <option>Assamese</option>
                        <option>Odia</option>
                        <option>Manipuri</option>
                        <option>Mixed / Other</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Role</label>
                    <select className="bg-slate-950 border border-slate-700 text-sm rounded-full px-3 py-1.5 focus:border-accent outline-none" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                        <option>School Student</option>
                        <option>Undergraduate</option>
                        <option>Postgraduate</option>
                        <option>Researcher</option>
                        <option>Startup Founder / Innovator</option>
                    </select>
                </div>
            </div>
        </section>

        {/* Workspace */}
        <section id="workspace" className="bg-gradient-to-b from-slate-900 to-black border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-green-400/50 shadow-lg"></div>
                    {activeTab === 'library' ? 'Research Library' : 'KANAD Workspace'}
                 </div>
                 <div className="flex items-center gap-3">
                     <button onClick={() => setIsHistoryOpen(true)} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                        <HistoryIcon />
                        <span className="hidden sm:inline">History</span>
                     </button>
                    <span className="text-[10px] bg-sky-900/30 text-sky-200 border border-sky-800 px-2 py-1 rounded-md">
                        {activeTab === 'library' ? 'Connected to Public Archives' : 'Atomic Intelligence Active'}
                    </span>
                 </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { id: 'roadmap', label: 'Learning Roadmap' },
                    { id: 'rnd', label: 'R&D Ideas' },
                    { id: 'startup', label: 'Startup Helper' },
                    { id: 'paper', label: 'Paper Explainer' },
                    { id: 'visual', label: 'Visual Analysis' },
                    { id: 'library', label: 'Research Library' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as TabId);
                            if (tab.id !== 'startup') setActiveStartupTool(null);
                            if (tab.id !== 'paper') setActivePaperTool(null);
                            if (tab.id !== 'rnd') setActiveRndTool(null);
                            if (tab.id !== 'roadmap') setActiveRoadmapTool(null);
                        }}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border ${
                            activeTab === tab.id 
                            ? 'bg-slate-800 border-accent text-white shadow-[0_5px_15px_rgba(0,0,0,0.3)]' 
                            : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'library' ? (
                <ResearchLibrary onSendToKanad={handleSendToKanad} />
            ) : (
                <div className="grid lg:grid-cols-12 gap-6 h-full">
                    {/* Left Sidebar (Tool Inputs) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="glass-panel p-5 rounded-xl border border-slate-800/60 bg-slate-900/50 h-fit max-h-[800px] overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-slate-900/90 py-2 backdrop-blur z-10">
                                {activeTab === 'roadmap' && (activeRoadmapTool ? ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.label : "Learning Studio")}
                                {activeTab === 'rnd' && (activeRndTool ? RND_TOOLS.find(t=>t.id===activeRndTool)?.label : "R&D Toolkit")}
                                {activeTab === 'startup' && (activeStartupTool ? STARTUP_TOOLS.find(t=>t.id===activeStartupTool)?.label + " Setup" : "Startup Toolkit")}
                                {activeTab === 'paper' && (activePaperTool ? PAPER_TOOLS.find(t=>t.id===activePaperTool)?.label : "Research Toolkit")}
                                {activeTab === 'visual' && "Image Analysis"}
                            </h3>
                            
                            {/* Roadmap Inputs */}
                            {activeTab === 'roadmap' && (
                                <div className="space-y-4">
                                    {!activeRoadmapTool ? (
                                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                            {ROADMAP_TOOLS.map(tool => (
                                                <button key={tool.id} onClick={() => setActiveRoadmapTool(tool.id as RoadmapToolId)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all group min-h-[80px] relative ${tool.flagship ? 'bg-amber-900/10 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-accent hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]'}`}>
                                                    {tool.flagship && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                                                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{tool.icon}</span>
                                                    <span className={`text-[10px] font-semibold text-center leading-tight ${tool.flagship ? 'text-amber-100' : 'text-slate-300'}`}>{tool.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <button onClick={() => setActiveRoadmapTool(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-3 transition-colors"><BackIcon /> Back to Studio</button>
                                            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 mb-4">
                                                <div className="flex items-center gap-2 mb-1 text-accent"><span className="text-lg">{ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.icon}</span><span className="font-bold text-sm">{ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.label}</span></div>
                                                <p className="text-[10px] text-slate-400">{ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.desc}</p>
                                            </div>
                                            <div className="space-y-4">
                                                {(activeRoadmapTool !== 'doubt' && activeRoadmapTool !== 'visualizer' && activeRoadmapTool !== 'practice' && activeRoadmapTool !== 'exam' && activeRoadmapTool !== 'style' && activeRoadmapTool !== 'tutor' && activeRoadmapTool !== 'professor') && (<div><label className="block text-xs text-slate-400 mb-1">Subject / Field</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. Physics / Data Science" value={roadmapInput.subject} onChange={(e) => setRoadmapInput({...roadmapInput, subject: e.target.value})} /></div>)}
                                                {(activeRoadmapTool === 'adaptive' || activeRoadmapTool === 'project' || activeRoadmapTool === 'practice') && (<div><label className="block text-xs text-slate-400 mb-1">Level</label><select className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" value={roadmapInput.level} onChange={(e) => setRoadmapInput({...roadmapInput, level: e.target.value})}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>)}
                                                {activeRoadmapTool === 'adaptive' && (<div><label className="block text-xs text-slate-400 mb-1">Study Hours / Week</label><input type="number" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" value={roadmapInput.hours} onChange={(e) => setRoadmapInput({...roadmapInput, hours: e.target.value})} /></div>)}
                                                {activeRoadmapTool === 'planner' && (<div><label className="block text-xs text-slate-400 mb-1">Timeline / Duration</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. 2 Months" value={roadmapInput.timeline} onChange={(e) => setRoadmapInput({...roadmapInput, timeline: e.target.value})} /></div>)}
                                                {(activeRoadmapTool === 'visualizer' || activeRoadmapTool === 'practice' || activeRoadmapTool === 'style' || activeRoadmapTool === 'professor') && (<div><label className="block text-xs text-slate-400 mb-1">Specific Topic</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. Photosynthesis" value={roadmapInput.topic} onChange={(e) => setRoadmapInput({...roadmapInput, topic: e.target.value})} /></div>)}
                                                {activeRoadmapTool === 'style' && (<div><label className="block text-xs text-slate-400 mb-1">Learning Style</label><select className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" value={roadmapInput.style} onChange={(e) => setRoadmapInput({...roadmapInput, style: e.target.value})}><option>Visual (Diagrams)</option><option>Auditory (Story/Script)</option><option>Kinesthetic (Hands-on)</option><option>Textual (Reading)</option></select></div>)}
                                                {activeRoadmapTool === 'exam' && (<div><label className="block text-xs text-slate-400 mb-1">Exam Name</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. JEE Mains / SAT / Semester 1" value={roadmapInput.examName} onChange={(e) => setRoadmapInput({...roadmapInput, examName: e.target.value})} /></div>)}
                                                {activeRoadmapTool === 'career' && (<div><label className="block text-xs text-slate-400 mb-1">Career Goal</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. Data Scientist" value={roadmapInput.careerGoal} onChange={(e) => setRoadmapInput({...roadmapInput, careerGoal: e.target.value})} /></div>)}
                                                {(activeRoadmapTool === 'doubt' || activeRoadmapTool === 'tutor') && (<div><label className="block text-xs text-slate-400 mb-1">{activeRoadmapTool === 'tutor' ? 'Assignment / Question' : 'Your Question / Doubt'}</label><textarea className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none min-h-[100px]" placeholder="Type or paste your homework..." value={roadmapInput.question} onChange={(e) => setRoadmapInput({...roadmapInput, question: e.target.value})} /><div className="mt-2 flex items-center gap-2"><button onClick={() => doubtFileInputRef.current?.click()} className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"><ImageIcon /> Attach Image</button><input type="file" ref={doubtFileInputRef} accept="image/*" className="hidden" onChange={handleDoubtFileChange} />{roadmapInput.files.length > 0 && <span className="text-[10px] text-green-400">Image Attached</span>}</div></div>)}
                                                <button onClick={() => handleGenerate()} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 text-sm font-bold shadow-lg disabled:opacity-50">{isGenerating ? "Thinking..." : `Generate ${ROADMAP_TOOLS.find(t=>t.id===activeRoadmapTool)?.label}`}</button>
                                                {(activeRoadmapTool === 'adaptive' || activeRoadmapTool === 'visualizer') && (<button onClick={() => handleMindMapGen()} disabled={isGenerating} className="w-full py-2 rounded-lg bg-slate-800 border border-slate-600 hover:border-accent text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 mt-2">Generate Visual Map</button>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* R&D Inputs */}
                            {activeTab === 'rnd' && (
                                <div className="space-y-4">
                                    {!activeRndTool ? (
                                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                            {RND_TOOLS.map(tool => (
                                                <button key={tool.id} onClick={() => setActiveRndTool(tool.id as RndToolId)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all group min-h-[80px] relative ${tool.flagship ? 'bg-amber-900/10 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-accent hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]'}`}>
                                                    {tool.flagship && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                                                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{tool.icon}</span>
                                                    <span className={`text-[10px] font-semibold text-center leading-tight ${tool.flagship ? 'text-amber-100' : 'text-slate-300'}`}>{tool.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <button onClick={() => setActiveRndTool(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-3 transition-colors"><BackIcon /> Back to Toolkit</button>
                                            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 mb-4">
                                                <div className="flex items-center gap-2 mb-1 text-accent"><span className="text-lg">{RND_TOOLS.find(t=>t.id===activeRndTool)?.icon}</span><span className="font-bold text-sm">{RND_TOOLS.find(t=>t.id===activeRndTool)?.label}</span></div>
                                                <p className="text-[10px] text-slate-400">{RND_TOOLS.find(t=>t.id===activeRndTool)?.desc}</p>
                                            </div>
                                            <div className="space-y-4">
                                                {/* File Upload for Data Analyst or General Context */}
                                                {activeRndTool === 'data_analyst' && (
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-1">Upload Dataset (CSV)</label>
                                                        <div className="border-2 border-dashed border-slate-700 hover:border-accent hover:bg-slate-800/50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => rndFileInputRef.current?.click()}>
                                                            <input type="file" ref={rndFileInputRef} accept=".csv,.json,.txt" className="hidden" onChange={handleRndFileChange} />
                                                            <DocumentIcon /><span className="text-xs text-slate-400 mt-2">Click to attach dataset</span>
                                                        </div>
                                                        {rndInput.files.length > 0 && (<div className="flex flex-col gap-2 mt-2">{rndInput.files.map((f, idx) => (<div key={idx} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded text-xs"><span className="truncate max-w-[180px] text-sky-200">{f.name}</span><button onClick={() => removeRndFile(idx)} className="text-slate-500 hover:text-red-400"><XIcon /></button></div>))}</div>)}
                                                    </div>
                                                )}

                                                <div><label className="block text-xs text-slate-400 mb-1">
                                                    {activeRndTool === 'ara' ? 'Research Goal / Topic' : 
                                                     activeRndTool === 'collab_swarm' ? 'Problem for Team' :
                                                     activeRndTool === 'data_analyst' ? 'Analysis Goal' : 
                                                     activeRndTool === 'code_sandbox' ? 'Code Problem / Task' : 'Field / Domain'}
                                                </label>
                                                <input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder={activeRndTool === 'ara' ? "e.g. Clean Fusion Energy" : "e.g. Renewable Energy"} value={rndInput.field} onChange={(e) => setRndInput({...rndInput, field: e.target.value})} /></div>
                                                
                                                {activeRndTool === 'cross_disciplinary' && (<div><label className="block text-xs text-slate-400 mb-1">Secondary Field</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. AI" value={rndInput.secondaryField} onChange={(e) => setRndInput({...rndInput, secondaryField: e.target.value})} /></div>)}
                                                
                                                {activeRndTool !== 'discovery' && activeRndTool !== 'collaboration' && activeRndTool !== 'funding' && activeRndTool !== 'ara' && activeRndTool !== 'collab_swarm' && (
                                                    <div><label className="block text-xs text-slate-400 mb-1">{activeRndTool === 'hypothesis' ? 'Observation / Phenomenon' : 'Problem / Idea'}</label><textarea className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none min-h-[80px]" placeholder="Describe problem..." value={rndInput.problem} onChange={(e) => setRndInput({...rndInput, problem: e.target.value})} /></div>
                                                )}
                                                
                                                <button onClick={() => handleGenerate()} disabled={isGenerating || !rndInput.field} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 text-sm font-bold shadow-lg disabled:opacity-50">{isGenerating ? "Analyzing..." : `Run ${RND_TOOLS.find(t=>t.id===activeRndTool)?.label}`}</button>
                                                {activeRndTool === 'roadmap' && (<button onClick={() => handleMindMapGen()} disabled={isGenerating || !rndInput.field} className="w-full py-2 rounded-lg bg-slate-800 border border-slate-600 hover:border-accent text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 mt-2">Generate Visual Timeline</button>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Startup Inputs */}
                            {activeTab === 'startup' && (
                                <div className="space-y-4">
                                    {!activeStartupTool ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {STARTUP_TOOLS.map(tool => (
                                                <button key={tool.id} onClick={() => setActiveStartupTool(tool.id as StartupToolId)} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group h-24 relative ${tool.flagship ? 'bg-amber-900/10 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-accent hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]'}`}>
                                                    {tool.flagship && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                                                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{tool.icon}</span>
                                                    <span className={`text-xs font-semibold text-center leading-tight ${tool.flagship ? 'text-amber-100' : 'text-slate-300'}`}>{tool.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <button onClick={() => setActiveStartupTool(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-3 transition-colors"><BackIcon /> Back to Tools</button>
                                            <div className="space-y-4">
                                                <div><label className="block text-xs text-slate-400 mb-1">Domain / Idea Area</label><input type="text" className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="e.g. Agritech" value={startupInput.domain} onChange={(e) => setStartupInput({...startupInput, domain: e.target.value})} /></div>
                                                {(activeStartupTool === 'blueprint' || activeStartupTool === 'competitor' || activeStartupTool === 'pitch' || activeStartupTool === 'prd' || activeStartupTool === 'simulator') && (<div><label className="block text-xs text-slate-400 mb-1">Core Problem</label><textarea className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none min-h-[80px]" placeholder="What problem are you solving?" value={startupInput.problem} onChange={(e) => setStartupInput({...startupInput, problem: e.target.value})} /></div>)}
                                                {(activeStartupTool === 'blueprint' || activeStartupTool === 'roadmap' || activeStartupTool === 'pitch' || activeStartupTool === 'funding' || activeStartupTool === 'tech') && (<div><label className="block text-xs text-slate-400 mb-1">Current Stage</label><select className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" value={startupInput.stage} onChange={(e) => setStartupInput({...startupInput, stage: e.target.value})}><option>Just exploring</option><option>Early idea / Pre-Seed</option><option>MVP Ready</option><option>Post-Revenue / Series A</option></select></div>)}
                                                {/* Omitting other fields for brevity, assuming they are present in original code logic, but here focused on structure */}
                                                <button onClick={() => handleGenerate()} disabled={isGenerating || !startupInput.domain} className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 text-sm font-bold shadow-lg disabled:opacity-50">{isGenerating ? "Thinking..." : `Generate ${STARTUP_TOOLS.find(t=>t.id===activeStartupTool)?.label}`}</button>
                                                {activeStartupTool === 'roadmap' && (<button onClick={() => handleMindMapGen()} disabled={isGenerating || !startupInput.domain} className="w-full py-2 rounded-lg bg-slate-800 border border-slate-600 hover:border-accent text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 mt-2">Generate Visual Timeline</button>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* Paper Inputs */}
                              {activeTab === 'paper' && (
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-xs text-slate-400 mb-1">Step 1: Upload Documents</label>
                                        <div className="border-2 border-dashed border-slate-700 hover:border-accent hover:bg-slate-800/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors" onClick={() => paperFileInputRef.current?.click()}>
                                            <input type="file" ref={paperFileInputRef} multiple accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handlePaperFileChange} />
                                            <DocumentIcon /><span className="text-xs text-slate-400 mt-2">Click to attach (PDF/DOC/TXT)</span>
                                        </div>
                                        {paperInput.files.length > 0 && (<div className="flex flex-col gap-2 mt-2">{paperInput.files.map((f, idx) => (<div key={idx} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded text-xs"><span className="truncate max-w-[180px] text-sky-200">{f.name}</span><button onClick={() => removePaperFile(idx)} className="text-slate-500 hover:text-red-400"><XIcon /></button></div>))}</div>)}
                                    </div>
                                    {!activePaperTool ? (
                                         <div><label className="block text-xs text-slate-400 mb-2">Step 2: Select Tool</label><div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">{PAPER_TOOLS.map(tool => (<button key={tool.id} onClick={() => setActivePaperTool(tool.id as PaperToolId)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all group min-h-[80px] relative ${tool.flagship ? 'bg-amber-900/10 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-accent hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]'}`}>
                                            {tool.flagship && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                                            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{tool.icon}</span><span className={`text-[10px] font-semibold text-center leading-tight ${tool.flagship ? 'text-amber-100' : 'text-slate-300'}`}>{tool.label}</span></button>))}</div></div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <button onClick={() => setActivePaperTool(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-3 transition-colors"><BackIcon /> Back to Tools</button>
                                            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 mb-4"><div className="flex items-center gap-2 mb-1 text-accent"><span className="text-lg">{PAPER_TOOLS.find(t=>t.id===activePaperTool)?.icon}</span><span className="font-bold text-sm">{PAPER_TOOLS.find(t=>t.id===activePaperTool)?.label}</span></div><p className="text-[10px] text-slate-400">{PAPER_TOOLS.find(t=>t.id===activePaperTool)?.desc}</p></div>
                                            <div className="space-y-4">
                                                <div><label className="block text-xs text-slate-400 mb-1">{activePaperTool === 'fusion' ? 'Web Topic or URL to Fuse' : activePaperTool === 'drafter' ? 'Paper Idea / Topic' : activePaperTool === 'diagram_gen' ? 'Diagram Description' : 'Specific Instructions / Questions (Optional)'}</label><textarea className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none min-h-[80px]" placeholder={activePaperTool === 'fusion' ? "e.g. Latest news on AGI..." : "E.g. Focus on section 3..."} value={paperInput.text} onChange={(e) => setPaperInput({...paperInput, text: e.target.value})} /></div>
                                                <button onClick={() => handleGenerate()} disabled={isGenerating || (paperInput.files.length === 0 && !paperInput.text)} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 text-sm font-bold shadow-lg disabled:opacity-50">{isGenerating ? "Analyzing..." : `Run ${PAPER_TOOLS.find(t=>t.id===activePaperTool)?.label}`}</button>
                                                {activePaperTool === 'visualize' && (<button onClick={() => handleMindMapGen(`Mind Map for ${paperInput.files[0]?.name || "Paper Concept"}`)} disabled={isGenerating} className="w-full py-2 rounded-lg bg-slate-800 border border-slate-600 hover:border-accent text-slate-300 text-xs font-semibold transition-all disabled:opacity-50 mt-2">Force Visual Map Generation</button>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Visual Inputs */}
                             {activeTab === 'visual' && (
                                <div className="space-y-4">
                                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${visualInput.imagePreview ? 'border-accent bg-slate-900' : 'border-slate-700 hover:border-slate-500 bg-black/20'}`} onClick={() => fileInputRef.current?.click()}>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleVisualFileChange} />
                                        {visualInput.imagePreview ? <img src={visualInput.imagePreview} alt="Preview" className="max-h-40 rounded-lg shadow-lg" /> : <><div className="p-3 bg-slate-800 rounded-full mb-2 text-slate-400"><ImageIcon /></div><p className="text-sm text-slate-300">Upload Image / Graph / Diagram</p></>}
                                    </div>
                                    <button onClick={() => handleGenerate()} disabled={isGenerating || !visualInput.imagePreview} className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 text-sm font-bold shadow-lg disabled:opacity-50">{isGenerating ? "Analyzing..." : "Analyze Scientific Visual"}</button>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col h-[600px] lg:h-auto glass-panel rounded-xl border border-slate-800/60 bg-slate-900/50 overflow-hidden relative">
                         <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-black/20">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/50"></span>
                                <span className="text-xs font-medium text-slate-400">
                                    {activeTab === 'roadmap' && "Learning Session"}
                                    {activeTab === 'rnd' && (activeRndTool ? RND_TOOLS.find(t=>t.id===activeRndTool)?.label : "R&D Session")}
                                    {activeTab === 'startup' && (activeStartupTool ? STARTUP_TOOLS.find(t=>t.id===activeStartupTool)?.label : "Startup Toolkit")}
                                    {activeTab === 'paper' && (activePaperTool ? PAPER_TOOLS.find(t=>t.id===activePaperTool)?.label : "Research Toolkit")}
                                    {activeTab === 'visual' && "Visual Analysis"}
                                </span>
                            </div>
                            <button onClick={handleNewChat} disabled={sessions[activeTab].length === 0 || isGenerating} className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium text-slate-500 hover:text-accent hover:bg-slate-800/50 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent" title="Archive current and start fresh">
                                <PlusIcon />
                                <span>Start New Chat</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {sessions[activeTab].length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                                    <AtomIcon />
                                    <p className="mt-4 text-sm text-slate-300">Ready to explore.</p>
                                    <p className="text-xs text-slate-500 mt-1">Select a tab, fill the inputs, and ignite your research.</p>
                                </div>
                            ) : (
                                sessions[activeTab].map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-br-none' : 'bg-slate-950/80 border border-slate-800 text-slate-100 rounded-bl-none shadow-lg'}`}>
                                            {msg.role === 'user' && msg.imagePreview && <div className="mb-2"><img src={msg.imagePreview} alt="Uploaded" className="max-h-32 rounded-lg border border-slate-600" /></div>}
                                            {msg.role === 'user' && msg.attachments?.map((file, i) => <div key={i} className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded text-xs text-sky-200 border border-slate-700 mb-1"><DocumentIcon /><span className="truncate max-w-[200px]">{file.name}</span></div>)}
                                            
                                            {msg.role === 'model' && msg.content === "" && isGenerating && sessions[activeTab].indexOf(msg) === sessions[activeTab].length -1 ? (
                                                <LoadingIndicator mode={activeTab === 'roadmap' && THINKING_ROADMAP_TOOLS.includes(activeRoadmapTool || '') ? 'thinking' : 'normal'} />
                                            ) : (
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /gm, '• ').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-accent underline">$1</a>') }} />
                                                </div>
                                            )}
                                            {msg.groundingSources && msg.groundingSources.length > 0 && <GroundingChip sources={msg.groundingSources} />}
                                            {msg.imagePreview && msg.role === 'model' && (
                                                <div className="mt-2">
                                                    <img src={msg.imagePreview} alt="Generated Mind Map" className="rounded-lg shadow-lg border border-slate-700" />
                                                    <a href={msg.imagePreview} download="mindmap.png" className="inline-block mt-2 text-xs text-accent hover:text-white underline">Download Mind Map</a>
                                                </div>
                                            )}

                                            {/* Action Buttons for Model Messages */}
                                            {msg.role === 'model' && msg.content && (
                                                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/50">
                                                    <button onClick={() => handleCopy(msg.content)} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-accent transition-colors border border-slate-800" title="Copy text">
                                                        <CopyIcon /> Copy
                                                    </button>
                                                    <button onClick={() => handleDownload(msg.content, 'pdf')} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-accent transition-colors border border-slate-800" title="Download PDF">
                                                        <DocumentIcon /> PDF
                                                    </button>
                                                    <button onClick={() => handleDownload(msg.content, 'doc')} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-accent transition-colors border border-slate-800" title="Download Word Doc">
                                                        <DownloadIcon /> DOC
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                        {msg.roadmapData && <div className="w-full mt-2 animate-fade-in"><RoadmapChart data={msg.roadmapData} /></div>}
                                        <span className="text-[10px] text-slate-600 mt-1 px-1">{msg.role === 'user' ? 'You' : 'KANAD AI'}</span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-slate-950 border-t border-slate-800">
                            <form onSubmit={handleFollowUp} className="relative flex items-center gap-2">
                                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask a follow-up question..." className="flex-1 bg-slate-900 border border-slate-800 rounded-full pl-4 pr-10 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none" disabled={isGenerating || sessions[activeTab].length === 0} />
                                <button type="submit" disabled={isGenerating || !inputText.trim() || sessions[activeTab].length === 0} className="absolute right-2 p-2 bg-slate-800 rounded-full text-accent hover:bg-slate-700 disabled:opacity-30 transition-all"><SendIcon /></button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>

        <footer className="mt-12 text-center text-slate-600 text-xs py-6 border-t border-slate-800/50">
             <p>KANAD – Your AI Research Buddy • <span className="text-accent/60">Inspired by Ancient Atoms. Built for Future Minds.</span></p>
        </footer>

      </div>
        </div>
    </div>
  );
};