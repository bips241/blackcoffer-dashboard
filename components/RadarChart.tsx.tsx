'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface RadarChartData {
  name: string;
  metrics: {
    intensity: number;
    relevance: number;
    likelihood: number;
  };
}

interface RadarChartProps {
  data: RadarChartData[];
}

const metrics: Array<keyof RadarChartData['metrics']> = ['intensity', 'relevance', 'likelihood'];

export function RadarChart({ data }: RadarChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length || !ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2;

    const allValues = data.flatMap(d => metrics.map(m => d.metrics[m]));
    const maxValue = d3.max(allValues) ?? 1;

    const angleSlice = (Math.PI * 2) / metrics.length;

    const rScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    const lineGenerator = d3.lineRadial<number>()
      .radius((d) => rScale(d))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Axis grid
    for (let level = 1; level <= 5; level++) {
      const r = radius * (level / 5);
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#fff')
        .attr('stroke-dasharray', '2,2');
    }

    // Axis lines
    metrics.forEach((metric, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', '#ccc');

      g.append('text')
        .attr('x', x * 1.1)
        .attr('y', y * 1.1)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(metric);
    });

    // Data polygons
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    data.forEach((d, i) => {
      const values = metrics.map(m => d.metrics[m]);

      g.append('path')
        .datum(values)
        .attr('d', lineGenerator)
        .attr('fill', color(String(i)))
        .attr('fill-opacity', 0.3)
        .attr('stroke', color(String(i)))
        .attr('stroke-width', 2);
    });

  }, [data]);

  return <svg ref={ref} className="w-full" viewBox="0 0 400 400" />;
}
