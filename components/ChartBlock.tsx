"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type ChartBlockProps = {
  data: any[];
};

export default function ChartBlock({ data }: ChartBlockProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const container = svg.node()?.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };

    const viewWidth = width;
    const viewHeight = height;

    svg.attr("viewBox", `0 0 ${viewWidth} ${viewHeight}`).attr("preserveAspectRatio", "xMidYMid meet");

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.country || "Unknown"))
      .range([margin.left, viewWidth - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.intensity) || 10])
      .nice()
      .range([viewHeight - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("fill", "#60a5fa")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.country || "Unknown")!)
      .attr("y", (d) => y(d.intensity))
      .attr("height", (d) => y(0) - y(d.intensity))
      .attr("width", x.bandwidth());

    svg
      .append("g")
      .attr("transform", `translate(0,${viewHeight - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return (
    <div className="w-full h-full p-4 bg-inherit rounded shadow-md">
      <h2 className="text-lg font-semibold mb-2">Intensity by Country</h2>
      <svg ref={ref} className="bg-inherit border rounded w-full h-full"></svg>
    </div>
  );
}
