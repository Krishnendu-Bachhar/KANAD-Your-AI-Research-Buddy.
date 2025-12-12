
import { ResearchPaper } from "../types";

const ARXIV_API_URL = "https://export.arxiv.org/api/query";
const SEMANTIC_SCHOLAR_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search";

export async function searchArxiv(query: string, maxResults = 10): Promise<ResearchPaper[]> {
    try {
        // ArXiv API does not support CORS, so we must use a proxy for client-side requests.
        const targetUrl = `${ARXIV_API_URL}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Failed to fetch from arXiv");
        
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const entries = xmlDoc.getElementsByTagName("entry");
        
        const papers: ResearchPaper[] = [];
        
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, ' ').trim() || "No Title";
            const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, ' ').trim() || "";
            const published = entry.getElementsByTagName("published")[0]?.textContent || "";
            const id = entry.getElementsByTagName("id")[0]?.textContent || "";
            
            // Authors
            const authorTags = entry.getElementsByTagName("author");
            const authors: string[] = [];
            for(let j=0; j<authorTags.length; j++) {
                const name = authorTags[j].getElementsByTagName("name")[0]?.textContent;
                if(name) authors.push(name);
            }

            papers.push({
                title,
                authors,
                year: published.split('-')[0] || "N/A",
                abstract: summary,
                url: id,
                source: 'arXiv'
            });
        }
        
        return papers;
    } catch (error) {
        console.error("arXiv Search Error:", error);
        return [];
    }
}

export async function searchSemanticScholar(query: string, maxResults = 10): Promise<ResearchPaper[]> {
    try {
        // Semantic Scholar API enforces CORS. We must use the proxy.
        const targetUrl = `${SEMANTIC_SCHOLAR_API_URL}?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,year,abstract,url`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            console.warn("Semantic Scholar API proxy request failed.");
            return [];
        }

        const data = await response.json();
        
        // Semantic Scholar Search API structure: { total: number, offset: number, data: [...] }
        if (!data.data) return [];

        return data.data.map((item: any) => ({
            title: item.title,
            authors: item.authors ? item.authors.map((a: any) => a.name) : [],
            year: item.year?.toString() || "N/A",
            abstract: item.abstract || "No abstract available.",
            url: item.url,
            source: 'Semantic Scholar'
        }));

    } catch (error) {
        console.error("Semantic Scholar Search Error:", error);
        return [];
    }
}

export async function searchPapers(
    query: string, 
    domain: string, 
    source: 'Auto' | 'arXiv' | 'Semantic Scholar'
): Promise<ResearchPaper[]> {
    // Enhance query with domain if needed, but usually user query is specific enough.
    // If query is empty, use domain as keyword.
    const effectiveQuery = query.trim() ? query : domain;
    
    let results: ResearchPaper[] = [];

    if (source === 'arXiv') {
        results = await searchArxiv(effectiveQuery);
    } else if (source === 'Semantic Scholar') {
        results = await searchSemanticScholar(effectiveQuery);
    } else {
        // Auto: Mix results or choose based on domain logic. 
        // We try both and merge.
        
        // Parallel fetch for better UX
        const [arxivResults, semanticResults] = await Promise.all([
             searchArxiv(effectiveQuery),
             searchSemanticScholar(effectiveQuery)
        ]);
        
        // Interleave or just concat
        results = [...arxivResults, ...semanticResults];
    }
    
    return results;
}
