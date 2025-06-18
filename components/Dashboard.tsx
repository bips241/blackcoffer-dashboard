"use client";

import { useEffect, useState, useMemo } from "react";
import SidebarFilters from "./SidebarFilters";
import ChartBlock from "./ChartBlock";
import FuturisticPieChart from "./PieChart";
import ChoroplethMapWrapper from "./mapWrapper";
import FuturisticHeatmap from "./HeatMap";
import {RadarChart} from "./RadarChart.tsx";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setFilteredData(json);
        console.log("Fetched data:", json);
      });
  }, []);


  // Get top N topics based on frequency or importance
  const topRadarTopics = useMemo(() => {
    const topicMap = new Map<
      string,
      { intensity: number; relevance: number; likelihood: number; count: number }
    >();
  
    filteredData.forEach(({ topic, intensity, relevance, likelihood }) => {
      if (!topic) return;
      const trimmed = topic.trim();
      const current = topicMap.get(trimmed) || {
        intensity: 0,
        relevance: 0,
        likelihood: 0,
        count: 0,
      };
      topicMap.set(trimmed, {
        intensity: current.intensity + (intensity ?? 0),
        relevance: current.relevance + (relevance ?? 0),
        likelihood: current.likelihood + (likelihood ?? 0),
        count: current.count + 1,
      });
    });
  
    const averaged = Array.from(topicMap.entries()).map(([name, val]) => ({
      name,
      metrics: {
        intensity: val.intensity / val.count || 0,
        relevance: val.relevance / val.count || 0,
        likelihood: val.likelihood / val.count || 0,
      },
    }));
  
    // Get max values for normalization
    const maxVals = averaged.reduce(
      (acc, curr) => ({
        intensity: Math.max(acc.intensity, curr.metrics.intensity),
        relevance: Math.max(acc.relevance, curr.metrics.relevance),
        likelihood: Math.max(acc.likelihood, curr.metrics.likelihood),
      }),
      { intensity: 0, relevance: 0, likelihood: 0 }
    );
  
    // Normalize to 0–100 range
    const normalized = averaged.map((item) => ({
      name: item.name,
      metrics: {
        intensity: (item.metrics.intensity / maxVals.intensity) * 100 || 0,
        relevance: (item.metrics.relevance / maxVals.relevance) * 100 || 0,
        likelihood: (item.metrics.likelihood / maxVals.likelihood) * 100 || 0,
      },
    }));
  
    return normalized.slice(0, 5); // top 5 topics
  }, [filteredData]);
  
  const prepareHeatmapData = () => {
    const counts: Record<string, Record<string, number>> = {};

    filteredData.forEach((item) => {
      const x = item.sector?.trim() || "Unknown";
      const y = item.topic?.trim() || "Unknown";
      const value = item.relevance ?? 0;

      if (!counts[y]) counts[y] = {};
      counts[y][x] = (counts[y][x] || 0) + value;
    });

    const result: { x: string; y: string; value: number }[] = [];

    for (const y in counts) {
      for (const x in counts[y]) {
        result.push({ x, y, value: counts[y][x] });
      }
    }

    return result;
  };

  const heatmapData = useMemo(() => prepareHeatmapData(), [filteredData]);

  const TOP_N = 10; // Show top 10 topics and regions

  const getTopItems = (data: any[], key: string, N: number) => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const value = item[key]?.trim() || "Unknown";
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, N)
      .map(([label]) => label);
  };

  const topTopics = useMemo(() => getTopItems(filteredData, "topic", TOP_N), [filteredData]);
  const topSectors = useMemo(() => getTopItems(filteredData, "sector", TOP_N), [filteredData]);

  const filteredHeatmapData = useMemo(() => {
    return heatmapData.filter(
      (item) => topTopics.includes(item.y) && topSectors.includes(item.x)
    );
  }, [heatmapData, topTopics, topSectors]);

  const handleFilterChange = (filters: Record<string, string>) => {
    const filtered = data.filter((item) =>
      Object.entries(filters).every(
        ([key, val]) =>
          !val || String(item[key] ?? "").toLowerCase() === val.toLowerCase()
      )
    );
    setFilteredData(filtered);
  };

  // Aggregate filtered data by "pestle"
  const aggregateByField = (field: string) => {
    if (!filteredData || filteredData.length === 0) return [];
    const counts: Record<string, number> = {};
    filteredData.forEach((item) => {
      const key = item[field] ?? "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  };

  const pestleData = useMemo(() => aggregateByField("pestle"), [filteredData]);
  const sectorData = useMemo(() => aggregateByField("sector"), [filteredData]);

  return (
    <div className="flex h-screen overflow-hidden bg-inherit">
    <SidebarFilters data={data} onFilterChange={handleFilterChange} />

    <main className="flex-1 overflow-y-auto p-6 bg-inherit space-y-6 ml-64">
    <div className="space-y-6">
      <ChartBlock data={filteredData} />

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FuturisticPieChart data={pestleData} title="Pestle Distribution" />
      <FuturisticPieChart data={sectorData} title="Sector Distribution" />
      </div>

      {/* Heatmap */}
      <div className="flex justify-center items-center w-full mb-6">
      <FuturisticHeatmap data={filteredHeatmapData} title="Heatmap of Insights" />
      </div>

      {/* Map */}
      <div className="flex justify-center items-center w-full mb-6">
      <ChoroplethMapWrapper />
      </div>

      {/* Radar Chart */}
      <div className="flex flex-col items-center w-full mb-6">
  <h2 className="text-indigo-300 text-2xl font-bold text-center mb-4">
    Top Topics Radar Chart
  </h2>
  <div className="w-full flex justify-center">
    <div className="w-full max-w-3xl">
      <RadarChart data={topRadarTopics} />
    </div>
  </div>
</div>

    </div>
    </main>
  </div>
  );
}
