import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NarrativeNode, NarrativeLink } from '../types';

interface StoryMapProps {
  nodes: NarrativeNode[];
  links: NarrativeLink[];
}

const StoryMap: React.FC<StoryMapProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const width = 800;
    const height = 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<any>(nodes)
      .force("link", d3.forceLink<any, any>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", 25)
      .attr("fill", d => {
        switch (d.type) {
          case "character": return "#ec4899";
          case "event": return "#f97316";
          case "scene": return "#6366f1";
          case "location": return "#10b981";
          default: return "#94a3b8";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#141414");

    node.append("title")
      .text(d => `${d.label} (${d.type})\n${d.description || ""}`);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="w-full h-[500px] bg-ink/5 rounded-3xl overflow-hidden relative border border-ink/5">
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <span className="text-[10px] uppercase font-bold text-ink/40">Character</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-[10px] uppercase font-bold text-ink/40">Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[10px] uppercase font-bold text-ink/40">Scene</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] uppercase font-bold text-ink/40">Location</span>
        </div>
      </div>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default StoryMap;
