
import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploadTable() {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json(ws);

      const cleaned = raw.map((row) => {
        const rate = parseFloat(row["Estimated Cost"] || 0) * 2.5;
        return {
          driver: row["Driver Name"] || "",
          load: row["Load ID"] || "",
          pu_location: row["Stop 1"] || "",
          pu_date: row["Stop 1 Actual Departure Date"] || "",
          pu_time: row["Stop 1  Actual Arrival Time"] || "",
          del_location: row["Stop 2"] || "",
          del_date: row["Stop 2  Actual Arrival Date"] || "",
          del_time: row["Stop 2  Actual Arrival Time"] || "",
          miles: row["Estimated Cost"] || 0,
          rate: rate.toFixed(2),
        };
      });

      setData(cleaned);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mb-4" />

      {data.length > 0 && (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Driver</th>
              <th className="border p-2">Load #</th>
              <th className="border p-2">PU Location</th>
              <th className="border p-2">PU Date</th>
              <th className="border p-2">PU Time</th>
              <th className="border p-2">Del Location</th>
              <th className="border p-2">Del Date</th>
              <th className="border p-2">Del Time</th>
              <th className="border p-2">Miles</th>
              <th className="border p-2">Rate ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">{row.driver}</td>
                <td className="border px-2 py-1">{row.load}</td>
                <td className="border px-2 py-1">{row.pu_location}</td>
                <td className="border px-2 py-1">{row.pu_date}</td>
                <td className="border px-2 py-1">{row.pu_time}</td>
                <td className="border px-2 py-1">{row.del_location}</td>
                <td className="border px-2 py-1">{row.del_date}</td>
                <td className="border px-2 py-1">{row.del_time}</td>
                <td className="border px-2 py-1">{row.miles}</td>
                <td className="border px-2 py-1">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
