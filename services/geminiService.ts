import { GoogleGenAI, Type, Content } from "@google/genai";
import { RoadmapNode, UserContext, Attachment, StartupToolId, PaperToolId, RndToolId, RoadmapToolId } from "../types";

// Always use process.env.API_KEY as the primary source
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to construct system instructions based on context
const getSystemInstruction = (context: UserContext, task: string) => {
  return `You are KANAD – Your AI Research Buddy, a multilingual research assistant inspired by Acharya Kanad’s atomic philosophy.
  
  User Profile:
  - Role: ${context.role}
  - Language: ${context.language}
  
  Your personality is modern, scientific, encouraging, and slightly futuristic. 
  You make complex knowledge accessible.
  
  Current Task Context: ${task}
  
  ALWAYS respond in the requested language: ${context.language}.
  `;
};

// 1. Learning Roadmap & Tools (Updated)
export const generateRoadmapToolStream = async (
  toolId: RoadmapToolId,
  inputs: any,
  context: UserContext,
  history: Content[]
) => {
    let modelId = "gemini-2.5-flash";
    let systemTask = "Assist with personalized learning.";
    let tools: any = undefined;
    let prompt = "";

    switch(toolId) {
        case 'adaptive':
            modelId = "gemini-3-pro-preview"; // Thinking required for personalization
            systemTask = "Create a deeply personalized, adaptive learning roadmap.";
            prompt = `Create an Adaptive Learning Roadmap for "${inputs.subject}".
            Level: ${inputs.level}
            Hours/Week: ${inputs.hours}
            Goal: ${inputs.goal || "Mastery"}
            
            Structure the response as a dynamic path that adapts to strengths/weaknesses.
            Include:
            1. Core Milestones
            2. Prerequisites Check
            3. Detailed Modules (Week by Week)
            4. "Checkpoints" to test understanding before moving on.`;
            break;
            
        case 'tutor': // NEW: Autonomous Coursework Tutor
            modelId = "gemini-3-pro-preview";
            systemTask = "Act as an Autonomous Coursework Tutor.";
            prompt = `Tutor Mode Activated.
            Problem/Context: ${inputs.question}
            
            1. Explain the underlying concepts simply.
            2. Provide a step-by-step method to solve it (do NOT just give the answer, guide the user).
            3. If it's code, provide the logic first, then the syntax.
            4. Generate 2 similar "Practice Problems" to reinforce learning.`;
            break;
            
        case 'professor': // NEW: Explain Like a Professor
            modelId = "gemini-3-pro-preview";
            systemTask = "Act as a Distinguished Professor.";
            prompt = `Professor Mode Activated for topic: "${inputs.topic}".
            
            Explain this topic with:
            1. Deep academic depth and historical context.
            2. "Classroom Style" delivery (engaging, Socratic).
            3. Use advanced metaphors and analogies.
            4. Relate it to cutting-edge research.
            5. End with a "Q&A" section anticipating student questions.`;
            break;

        case 'gap_analyzer':
            systemTask = "Identify knowledge gaps.";
            prompt = `Create a Skill Gap Analysis Quiz for "${inputs.subject}" at ${inputs.level} level.
            Generate 5 diagnostic questions (Conceptual & Application based).
            After the user answers (simulate this or just provide the questions first), explain how you would analyze their gaps.
            For now, just output the Diagnostic Plan & Questions to assess their current standing.`;
            break;

        case 'curator':
            tools = [{ googleSearch: {} }];
            systemTask = "Curate the best learning resources.";
            prompt = `Curate the Best Learning Resources for "${inputs.subject}".
            Use Search to find:
            1. Top Rated Free Courses (YouTube, MOOCs)
            2. Best Textbooks / Documentation
            3. Interactive Tools & Simulators
            4. Practice Platforms
            Provide clickable links where possible.`;
            break;

        case 'planner':
            modelId = "gemini-3-pro-preview";
            systemTask = "Create a detailed study schedule.";
            prompt = `Generate a Study Planner for "${inputs.subject}".
            Timeline: ${inputs.timeline || "1 Month"}
            Daily Commitment: ${inputs.hours} hours
            
            Output a Table:
            - Week/Day
            - Topic
            - Action Item (Watch/Read/Do)
            - Revision Slots`;
            break;

        case 'visualizer':
            modelId = "gemini-3-pro-preview"; // Upgrade to Pro for depth
            systemTask = "Explain complex topics with academic depth, clarity, and comprehensive detail.";
            prompt = `Deep Dive Topic Explainer & Visualizer for "${inputs.topic}".
            
            Provide a comprehensive, multi-layered explanation covering:
            
            ### 1. Core Definition & Context
            - **What is it?**: A rigorous, academic definition.
            - **Context**: How does it fit into the broader field? What problem does it solve?
            
            ### 2. How It Works (The Mechanism)
            - **Step-by-Step Breakdown**: Explain the internal logic, process, or mechanism in detail.
            - **Technical Nuance**: Don't simplify too much—explain the technical 'magic' under the hood.
            
            ### 3. Key Components
            - List and describe the essential elements, variables, or actors involved.
            
            ### 4. Mental Model & Analogy
            - Provide a vivid, memorable analogy (e.g., "Think of it like...") to help intuition.
            
            ### 5. Real-World Applications
            - Give 2-3 concrete examples of how this is used in industry or nature today.
            
            ### 6. Visualization Architecture
            - Describe the ideal structure for a Mind Map of this topic (e.g., "Central Node: [Topic] -> Branch A: [Concept]...").
            
            (Note: A visual Mind Map will be generated separately, so focus on the *explanation* and *structure description* here).`;
            break;

        case 'practice':
            modelId = "gemini-3-pro-preview";
            systemTask = "Generate practice problems.";
            prompt = `Generate Practice Questions for "${inputs.topic}" (${inputs.level}).
            Include:
            1. 3 Multiple Choice Questions (with tricky distractors)
            2. 2 Conceptual/Reasoning Questions
            3. 1 High-Order Thinking (HOTS) Problem
            Provide answers and detailed explanations at the end.`;
            break;

        case 'project':
            tools = [{ googleSearch: {} }];
            systemTask = "Suggest real-world projects.";
            prompt = `Suggest Real-World Projects to learn "${inputs.subject}".
            Level: ${inputs.level}
            
            Provide 3 ideas:
            1. Beginner (Quick win)
            2. Intermediate (Portfolio worthy)
            3. Advanced (Capstone/Research level)
            
            For each, list tools needed and key learning outcomes.`;
            break;

        case 'exam':
            modelId = "gemini-3-pro-preview";
            systemTask = "Optimize exam preparation.";
            prompt = `Exam Preparation Mode for "${inputs.examName}".
            1. Analyze typical high-weightage topics (General knowledge).
            2. Create a "Crash Course" Revision Plan.
            3. Suggest Mock Test strategy.
            4. Provide 5 "Guess Questions" or critical concepts often asked.`;
            break;

        case 'career':
            tools = [{ googleSearch: {} }];
            systemTask = "Align learning with career goals.";
            prompt = `Career-Aligned Learning Path.
            Subject: ${inputs.subject}
            Career Goal: ${inputs.careerGoal}
            
            Map the subject concepts directly to job skills.
            Suggest:
            1. Key Skills to prioritize
            2. Certifications valuable in industry
            3. Potential Internships/Roles`;
            break;

        case 'style':
            systemTask = "Adapt content to learning style.";
            prompt = `Explain "${inputs.topic}" for a "${inputs.style}" Learner.
            (Visual, Auditory, Textual, or Kinesthetic).
            
            If Visual: Describe diagrams/charts.
            If Kinesthetic: Suggest experiments/code-along.
            If Auditory: Write a script/conversation.`;
            break;

        case 'doubt':
            modelId = "gemini-3-pro-preview"; // Deep reasoning for solving
            systemTask = "Solve academic doubts.";
            prompt = `Doubt Solver:
            Question: "${inputs.question}"
            
            Provide a Step-by-Step Solution.
            Explain the "Why" behind each step.
            Anticipate where a student might get stuck and clarify.`;
            // Attachments handled in caller
            break;

        case 'revision':
            systemTask = " Optimize revision strategy.";
            prompt = `Create a Spaced Repetition Revision Plan for "${inputs.subject}".
            Topics covered so far: ${inputs.topic || "General"}
            
            Schedule review sessions for:
            - Day 1 (Immediate)
            - Day 3
            - Day 7
            - Day 30
            Suggest specific active recall techniques for each session.`;
            break;
    }

    // Handle Attachments for Doubt/Tutor
    const parts: any[] = [];
    if (inputs.files && inputs.files.length > 0) {
        inputs.files.forEach((file: Attachment) => {
            const base64Data = file.data.includes('base64,') ? file.data.split('base64,')[1] : file.data;
            parts.push({
                inlineData: { mimeType: file.mimeType, data: base64Data }
            });
        });
    }
    parts.push({ text: prompt });

    const systemInstruction = getSystemInstruction(context, systemTask);
    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction, tools },
        history
    });

    return chat.sendMessageStream({ message: parts });
};

// Legacy support or direct visual JSON generation
export const generateRoadmapJSON = async (subject: string, level: string, context: UserContext): Promise<RoadmapNode | null> => {
    try {
        const schema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Root Topic (Short)" },
                description: { type: Type.STRING },
                children: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Phase/Module Name (Short Keyword)" },
                            description: { type: Type.STRING, description: "Brief subtext (optional)" },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Topic/Concept" },
                                        description: { type: Type.STRING }
                                    }
                                }
                            }
                        },
                        required: ["name", "children"]
                    }
                }
            },
            required: ["name", "children"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a JSON structure for a Mind Map about "${subject}" (${level}). 
            Crucial: Use short, concise keywords for 'name' fields, not full sentences. 
            Structure: Root -> Modules -> Concepts.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as RoadmapNode;

    } catch (e) {
        console.error("Failed to generate roadmap JSON", e);
        return null;
    }
}


// 2. R&D Ideas (Uses Google Search Grounding)
export const generateRnDIdeasStream = async (
  field: string, 
  problem: string, 
  context: UserContext,
  history: Content[]
) => {
  const modelId = "gemini-2.5-flash";
  const systemInstruction = getSystemInstruction(context, "Suggest innovative R&D ideas based on latest real-world data.");

  const chat = ai.chats.create({
    model: modelId,
    config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }] // Enable Search Grounding
    },
    history
  });

  const prompt = `Suggest 2-4 R&D directions for the field: "${field}".
  ${problem ? `Specific problem context: ${problem}` : ""}
  
  Use Google Search to find recent advancements or real-world needs related to this.
  
  For each idea, provide:
  1. Title
  2. Problem Explanation
  3. Real-world Importance (cite sources if found)
  4. Mini Research Plan (Skills, Data, Collaboration).
  
  Format nicely with Markdown headers.`;

  return chat.sendMessageStream({ message: prompt });
};

// 3. Startup Helper - All Tools
export const generateStartupToolStream = async (
  toolId: StartupToolId,
  inputs: any,
  context: UserContext,
  history: Content[]
) => {
    let modelId = "gemini-2.5-flash";
    let systemTask = "Act as a specialized startup consultant.";
    let tools: any = undefined;
    let prompt = "";

    // Specific Configurations per Tool
    switch(toolId) {
        case 'blueprint':
            modelId = "gemini-3-pro-preview"; // High reasoning
            systemTask = "Generate a comprehensive business blueprint.";
            prompt = `Generate a full Business Blueprint for a startup.
            Domain: ${inputs.domain}
            Problem: ${inputs.problem}
            Stage: ${inputs.stage}
            Geography: ${inputs.geography}
            
            Include:
            1. Problem → Solution → Market → Competition → Moat
            2. Business Model & Pricing Strategy
            3. 1-Year Roadmap (Key milestones)
            4. Hiring Plan (Key roles)
            5. Funding Strategy
            6. Execution Risks & Mitigation`;
            break;

        case 'competitor':
            tools = [{ googleSearch: {} }];
            systemTask = "Conduct real-time competitor market analysis.";
            prompt = `Conduct a real-time Competitor & Market Analysis.
            Domain: ${inputs.domain}
            Problem: ${inputs.problem}
            
            Use Search to find REAL current competitors.
            Output:
            1. Top 5 Competitors (with features/pricing if available)
            2. SWOT Analysis of the market
            3. "Blue Ocean" Gaps (What nobody is solving yet)
            4. Differentiation Strategy`;
            break;

        case 'pitch':
            modelId = "gemini-3-pro-preview";
            systemTask = "Create a YC-ready pitch deck structure.";
            prompt = `Generate content for a 10-slide YC-style Pitch Deck.
            Domain: ${inputs.domain}
            Problem: ${inputs.problem}
            
            Slides to cover:
            1. Title & Tagline
            2. The Problem (Pain point)
            3. The Solution
            4. Market Size (TAM/SAM/SOM estimates)
            5. Product (Description of slides/visuals needed)
            6. Traction (Modeled based on stage: ${inputs.stage})
            7. Business Model
            8. Go-To-Market
            9. Competition (Matrix)
            10. Team (Roles needed)`;
            break;

        case 'roadmap':
            // Visual JSON is handled separately in frontend by calling generateRoadmapJSON
            systemTask = "Create a detailed startup execution roadmap.";
            prompt = `Create a Startup Execution Roadmap (Pre-MVP to Series A).
            Domain: ${inputs.domain}
            Stage: ${inputs.stage}
            
            Provide a Week-by-Week or Month-by-Month plan covering:
            - Development Priorities
            - Feature Milestones
            - Hiring Triggers
            - Launch Checklist`;
            break;

        case 'finance':
            modelId = "gemini-3-pro-preview"; // Math/Logic reasoning
            systemTask = "Create a startup financial model.";
            prompt = `Generate a Financial Model estimate.
            Pricing Model: ${inputs.pricing}
            Estimated CAC: ${inputs.cac}
            Geography: ${inputs.geography}
            
            Calculate and Project:
            1. Revenue Projections (Year 1, 3, 5)
            2. Cash Flow & Burn Rate Analysis
            3. Unit Economics (LTV/CAC ratio)
            4. Break-even Point estimate
            5. Recommended Funding Ask & Runway`;
            break;

        case 'funding':
            tools = [{ googleSearch: {} }];
            systemTask = "Match startup with investors.";
            prompt = `Find potential Investors and Funding sources.
            Domain: ${inputs.domain}
            Stage: ${inputs.stage}
            Geography: ${inputs.geography}
            
            Use Search to find active VCs/Angels/Accelerators in this space.
            Provide:
            1. Recommended Investor Types
            2. List of specific VCs/Accelerators (if found)
            3. What they look for (Thesis)
            4. Cold Email Strategy & Template`;
            break;

        case 'prd':
            modelId = "gemini-3-pro-preview";
            systemTask = "Write a technical Product Requirement Document (PRD).";
            prompt = `Generate a Product Requirement Document (PRD) for the engineering team.
            Product Idea: ${inputs.domain}
            Core Problem: ${inputs.problem}
            
            Include:
            1. Product Vision
            2. User Personas
            3. User Stories
            4. Detailed Feature Requirements
            5. Technical Requirements (Performance, Security)
            6. Acceptance Criteria`;
            break;

        case 'legal':
            tools = [{ googleSearch: {} }];
            systemTask = "Provide legal and compliance guidance.";
            prompt = `Act as a Legal Co-pilot.
            Domain: ${inputs.domain}
            Geography: ${inputs.geography}
            
            Use Search to identify specific regulations (e.g., GDPR, RBI, SEC).
            Provide:
            1. Key Legal Risks
            2. Compliance Checklist (Privacy, Data, Incorporation)
            3. Templates Structure (Terms, Privacy Policy)
            4. Incorporation Guidance for ${inputs.geography}`;
            break;

        case 'brand':
            systemTask = "Create a brand identity.";
            prompt = `Generate a Brand Identity Package.
            Domain: ${inputs.domain}
            Vibe/Audience: ${inputs.targetAudience}
            
            Create:
            1. 5 Startup Name Ideas (Available-sounding)
            2. Logo Concepts (Description for designers)
            3. Color Palette (Hex codes & psychology)
            4. Catchy Taglines
            5. UI Theme Suggestions`;
            break;

        case 'gtm':
            tools = [{ googleSearch: {} }];
            systemTask = "Design a Go-To-Market strategy.";
            prompt = `Design a Go-To-Market (GTM) Strategy.
            Domain: ${inputs.domain}
            Target Audience: ${inputs.targetAudience}
            
            Use Search to see where this audience hangs out.
            Provide:
            1. Positioning & Niching
            2. Growth Loops & Viral Hooks
            3. Marketing Channels (Ranked by efficiency)
            4. Content Strategy (30-day plan ideas)
            5. Cold Outreach Script`;
            break;
            
        case 'simulator':
            systemTask = `Act as a potential customer or user for a "${inputs.domain}" product. 
            You are skeptical but interested. Ask tough questions about value, pricing, and features.
            Do not break character.`;
            prompt = `Start the simulation. I am the founder of a ${inputs.domain} startup solving ${inputs.problem}. 
            Introduce yourself as a customer and ask me about my product.`;
            break;

        case 'tech':
            modelId = "gemini-3-pro-preview";
            systemTask = "Design a technical architecture.";
            prompt = `Design the Technical Architecture.
            Product: ${inputs.domain}
            Scale Goal: ${inputs.stage}
            Budget constraint: ${inputs.budget}
            
            Provide:
            1. Recommended Tech Stack (Frontend, Backend, DB)
            2. Cloud Architecture Diagram description
            3. Database Schema (High level entities)
            4. API Design principles
            5. Security Checklist`;
            break;
    }

    const systemInstruction = getSystemInstruction(context, systemTask);
    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction, tools },
        history
    });

    return chat.sendMessageStream({ message: prompt });
};


// 4. Paper Tool Stream
export const generatePaperToolStream = async (
  toolId: PaperToolId,
  inputs: { text: string, files: Attachment[] },
  context: UserContext,
  history: Content[]
) => {
    let modelId = "gemini-2.5-flash"; // Default
    let systemTask = "Analyze and explain research papers.";
    let tools: any = undefined;
    let prompt = "";

    switch(toolId) {
        case 'fusion': // NEW: Live Web + Scientific Paper Fusion
            modelId = "gemini-3-pro-preview";
            tools = [{ googleSearch: {} }];
            systemTask = "Fuse research paper content with live web data.";
            prompt = `FUSION ENGINE ACTIVATED.
            Context/Topic: ${inputs.text}
            
            Task:
            1. Analyze the attached document(s) (if any).
            2. SEARCH the web for the absolute latest developments, blogs, or news on this topic.
            3. FUSE the information: Compare the paper's findings with the live web data.
            4. Highlight: What is outdated in the paper? What does the web add?
            
            Output a "Fused Insight Report".`;
            break;

        case 'drafter': // NEW: Paper Pipeline Constructor
            modelId = "gemini-3-pro-preview";
            systemTask = "Construct a full research paper seed.";
            prompt = `Research Paper Drafter Mode.
            Topic/Idea: ${inputs.text}
            
            Generate a complete "Seed Paper" structure:
            1. Title Suggestions (Academic style).
            2. Abstract (Draft).
            3. Introduction (Key points).
            4. Literature Review Outline (Suggest classic papers to cite).
            5. Methodology (Proposed experiment design).
            6. Expected Results (Hypothetical).
            7. LaTeX Skeleton Code (for the main structure).`;
            break;

        case 'diagram_gen': // NEW: Scientific Diagram Generator
            modelId = "gemini-3-pro-preview";
            systemTask = "Generate scientific diagram code (LaTeX/Mermaid/TikZ).";
            prompt = `Scientific Diagram Generator.
            Description: ${inputs.text}
            
            Generate the CODE to visualize this.
            - If it's a flowchart/process: Use Mermaid JS syntax (graph TD...).
            - If it's a mathematical plot/structure: Use LaTeX TikZ code.
            - If it's a Gantt chart: Use Mermaid Gantt.
            
            Output the code block clearly labelled.`;
            break;

        case 'validator': // NEW: Research Validation Engine
            modelId = "gemini-3-pro-preview";
            systemTask = "Critically validate research logic and statistics.";
            prompt = `Research Validation Engine.
            Analyze the attached text/paper for:
            1. Logical Fallacies or Leaps.
            2. Statistical Flaws (e.g., p-hacking risks, small sample size indicators).
            3. Reproducibility Issues (Is the method clear enough?).
            4. Bias Check.
            
            Provide a "Validation Scorecard" (Pass/Fail/Warn) for each section.`;
            break;

        case 'deep_explain':
            modelId = "gemini-3-pro-preview"; // Needs reasoning
            systemTask = "Deeply explain complex scientific concepts.";
            prompt = `Provide a Deep Explanation of the attached/provided paper.
            1. Concept Breakdown (Beginner to Expert levels)
            2. Math & Formula Breakdown (Derivations, variables)
            3. Method Intuition (Why it works, analogies)`;
            break;

        case 'lit_review':
            tools = [{ googleSearch: {} }]; // Search for citations
            systemTask = "Generate a literature review context.";
            prompt = `Generate a Mini Literature Review based on this paper.
            Use Search to find citation counts and related papers.
            Provide:
            1. Key Related Papers & History
            2. Current State-of-the-Art context
            3. How this paper fits in`;
            break;

        case 'gap_finder':
            modelId = "gemini-3-pro-preview";
            systemTask = "Critically analyze research gaps.";
            prompt = `Identify Research Gaps & Future Work.
            1. Stated Limitations
            2. Hidden/Unstated Limitations
            3. Potential Future Experiments (Thesis ideas)
            4. Where this approach fails`;
            break;

        case 'compare':
            modelId = "gemini-3-pro-preview";
            systemTask = "Compare multiple research approaches.";
            prompt = `Compare the attached papers (or compare this paper to standard methods).
            Create a Comparison Table:
            - Method
            - Dataset
            - Pros/Cons
            - Scalability`;
            break;

        case 'reproduce':
            modelId = "gemini-3-pro-preview"; // Needs logic
            systemTask = "Create a reproduction plan.";
            prompt = `Generate a "Reproduce this Paper" Blueprint.
            1. Environment Setup (Libraries, Requirements)
            2. Data Preparation
            3. Step-by-Step Experiment Flow
            4. Expected Output values`;
            break;

        case 'visualize':
            systemTask = "Describe visualizations for the paper.";
            prompt = `Describe the Flowcharts and Diagrams needed to understand this paper.
            1. Architecture Diagram description
            2. Data Flow description
            
            (Note: I will also generate a Mind Map structure separately).`;
            break;

        case 'extract':
            systemTask = "Extract key structured data.";
            prompt = `Extract all important items:
            1. Definitions of key terms
            2. Key Equations (in LaTeX/Text)
            3. Hyperparameters used
            4. Results Tables (formatted as Markdown tables)`;
            break;

        case 'prereq':
            systemTask = "Identify prerequisite knowledge.";
            prompt = `Build a Prerequisite Learning Path.
            What must I know BEFORE reading this?
            1. Background Math/Theory
            2. Recommended Reading List (Textbooks/Papers)`;
            break;

        case 'citation':
            tools = [{ googleSearch: {} }];
            systemTask = "Generate citations.";
            prompt = `Generate Citation Formats for this paper.
            - BibTeX
            - APA, MLA, IEEE
            - Generate 5 potential titles for citing this work`;
            break;

        case 'simplify':
            systemTask = "Simplify text for laypeople.";
            prompt = `Rewrite the Abstract, Intro, and Conclusion in:
            1. Simple English (High School level)
            2. Bullet Points
            3. Story Format`;
            break;

        case 'presentation':
            modelId = "gemini-3-pro-preview";
            systemTask = "Create presentation content.";
            prompt = `Generate content for a 10-slide Research Presentation.
            Include:
            - Slide Title
            - Bullet points
            - Speaker Notes
            - Figure placeholder suggestions`;
            break;

        case 'code':
            modelId = "gemini-3-pro-preview"; // High reasoning for code
            systemTask = "Convert theory to code.";
            prompt = `Generate Pseudocode and Python implementation structure for the key algorithms in this paper.
            Explain the classes and main logic loop.`;
            break;

        case 'paraphrase':
            systemTask = "Assist with academic writing.";
            prompt = `Check the writing style.
            1. Identify potentially complex or unclear sentences.
            2. Suggest Academic Paraphrasing.
            3. Flag potential plagiarism risks (general advice).`;
            break;

        case 'review':
            modelId = "gemini-3-pro-preview";
            systemTask = "Act as a rigorous academic reviewer (Nature/NeurIPS style).";
            prompt = `Conduct a Peer Review of this paper.
            1. Summary of Contributions
            2. Strengths
            3. Weaknesses (Methodology, Clarity, Experiments)
            4. Decision (Accept/Reject) reasoning`;
            break;
    }

    // Attach files if any
    const parts: any[] = [];
    inputs.files.forEach(file => {
        const base64Data = file.data.includes('base64,') ? file.data.split('base64,')[1] : file.data;
        parts.push({
            inlineData: { mimeType: file.mimeType, data: base64Data }
        });
    });

    if (inputs.text) {
        prompt += `\n\nAdditional Note: ${inputs.text}`;
    }
    
    parts.push({ text: prompt });

    const systemInstruction = getSystemInstruction(context, systemTask);
    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction, tools },
        history
    });

    return chat.sendMessageStream({ message: parts });
};

// 5. R&D Innovation Engine
export const generateRndToolStream = async (
    toolId: RndToolId,
    inputs: { field: string, problem: string, secondaryField?: string, files?: Attachment[] },
    context: UserContext,
    history: Content[]
  ) => {
      let modelId = "gemini-2.5-flash"; // Default
      let systemTask = "Assist with R&D Innovation.";
      let tools: any = undefined;
      let prompt = "";
  
      switch(toolId) {
          case 'ara': // NEW: Autonomous Research Agent
              modelId = "gemini-3-pro-preview";
              tools = [{ googleSearch: {} }];
              systemTask = "Act as an Autonomous Research Agent (ARA). Execute a full research lifecycle.";
              prompt = `ARA Mode: Autonomous Research Dossier Generation.
              Goal/Topic: "${inputs.field}".
              
              EXECUTE the following pipeline autonomously:
              
              PHASE 1: LITERATURE SCAN (Simulated)
              - Search for State-of-the-Art (SOTA) in this field.
              - Summarize 3 key recent papers/developments.
              
              PHASE 2: GAP ANALYSIS
              - Identify what is missing or unsolved.
              
              PHASE 3: HYPOTHESIS GENERATION
              - Propose 1 Novel Hypothesis to solve the gap.
              
              PHASE 4: EXPERIMENT DESIGN
              - Design an experiment to test the hypothesis (Variables, Control, Method).
              
              PHASE 5: PUBLICATION STRATEGY
              - Suggest target journals and title.
              
              Output a structured "Research Dossier".`;
              break;

          case 'collab_swarm': // NEW: Multi-Agent Collaboration
              modelId = "gemini-3-pro-preview";
              systemTask = "Simulate a Multi-Agent Research Team Collaboration.";
              prompt = `Activate Multi-Agent Swarm.
              Problem: "${inputs.field || inputs.problem}".
              
              Simulate a roundtable discussion between these Agents:
              1. 🧑‍🔬 Lead Scientist (Theoretical Physics/Bio/AI context)
              2. 🛠️ Chief Engineer (Practical constraints, prototyping)
              3. 📊 Statistician (Data validity, experimental design)
              4. 🎨 Design Thinker (User application, visuals)
              
              Output a Script where they debate, critique, and refine the idea.
              End with a "Consensus Action Plan".`;
              break;
              
          case 'code_sandbox': // NEW: Code Execution Sandbox
              modelId = "gemini-3-pro-preview";
              systemTask = "Act as a Secure Code Sandbox & Debugger.";
              prompt = `Code Execution Sandbox Mode.
              Task: ${inputs.field || inputs.problem}
              
              1. Write the Python/JavaScript code to solve this.
              2. SIMULATE execution: "Running code..."
              3. Show the OUTPUT you would expect.
              4. Self-Correction: "Wait, I noticed a potential bug in line X... Fixing..."
              5. Final Optimized Code.
              
              Format output as a terminal log.`;
              break;

          case 'biotech': // NEW: Biotech Super Agent
              modelId = "gemini-3-pro-preview";
              tools = [{ googleSearch: {} }];
              systemTask = "Act as an Expert Biotech Researcher.";
              prompt = `Biotech Agent Active.
              Context: ${inputs.field || inputs.problem}
              
              1. Analyze biological sequences or concepts involved.
              2. Suggest Lab Protocols (CRISPR, PCR, etc.).
              3. Safety & Ethics check.
              4. Potential Applications in medicine or agritech.`;
              break;

          case 'legal_research': // NEW: Legal Super Agent
              modelId = "gemini-3-pro-preview";
              tools = [{ googleSearch: {} }];
              systemTask = "Act as a Senior Legal Researcher.";
              prompt = `Legal Research Agent Active.
              Query: ${inputs.field || inputs.problem}
              
              1. Extract key legal questions.
              2. Search for relevant Case Law or Statutes (Simulated search based on jurisdiction).
              3. Predict Outcomes based on precedents.
              4. Draft a brief Legal Memo.`;
              break;
          
          case 'quant': // NEW: Quant Finance Agent
              modelId = "gemini-3-pro-preview";
              tools = [{ googleSearch: {} }];
              systemTask = "Act as a Quantitative Finance Researcher.";
              prompt = `Quant Finance Agent Active.
              Strategy/Asset: ${inputs.field || inputs.problem}
              
              1. Analyze Market Data trends (via Search).
              2. Propose a Trading Strategy / Algorithm.
              3. Analyze Risk (Alpha, Beta, Sharpe Ratio estimation).
              4. Suggest a Backtesting methodology.`;
              break;

          case 'hypothesis': // NEW: AI Hypothesis Generator
              modelId = "gemini-3-pro-preview";
              systemTask = "Generate testable scientific hypotheses.";
              prompt = `Hypothesis Generator.
              Observation/Context: "${inputs.problem}".
              
              Generate 3 distinct hypotheses:
              1. The Null Hypothesis (H0)
              2. The Alternate Hypothesis (H1) - Standard
              3. The "Wildcard" Hypothesis (High risk, high reward)
              
              For each, predict the expected outcome.`;
              break;

          case 'data_analyst': // NEW: Live Dataset Analyzer
              modelId = "gemini-3-pro-preview";
              systemTask = "Act as an Expert Data Scientist and AutoML Bot.";
              prompt = `Data Analyst Mode.
              Context/Goal: ${inputs.problem}
              
              I have attached a dataset (or snippet). 
              1. Analyze the structure (infer columns/types if raw data provided).
              2. Suggest Data Cleaning steps (Handling missing values, outliers).
              3. Recommend the BEST Machine Learning models for this data.
              4. Generate Python Code (Pandas/Scikit-Learn) to load, clean, and train a baseline model.
              5. Predict potential insights we might find.`;
              break;

          case 'unknowns': // NEW: Discovery Mode
              modelId = "gemini-3-pro-preview";
              tools = [{ googleSearch: {} }];
              systemTask = "Identify 'Unknown Unknowns' in a field.";
              prompt = `Discovery Mode: Finding Unknown Unknowns.
              Field: "${inputs.field}".
              
              Look beyond standard problems. Identify:
              1. Blindspots in current research.
              2. Parameters nobody is testing.
              3. "Black Swan" scenarios in this domain.
              4. Cross-disciplinary connections nobody is making.`;
              break;

          case 'discovery':
              tools = [{ googleSearch: {} }];
              systemTask = "Analyze global trends and identify research gaps.";
              prompt = `Scan global trends in "${inputs.field}".
              Identify:
              1. Emerging Topics
              2. Major Unsolved Problems
              3. Suggested Research Questions
              4. Hypotheses to test`;
              break;
  
          case 'proposal':
              modelId = "gemini-3-pro-preview"; // Reasoning
              systemTask = "Write formal research proposals.";
              prompt = `Generate a Research Proposal for: "${inputs.field} - ${inputs.problem}".
              Include:
              1. Title
              2. Abstract
              3. Problem Statement & Hypothesis
              4. Methodology & Tools
              5. Expected Outcomes & Metrics
              6. Timeline`;
              break;
  
          case 'experiment':
              modelId = "gemini-3-pro-preview"; // Logic
              systemTask = "Design scientific experiments.";
              prompt = `Create an Experiment Blueprint for: "${inputs.problem}".
              Include:
              1. Step-by-Step Procedure
              2. Materials/Sensors/Equipment
              3. Data Collection Plan
              4. Safety Precautions
              5. Expected Graph Outputs`;
              break;
  
          case 'dataset':
              tools = [{ googleSearch: {} }];
              systemTask = "Locate and generate research data.";
              prompt = `Data Strategy for: "${inputs.problem}".
              1. Use Search to find available datasets (Kaggle, Gov, UCI).
              2. If no data exists, generate a Schema for a Synthetic Dataset.
              3. Provide a Python script snippet to generate 5 sample rows of synthetic data.`;
              break;
  
          case 'score':
              modelId = "gemini-3-pro-preview";
              systemTask = "Evaluate research ideas.";
              prompt = `Evaluate the Idea: "${inputs.problem}" in field "${inputs.field}".
              Provide Scores (1-10) and Reasoning for:
              1. Novelty
              2. Feasibility
              3. Difficulty
              4. Industrial Impact
              5. Cost Estimate`;
              break;
  
          case 'patent':
              tools = [{ googleSearch: {} }];
              systemTask = "Analyze patentability and IP.";
              prompt = `Patentability Scanner for: "${inputs.problem}".
              Use Search to check for similar existing concepts.
              Provide:
              1. Conceptual Novelty (What makes this different?)
              2. Existing Similar Patents/Papers (if found)
              3. Draft Patent Claim Description
              4. IP Strategy`;
              break;
  
          case 'comparison':
              modelId = "gemini-3-pro-preview";
              systemTask = "Compare research ideas.";
              prompt = `Compare the idea "${inputs.problem}" against standard State-of-the-Art methods in "${inputs.field}".
              Create a Comparison Matrix:
              - Method
              - Efficiency
              - Cost
              - Scalability`;
              break;
  
          case 'cross_disciplinary':
              modelId = "gemini-3-pro-preview";
              systemTask = "Merge scientific fields for innovation.";
              prompt = `Merge "${inputs.field}" with "${inputs.secondaryField}".
              Generate 3 Hybrid Innovation Ideas that don't exist yet.
              For each, explain:
              - The Concept
              - How it combines both fields
              - Potential Application`;
              break;
  
          case 'funding':
              tools = [{ googleSearch: {} }];
              systemTask = "Find research grants and funding.";
              prompt = `Find Funding for "${inputs.field}" research.
              Use Search to find:
              1. Government Grants
              2. Corporate CSR Funds
              3. Innovation Challenges
              4. Application Deadlines & Eligibility`;
              break;
  
          case 'industry':
              tools = [{ googleSearch: {} }];
              systemTask = "Map research to industry applications.";
              prompt = `Industry Application Map for: "${inputs.problem}".
              1. Identify Industries that benefit.
              2. Find Real Companies working in this area.
              3. Suggest a Prototype for Industry Adoption.`;
              break;
  
          case 'roadmap':
              modelId = "gemini-3-pro-preview";
              systemTask = "Create long-term R&D roadmaps.";
              prompt = `Create a 2-Year R&D Roadmap for "${inputs.problem}".
              - Year 1: Research & Prototyping (Quarterly goals)
              - Year 2: Testing, Publication & Productization
              - Key Milestones & Skills required`;
              break;
  
          case 'collaboration':
              tools = [{ googleSearch: {} }];
              systemTask = "Find collaborators and experts.";
              prompt = `Find Potential Collaborators for "${inputs.field}".
              Use Search to suggest:
              1. Top Universities/Labs active in this field.
              2. Key Professors/Researchers (with links if possible).
              3. Relevant Open Source Communities.`;
              break;
  
          case 'ethics':
              modelId = "gemini-3-pro-preview";
              systemTask = "Analyze research ethics and risks.";
              prompt = `Risk & Ethics Assessment for "${inputs.problem}".
              Analyze:
              1. Ethical Concerns (Bias, Privacy, Dual-use)
              2. Safety Risks
              3. Environmental Impact
              4. Regulatory Compliance`;
              break;
      }

      // Handle Attachments for Data Analyst or others
      const parts: any[] = [];
      if (inputs.files && inputs.files.length > 0) {
          inputs.files.forEach((file: Attachment) => {
              const base64Data = file.data.includes('base64,') ? file.data.split('base64,')[1] : file.data;
              parts.push({
                  inlineData: { mimeType: file.mimeType, data: base64Data }
              });
          });
      }
      parts.push({ text: prompt });
  
      const systemInstruction = getSystemInstruction(context, systemTask);
      const chat = ai.chats.create({
          model: modelId,
          config: { systemInstruction, tools },
          history
      });
  
      return chat.sendMessageStream({ message: parts });
  };


// 6. Image Analysis (Visual)
export const analyzeImageStream = async (
    imageData: string, // base64 string
    mimeType: string,
    promptText: string,
    context: UserContext,
    history: Content[]
) => {
    // Must use gemini-3-pro-preview for image understanding
    const modelId = "gemini-3-pro-preview";
    const systemInstruction = getSystemInstruction(context, "Analyze the provided image scientifically.");

    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction },
        history
    });

    return chat.sendMessageStream({
        message: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: imageData
                }
            },
            { text: promptText || "Analyze this scientific visual. If it is a graph, extract the data trends. If it is a diagram, explain the mechanism. If it is a formula, solve it or explain it." }
        ]
    });
}

// 7. Mind Map Image Generation (Nano Banana / Flash Image)
export const generateMindMap = async (
    promptContext: string,
    context: UserContext
) => {
    try {
        const modelId = "gemini-2.5-flash-image"; // Text-to-Image model
        
        // This endpoint returns a GenerateContentResponse where we look for inlineData (image)
        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [{ text: `Create a clean, colorful, scientific mind map visualization about: ${promptContext}. White background, clear text nodes.` }]
            },
            config: {
                // No mimeType or schema for image generation models in this SDK context usually
            }
        });

        // Extract Image
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;

    } catch (e) {
        console.error("Mind Map Image Gen Error", e);
        return null;
    }
}


// Generic Chat for follow-ups
export const sendFollowUp = async (
    message: string,
    history: Content[],
    context: UserContext,
    activeTab: string
) => {
    
    let modelId = "gemini-2.5-flash";
    let tools: any = undefined;

    if (activeTab === 'visual') {
        modelId = "gemini-3-pro-preview"; // Stay on Pro for visual context
    } else if (activeTab === 'rnd' || activeTab === 'paper' || activeTab === 'startup' || activeTab === 'roadmap') {
        // Keep search enabled for R&D, Paper, Startup, Roadmap follow-ups
        tools = [{ googleSearch: {} }]; 
    }

    const systemInstruction = getSystemInstruction(context, `Continuing conversation about ${activeTab}`);

    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction, tools },
        history
    });

    return chat.sendMessageStream({ message });
}