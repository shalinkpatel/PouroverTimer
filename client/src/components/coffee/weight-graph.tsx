import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type Recipe, type WeightPoint } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface WeightGraphProps {
  recipe: Recipe;
  currentTime: number;
}

export default function WeightGraph({ recipe, currentTime }: WeightGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, recipe.totalTime])
      .range([0, width]);

    const maxWeight = d3.max(recipe.targetPoints, d => d.weight) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxWeight])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<WeightPoint>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.weight));

    // Draw axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Draw target line
    svg.append("path")
      .datum(recipe.targetPoints)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw current time indicator
    if (currentTime > 0) {
      svg.append("line")
        .attr("x1", xScale(currentTime))
        .attr("x2", xScale(currentTime))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "hsl(var(--destructive))")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");
    }
  }, [recipe, currentTime]);

  return (
    <Card className="p-4">
      <svg
        ref={svgRef}
        className="w-full"
        viewBox={`0 0 ${svgRef.current?.clientWidth || 600} 300`}
        preserveAspectRatio="xMidYMid meet"
      />
    </Card>
  );
}
