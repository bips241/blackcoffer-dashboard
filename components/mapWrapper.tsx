import { useEffect, useState } from "react";
import ChoroplethMap from "./ChoroPlethMap"; 
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

type CountryData = {
  code: string; // ISO Alpha-3
  value: number;
};

export default function ChoroplethMapWrapper() {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  countries.registerLocale(enLocale); // Register English country names

  useEffect(() => {
    fetch("/api/map-data")
      .then((res) => res.json())
      .then((json) => {
        const mapped = json
          .map((d: any) => {
            if (!d?.id || !d?.value) return null;

            const alpha3 = countries.getAlpha3Code(d.id, "en");
            if (!alpha3) {
              console.warn("No Alpha-3 found for:", d.id);
              return null;
            }

            const num = Number(d.value);
            return isNaN(num) ? null : { code: alpha3, value: num };
          })
          .filter(Boolean);

        setData(mapped as CountryData[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch choropleth data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-slate-300 py-6">Loading Choropleth...</div>;
  }

  return (
    <div className="w-full mb-6">
  <ChoroplethMap data={data} />
</div>


  );
}
