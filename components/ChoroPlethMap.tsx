"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { isoNumericToAlpha3 } from "@/utils/isoNumericToAlpha3";

interface ChoroplethMapProps {
    data: { code: string; value: number }[];
    title?: string;
}

// ChoroplethMap Component
export default function ChoroplethMap({ data, title = "Intensity Map" }: ChoroplethMapProps) {
    const ref = useRef<SVGSVGElement | null>(null);

    console.log("ChoroplethMap data:", data);
    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const width = 960;
        const height = 500;

        const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
        const path = d3.geoPath().projection(projection);

        // Removed unused 'color' variable

        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        const renderMap = async () => {
            const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json") as any;
            const countries = (topojson.feature(world, world.objects.countries) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>).features;

            const countryValue: Record<string, number> = Object.fromEntries(data.map(d => [d.code, d.value]));

            svg.attr("viewBox", `0 0 ${width} ${height}`)
                .attr("class", "rounded-3xl shadow-xl border border-slate-600 backdrop-blur-md");

            const gradientColor = d3.scaleLinear<string>()
                .domain([0, 25, 50, 70, 100, 125, 150, 175, 200, 300])
                .range(["#440154", "#8ee84b", "#e42ded", "#31688e", "#35b779", "#fde725", "13f8e1", "#f0f921", "#fde725", "#440154"]);

            svg.append("g")
                .selectAll("path")
                .data(countries)
                .join("path")
                .attr("d", path as any)
                .attr("fill", d => {
                    const alpha3Code = isoNumericToAlpha3[String(d.id).padStart(3, "0")];
                    const val = countryValue[alpha3Code];
                    return val != null ? gradientColor(val) : "#1e293b";
                })
                .attr("stroke", "#0f172a")
                .attr("stroke-width", 0.5)
                .on("mouseover", function (event, d) {
                    const alpha3Code = isoNumericToAlpha3[String(d.id).padStart(3, "0")];
                    const val = countryValue[alpha3Code];
                    tooltip.style("opacity", 1)
                        .html(`Code: ${alpha3Code || "N/A"}<br>Value: ${val != null ? val : "N/A"}`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                    d3.select(this).attr("stroke-width", 1.5);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                    d3.select(this).attr("stroke-width", 0.5);
                });
        };

        renderMap();

        return () => {
            tooltip.remove();
        };
    }, [data]);

    return (
        <div className="bg-transparent">
            <h2 className="text-center text-indigo-300 text-2xl font-semibold mb-4">{title}</h2>
            <svg ref={ref} className="w-full h-[300px] bg-transparent rounded-2xl" />

            <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-white">0</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#440154" }}></div>
                    <span className="text-sm text-white">25</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#8ee84b" }}></div>
                    <span className="text-sm text-white">50</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#e42ded" }}></div>
                    <span className="text-sm text-white">70</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#31688e" }}></div>
                    <span className="text-sm text-white">100</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#35b779" }}></div>
                    <span className="text-sm text-white">125</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#fde725" }}></div>
                    <span className="text-sm text-white">150</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#13f8e1" }}></div>
                    <span className="text-sm text-white">175</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#f0f921" }}></div>
                    <span className="text-sm text-white">200</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#fde725" }}></div>
                    <span className="text-sm text-white">300</span>
                    <div className="w-6 h-4" style={{ backgroundColor: "#440154" }}></div>
                </div>
            </div>
        </div>
    );
}
