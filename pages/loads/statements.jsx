import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, parseISO, format, isWithinInterval, addWeeks, subWeeks } from "date-fns";
import Link from "next/link";

export default function StatementsPage() {
  const [statements, setStatements] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("loads") || "[]");
    const grouped = new Map();

    saved.forEach((load) => {
      if (!load.delDate || !load.driver) return;
      const delDate = parseISO(load.delDate);
      const weekStart = startOfWeek(delDate, { weekStartsOn: 0 });
      const weekKey = `${load.driver}_${format(weekStart, "yyyy-MM-dd")}`;

      if (!grouped.has(weekKey)) {
        grouped.set(weekKey, {
          driver: load.driver,
          weekStart,
          miles: 0,
          revenue: 0,
        });
      }

      const entry = grouped.get(weekKey);
      entry.miles += parseFloat(load.miles || 0);
      entry.revenue += parseFloat(load.rate || 0);
    });

    const result = Array.from(grouped.values()).map((entry, i) => ({
      id: i + 1,
      driver: entry.driver,
      weekStart: entry.weekStart,
      miles: entry.miles,
      revenue: entry.revenue,
      rpm: entry.miles > 0 ? (entry.revenue / entry.miles).toFixed(2) : "0.00",
    }));

    setStatements(result);
  }, []);

  const currentStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const currentEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const filtered = statements.filter((s) =>
    isWithinInterval(s.weekStart, { start: currentStart, end: currentEnd })
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Statements</h1>

      <div className="flex gap-2 mb-4 items-center">
        <span className="text-sm text-gray-600">
          Week: {format(currentStart, "MM-dd-yyyy")} – {format(currentEnd, "MM-dd-yyyy")}
        </span>
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          ← Week
        </button>
        <button
          onClick={() => setCurrentWeek(new Date())}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Current
        </button>
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          Week →
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Driver</th>
            <th className="border p-2">RPM</th>
            <th className="border p-2">Miles</th>
            <th className="border p-2">Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              <td className="border p-2 text-blue-600 underline cursor-pointer">
                <Link href={`/statements/${s.id}`}>#{s.id}</Link>
              </td>
              <td className="border p-2">{s.driver}</td>
              <td className="border p-2">{s.rpm}</td>
              <td className="border p-2">{s.miles}</td>
              <td className="border p-2">{s.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
