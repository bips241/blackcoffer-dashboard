"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type HeatmapProps = {
  data: { x: string; y: string; value: number }[];
  title?: string;
};

export default function FuturisticHeatmap({ data, title = "Heatmap" }: HeatmapProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 20, bottom: 80, left: 60 }; // Increased bottom margin for tilted labels
    const width = 640 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const xLabels = Array.from(new Set(data.map((d) => d.x)));
    const yLabels = Array.from(new Set(data.map((d) => d.y)));

    const x = d3.scaleBand().domain(xLabels).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(yLabels).range([0, height]).padding(0.05);

    const colorScale = d3
      .scaleLinear<string>()
      .domain(d3.range(0, 501, 50)) // Domain with a gap of 50
      .range([
      "#fefce8", // Light yellow
      "#fef9c3", // Slightly darker yellow
      "#fef08a", // Mid-range yellow
      "#fde047", // Bright yellow
      "#facc15", // Golden yellow
      "#eab308", // Darker golden yellow
      "#ca8a04", // Deep yellow
      "#a16207", // Dark yellow-brown
      "#854d0e",  // Darkest yellow-brown
      "#7c2d12"  // Deepest yellow-brown
      ]); // Updated color gradient with multiple yellow shades

    const g = svg
      .attr("viewBox", `0 0 640 500`) // Increased viewBox height to fit legend
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll()
      .data(data, (d: any) => d.x + ":" + d.y)
      .join("rect")
      .attr("x", (d) => x(d.x)!)
      .attr("y", (d) => y(d.y)!)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", (d) => colorScale(d.value))
      .style("rx", 8)
      .style("ry", 8)
      .style("transition", "fill 0.3s ease")
      .append("title")
      .text((d) => `${d.x} / ${d.y}: ${d.value}`);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .style("font-family", "Poppins")
      .style("text-anchor", "end") // Align text to the end
      .attr("transform", "rotate(-45)"); // Rotate labels by -45 degrees

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .style("font-family", "Poppins");

    // Add legend
    const legendHeight = 50;
    const legendWidth = width;
    const legendMargin = { top: 100, right: 20, bottom: 10, left: 60 }; // Increased top margin for legend

    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${height + margin.top + legendMargin.top})`);

    const legendScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(10);

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data(colorScale.range().map((color, i, nodes) => ({
        offset: `${(i / (nodes.length - 1)) * 100}%`,
        color,
      })))
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    legend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight / 2)
      .style("fill", "url(#legend-gradient)");

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight / 2})`)
      .call(legendAxis)
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .style("font-family", "Poppins");
  }, [data]);

  return (
    <div className="w-full h-auto p-6 rounded-xl shadow-xl backdrop-blur">
      <h2 className="text-indigo-300 text-xl font-bold text-center mb-4">{title}</h2>
      <svg ref={ref} className="w-full h-[600px]"></svg> {/* Increased height */}
    </div>
  );
}
