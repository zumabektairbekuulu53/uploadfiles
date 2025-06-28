import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) {
      const parsed = JSON.parse(saved);
      setLoads(parsed);
      setFilteredLoads(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(loads));
    setFilteredLoads(loads);
  }, [loads]);

  function parseExcelDate(excelDate) {
    if (!excelDate || isNaN(excelDate)) return "";
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }

  function parseExcelTime(excelTime) {
    if (!excelTime || isNaN(excelTime)) return "";
    const seconds = Math.round(86400 * (excelTime % 1));
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const formatted = json.map((row) => ({
      driver: row["Driver Name"] || "",
      loadId: row["Load #"] || "",
      puLocation: row["Stop 1"] || "",
      puDate: parseExcelDate(row["Stop 1  Actual Arrival Date"]),
      puTime: parseExcelTime(row["Stop 1  Actual Arrival Time"]),
      delLocation: row["Stop 2"] || "",
      delDate: parseExcelDate(row["Stop 2  Actual Arrival Date"]),
      delTime: parseExcelTime(row["Stop 2  Actual Arrival Time"]),
      miles: row["Distance (mi)"] || 0,
      rate: row["Rate ($)"] || 0,
    }));

    setLoads(formatted);
  };

  const handleSave = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
    alert("Saved successfully.");
  };

  const handleDelete = (index) => {
    const updated = [...loads];
    updated.splice(index, 1);
    setLoads(updated);
  };

  const handleFilter = () => {
    let filtered = [...loads];
    if (filterDate) {
      filtered = filtered.filter((l) => l.puDate === filterDate);
    }
    if (filterDriver) {
      filtered = filtered.filter((l) =>
        l.driver.toLowerCase().includes(filterDriver.toLowerCase())
      );
    }
    setFilteredLoads(filtered);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx" onChange={handleFile} />
      <button onClick={handleSave} className="ml-2 px-4 py-1 border rounded">
        Save
      </button>
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="ml-2 border px-2"
      />
      <input
        type="text"
        placeholder="Filter by Driver"
        value={filterDriver}
        onChange={(e) => setFilterDriver(e.target.value)}
        className="ml-2 border px-2"
      />
      <button onClick={handleFilter} className="ml-2 px-4 py-1 border rounded">
        Filter
      </button>

      <table className="table-auto border mt-4 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2">Driver</th>
            <th className="border px-2">Load #</th>
            <th className="border px-2">PU Location</th>
            <th className="border px-2">PU Date</th>
            <th className="border px-2">PU Time</th>
            <th className="border px-2">Del Location</th>
            <th className="border px-2">Del Date</th>
            <th className="border px-2">Del Time</th>
            <th className="border px-2">Miles</th>
            <th className="border px-2">Rate ($)</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLoads.map((load, idx) => (
            <tr key={idx}>
              <td className="border px-2">{load.driver}</td>
              <td className="border px-2">{load.loadId}</td>
              <td className="border px-2">{load.puLocation}</td>
              <td className="border px-2">{load.puDate}</td>
              <td className="border px-2">{load.puTime}</td>
              <td className="border px-2">{load.delLocation}</td>
              <td className="border px-2">{load.delDate}</td>
              <td className="border px-2">{load.delTime}</td>
              <td className="border px-2">{load.miles}</td>
              <td className="border px-2">{load.rate}</td>
              <td className="border px-2">
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-red-600 px-2"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
