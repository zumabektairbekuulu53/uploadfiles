import { useEffect, useState, useRef } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";

export default function PayrollFull() {
  const [loads, setLoads] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driver, setDriver] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filtered, setFiltered] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [additions, setAdditions] = useState([]);
  const pdfRef = useRef();

  useEffect(() => {
    const l = localStorage.getItem("loads");
    const d = localStorage.getItem("drivers");
    if (l) setLoads(JSON.parse(l));
    if (d) setDrivers(JSON.parse(d));
  }, []);

  useEffect(() => {
    if (!driver) return;
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 0 });
    const rows = loads.filter(
      (l) =>
        l.driver === driver &&
        isWithinInterval(parseISO(l.pu_date), { start, end })
    );
    setFiltered(rows);
  }, [driver, currentWeek, loads]);

  const weekLabel = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 0 });
    return `${format(start, "MM-dd-yyyy")} - ${format(end, "MM-dd-yyyy")}`;
  };

  const grossTotal = filtered.reduce((acc, row) => acc + parseFloat(row.rate || 0), 0);
  const deductionsTotal = deductions.reduce((acc, d) => acc + parseFloat(d.amount || 0), 0);
  const additionsTotal = additions.reduce((acc, a) => acc + parseFloat(a.amount || 0), 0);

  const netTotal = grossTotal + additionsTotal - deductionsTotal;

  const downloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = pdfRef.current;
    if (!element || !html2pdf) return;
    const opt = {
      margin: 0.5,
      filename: `${driver}_statement_${weekLabel().replace(/ /g, "")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="p-6" ref={pdfRef}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Weekly #{format(currentWeek, "w")} {weekLabel()}</h2>
          <select value={driver} onChange={(e) => setDriver(e.target.value)} className="border p-2 mt-2">
            <option value="">-- Select Driver --</option>
            {drivers.map((d, i) => (
              <option key={i}>{d}</option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600">${netTotal.toFixed(2)}</p>
          <button onClick={downloadPDF} className="bg-red-500 text-white mt-2 px-4 py-1 rounded">Download PDF</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="bg-gray-200 px-3 py-1">← Week</button>
        <button onClick={() => setCurrentWeek(new Date())} className="bg-gray-200 px-3 py-1">Current</button>
        <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="bg-gray-200 px-3 py-1">Week →</button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Loads</h3>
      <table className="w-full border text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Load #</th>
            <th className="border p-2">PU Date</th>
            <th className="border p-2">Del Date</th>
            <th className="border p-2">Origin</th>
            <th className="border p-2">Dest</th>
            <th className="border p-2">Miles</th>
            <th className="border p-2">Rate</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              <td className="border p-2">{i + 1}</td>
              <td className="border p-2">{l.load}</td>
              <td className="border p-2">{l.pu_date}</td>
              <td className="border p-2">{l.del_date}</td>
              <td className="border p-2">{l.pu_location}</td>
              <td className="border p-2">{l.del_location}</td>
              <td className="border p-2">{l.miles}</td>
              <td className="border p-2">${parseFloat(l.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Additions</h4>
          {additions.map((item, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input className="border p-1 flex-1" value={item.desc} onChange={(e) => {
                const copy = [...additions];
                copy[i].desc = e.target.value;
                setAdditions(copy);
              }} />
              <input className="border p-1 w-24" value={item.amount} onChange={(e) => {
                const copy = [...additions];
                copy[i].amount = e.target.value;
                setAdditions(copy);
              }} />
              <button onClick={() => setAdditions(additions.filter((_, idx) => idx !== i))}>❌</button>
            </div>
          ))}
          <button onClick={() => setAdditions([...additions, { desc: "", amount: "" }])} className="text-sm mt-2 text-blue-500">+ Add</button>
        </div>

        <div>
          <h4 className="font-semibold">Deductions</h4>
          {deductions.map((item, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input className="border p-1 flex-1" value={item.desc} onChange={(e) => {
                const copy = [...deductions];
                copy[i].desc = e.target.value;
                setDeductions(copy);
              }} />
              <input className="border p-1 w-24" value={item.amount} onChange={(e) => {
                const copy = [...deductions];
                copy[i].amount = e.target.value;
                setDeductions(copy);
              }} />
              <button onClick={() => setDeductions(deductions.filter((_, idx) => idx !== i))}>❌</button>
            </div>
          ))}
          <button onClick={() => setDeductions([...deductions, { desc: "", amount: "" }])} className="text-sm mt-2 text-blue-500">+ Deduct</button>
        </div>
      </div>
    </div>
  );
}
