"use client";

import { useState } from "react";

const uniqueValues = (data: any[], key: string) => [
  ...new Set(data.map((item) => item[key]).filter(Boolean)),
];

type FiltersProps = {
  data: any[];
  onFilterChange: (filters: Record<string, string>) => void;
};

export default function Filters({ data, onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectFields = [
    "end_year",
    "intensity",
    "sector",
    "topic",
    "region",
    "start_year",
    "impact",
    "relevance",
    "pestle",
    "source",
    "likelihood",
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {selectFields.map((field) => (
        <select
          key={field}
          name={field}
          onChange={handleChange}
          className="p-2 border rounded w-full"
          defaultValue=""
        >
          <option value="">Select {field}</option>
          {uniqueValues(data, field).map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
