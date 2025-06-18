"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

type FuturisticPieChartProps = {
    data: { label: string; value: number }[];
    title?: string;
};

export default function FuturisticPieChart({ data, title = "Pie Chart" }: FuturisticPieChartProps) {
    const ref = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !ref.current) return;

        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        d3.select(ref.current).selectAll("*").remove();

        const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie<{ label: string; value: number }>().value((d) => d.value);
        const arcData = pie(data);

        const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
            .innerRadius(0)
            .outerRadius(radius);

        const arcOver = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
            .innerRadius(0)
            .outerRadius(radius + 10);

        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        const group = svg.selectAll(".arc")
            .data(arcData)
            .enter()
            .append("g")
            .attr("class", "arc");

        group
            .append("path")
            .attr("d", arc)
            .attr("fill", (_, i) => color(String(i)))
            .style("stroke", "#1e293b")
            .style("stroke-width", "2px")
            .style("transition", "all 0.3s ease")
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("d", (d) => arcOver(d as d3.PieArcDatum<{ label: string; value: number }>));
                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.data.label}</strong>: ${d.data.value}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(200).attr("d", (d) => arc(d as d3.PieArcDatum<{ label: string; value: number }>));
                tooltip.style("opacity", 0);
            });
    }, [data]);

    return (
        <div className="max-w-full mx-auto p-6 rounded-3xl shadow-2xl backdrop-blur-md">
            <h2 className="text-center text-indigo-300 font-bold text-xl mb-4 tracking-wide">
            {title}
            </h2>
            <div className="flex justify-center m-auto">
            <svg
                ref={ref}
                className="h-auto"
                style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                }}
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid meet"
            />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
            {data.map((item, index) => (
                <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 shadow-md backdrop-blur-md"
                >
                <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: d3.schemeCategory10[index % 10] }}
                ></span>
                <span className="text-slate-300 font-medium">{item.label}</span>
                </div>
            ))}
            </div>
        </div>
    );
}
