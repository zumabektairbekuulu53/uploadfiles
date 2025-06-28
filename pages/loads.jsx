import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { format, addDays } from "date-fns";

export default function LoadsPage() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setRows(JSON.parse(saved));
  }, []);

  const excelDateToJS = (serial) => {
    if (!serial || isNaN(serial)) return "—";
    const date = addDays(new Date(1899, 11, 30), Math.floor(serial));
    return format(date, "MM/dd/yyyy");
  };

  const excelTimeToString = (decimal) => {
    if (!decimal || isNaN(decimal)) return "—";
    const totalSeconds = Math.round(24 * 60 * 60 * decimal);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    console.log("First row from Excel:", json[0]);

    const mapped = json.map((row) => ({
      Driver: row["Driver Name"] || "",
      "Load #": row["Load ID"] || "",
      "PU Location": row["Stop 1"] || "",
      "PU Date": excelDateToJS(row["Stop 1 Actual Departure Date"] || row["Stop 1 Actual Arrival Date"]),
      "PU Time": excelTimeToString(row["Stop 1 Actual Arrival Time"]),
      "Del Location": row["Stop 2"] || "",
      "Del Date": excelDateToJS(row["Stop 2 Actual Arrival Date"]),
      "Del Time": excelTimeToString(row["Stop 2 Actual Arrival Time"]),
      Miles: row["Estimated Cost"] || "",
      "Rate ($)": row["Estimated Cost"] || ""
    }));

    setRows(mapped);
  };

  const handleSave = () => {
    if (rows.length) {
      localStorage.setItem("loads", JSON.stringify(rows));
      alert("Loads saved successfully ✅");
    }
  };

  const handleDelete = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    localStorage.setItem("loads", JSON.stringify(updated));
  };

  const filteredRows = rows.filter((row) => {
    const matchDate = filterDate ? (row["PU Date"] || "").includes(filterDate) : true;
    const matchDriver = filterDriver ? (row["Driver"] || "").toLowerCase().includes(filterDriver.toLowerCase()) : true;
    return matchDate && matchDriver;
  });

  return (
    <div className="p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />

      {rows.length > 0 && (
        <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <input
            type="text"
            placeholder="Filter by PU Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border p-2"
          />

          <input
            type="text"
            placeholder="Filter by Driver"
            value={filterDriver}
            onChange={(e) => setFilterDriver(e.target.value)}
            className="border p-2"
          />
        </div>
      )}

      {filteredRows.length > 0 && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              {Object.keys(filteredRows[0]).map((key) => (
                <th key={key} className="border p-2 whitespace-nowrap">{key}</th>
              ))}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border p-2 whitespace-nowrap">{val}</td>
                ))}
                <td className="border p-2 text-center">
                  <button onClick={() => handleDelete(i)} className="text-red-500 font-bold">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
