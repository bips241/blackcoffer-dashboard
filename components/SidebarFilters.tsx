"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react"; // Requires lucide-react

const uniqueValues = (data: any[], key: string) => [
  ...new Set(data.map((item) => item[key]).filter(Boolean)),
];

type FiltersProps = {
  data: any[];
  onFilterChange: (filters: Record<string, string>) => void;
};

export default function Filters({ data, onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

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
    "country",
    "added",
    "published",
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-black/50 text-white p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 backdrop-blur-md bg-white/10 border-r border-white/20 shadow-lg transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <div className="grid grid-cols-1 gap-4">
            {selectFields.map((field) => (
              <select
                key={field}
                name={field}
                onChange={handleChange}
                className="p-2 bg-white/10 text-white border border-white/20 rounded w-full backdrop-blur-sm"
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
        </div>
      </aside>
    </>
  );
}
