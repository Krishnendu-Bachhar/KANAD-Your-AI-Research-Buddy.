
import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import * as ResearchService from '../services/researchService';

interface ResearchLibraryProps {
    onSendToKanad: (paper: ResearchPaper) => void;
}

const ResearchLibrary: React.FC<ResearchLibraryProps> = ({ onSendToKanad }) => {
    const [domain, setDomain] = useState("Programming & Web Development");
    const [query, setQuery] = useState("");
    const [source, setSource] = useState<'Auto' | 'arXiv' | 'Semantic Scholar'>('Auto');
    const [results, setResults] = useState<ResearchPaper[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setResults([]);
        
        // Combine domain keywords if query is broad? 
        // For now, pass query. If query is empty, use domain name.
        const effectiveQuery = query || domain.split('&')[0]; 
        
        try {
            const papers = await ResearchService.searchPapers(effectiveQuery, domain, source);
            setResults(papers);
        } catch (e) {
            console.error("Search failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="text-center space-y-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-100">Research Library</h2>
                <p className="text-sm text-slate-400">Discover papers and preprints across domains, then let KANAD help you understand them.</p>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end md:items-center shadow-lg">
                <div className="flex-1 w-full">
                    <label className="block text-xs text-slate-400 mb-1">Domain / Category</label>
                    <select 
                        className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none text-slate-200"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                         <optgroup label="Programming & Software">
                            <option>HTML</option>
                            <option>CSS</option>
                            <option>C</option>
                            <option>C++</option>
                            <option>Java</option>
                            <option>Python</option>
                            <option>Web Development</option>
                            <option>Data Science</option>
                            <option>Cloud Computing</option>
                            <option>AI / ML</option>
                            <option>Blockchain Technology</option>
                            <option>Cryptography</option>
                            <option>Cyber Security</option>
                        </optgroup>
                        <optgroup label="Physical & Natural Sciences">
                            <option>Physics</option>
                            <option>Applied Physics</option>
                            <option>Chemistry</option>
                            <option>Chemical Engineering</option>
                            <option>Biology</option>
                            <option>Biotechnology</option>
                            <option>Microbiology</option>
                            <option>Environmental Science</option>
                            <option>Geology</option>
                            <option>Nano Technology</option>
                            <option>Astronomy</option>
                            <option>Rocket Technology</option>
                            <option>Drone Technology</option>
                            <option>Defence Technology</option>
                            <option>Renewable Technology</option>
                            <option>Water Resource Management & Purification</option>
                            <option>Agrotech</option>
                            <option>FinTech</option>
                        </optgroup>
                         <optgroup label="Mathematics & Computation">
                            <option>Applied Mathematics</option>
                            <option>Data Science</option>
                            <option>AI / ML</option>
                            <option>Cryptography</option>
                            <option>Quantum Technology</option>
                            <option>Stock Market / Algorithmic trading</option>
                         </optgroup>
                         <optgroup label="Social Sciences, Law & Policy">
                            <option>Law</option>
                            <option>Polity</option>
                            <option>Economy</option>
                            <option>Social Science</option>
                            <option>International Relations</option>
                         </optgroup>
                         <optgroup label="Arts, Life & Health">
                            <option>Nutrition</option>
                            <option>Fine Arts</option>
                            <option>Music</option>
                            <option>Start-up Building</option>
                         </optgroup>
                    </select>
                </div>
                
                <div className="flex-[2] w-full">
                    <label className="block text-xs text-slate-400 mb-1">Keywords</label>
                    <input 
                        type="text" 
                        placeholder="e.g. convolutional neural networks, water purification..."
                        className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none text-slate-200"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="w-full md:w-32">
                    <label className="block text-xs text-slate-400 mb-1">Source</label>
                    <select 
                        className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none text-slate-200"
                        value={source}
                        onChange={(e) => setSource(e.target.value as any)}
                    >
                        <option>Auto</option>
                        <option>arXiv</option>
                        <option>Semantic Scholar</option>
                    </select>
                </div>

                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent to-sky-500 text-slate-900 font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-3">
                         <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                         <p className="text-slate-400 text-sm animate-pulse">Scanning research archives...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((paper, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-accent/30 transition-colors flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${paper.source === 'arXiv' ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-blue-900/20 border-blue-800 text-blue-300'}`}>
                                        {paper.source}
                                    </span>
                                    <span className="text-xs text-slate-500">{paper.year}</span>
                                </div>
                                <h3 className="text-base font-semibold text-slate-200 mb-2 leading-tight line-clamp-2" title={paper.title}>
                                    <a href={paper.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
                                        {paper.title}
                                    </a>
                                </h3>
                                <p className="text-xs text-slate-400 mb-3 italic line-clamp-1">
                                    {paper.authors.join(', ')}
                                </p>
                                <p className="text-xs text-slate-500 mb-4 line-clamp-3 flex-1">
                                    {paper.abstract}
                                </p>
                                <div className="flex gap-2 mt-auto">
                                    <a 
                                        href={paper.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium text-center transition-colors"
                                    >
                                        View Paper
                                    </a>
                                    <button 
                                        onClick={() => onSendToKanad(paper)}
                                        className="flex-1 py-1.5 rounded bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-xs font-medium transition-colors"
                                    >
                                        Send to KANAD
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searched ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <p>No results found. Try broader keywords.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-600 opacity-50">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        <p>Select a domain and enter keywords to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResearchLibrary;
