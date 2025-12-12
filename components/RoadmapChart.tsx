
import React, { useEffect, useRef } from 'react';
import { RoadmapNode } from '../types';
import * as markmap from 'markmap-view';
import { Transformer } from 'markmap-lib';

interface RoadmapChartProps {
  data: RoadmapNode;
}

const RoadmapChart: React.FC<RoadmapChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<markmap.Markmap | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // 1. Convert JSON tree to Markdown
    const jsonToMarkdown = (node: RoadmapNode, depth = 0): string => {
        const prefix = '  '.repeat(depth) + '- ';
        let md = `${prefix}${node.name}`;
        if (node.description) {
             // Clean description to avoid breaking Markdown
             const cleanDesc = node.description.replace(/\n/g, ' ').replace(/"/g, "'");
             // Add as inline hint
             md += ` <!-- ${cleanDesc} -->`;
        }
        md += '\n';
        
        if (node.children) {
            node.children.forEach(child => {
                md += jsonToMarkdown(child, depth + 1);
            });
        }
        return md;
    };

    const markdown = jsonToMarkdown(data);

    // 2. Transform Markdown to Markmap Root Node
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    // 3. Create or Update Markmap
    if (mmRef.current) {
        mmRef.current.setData(root);
        mmRef.current.fit();
    } else {
        mmRef.current = markmap.Markmap.create(svgRef.current, {
            autoFit: true,
            zoom: true,
            pan: true,
            duration: 500,
            spacingHorizontal: 80,
            spacingVertical: 10,
        }, root);
    }

  }, [data]);

  return (
    <div className="w-full overflow-hidden p-0 bg-white rounded-lg border border-slate-700 mt-4 relative group">
      <div className="absolute top-2 left-3 z-10 text-xs font-bold text-slate-700 bg-white/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none border border-slate-200">
        Interactive Mind Map
      </div>
      <div className="absolute top-2 right-3 z-10 text-[10px] text-slate-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none border border-slate-200">
        Scroll to Zoom • Drag to Pan
      </div>
      <svg ref={svgRef} className="w-full h-[500px] bg-white text-slate-900"></svg>
    </div>
  );
};

export default RoadmapChart;
