import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(data));
  }, [data]);

  const parseExcelDate = (serial) => {
    if (!serial || isNaN(serial)) return "";
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split("T")[0];
  };

  const parseExcelTime = (serial) => {
    if (!serial || isNaN(serial)) return "";
    const totalSeconds = Math.round(serial * 86400);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    const parsed = rows.map((row) => ({
      driver: row["Driver Name"] || "",
      load: row["Load ID"] || "",
      puLocation: row["Stop 1"] || "",
      puDate: parseExcelDate(row["Stop 1 Actual Arrival Date"]),
      puTime: parseExcelTime(row["Stop 1 Actual Arrival Time"]),
      delLocation: row["Stop 2"] || "",
      delDate: parseExcelDate(row["Stop 2 Actual Arrival Date"]),
      delTime: parseExcelTime(row["Stop 2 Actual Arrival Time"]),
      miles: row["Estimated Cost"] || 0,
      rate: row["Estimated Cost"] || 0,
    }));
    setData(parsed);
  };

  const handleDelete = (index) => {
    const copy = [...data];
    copy.splice(index, 1);
    setData(copy);
  };

  const filtered = data.filter((row) => {
    const dateMatch = filterDate ? row.puDate === filterDate : true;
    const driverMatch =
      filterDriver && filterDriver.trim() !== ""
        ? row.driver
            .toLowerCase()
            .includes(filterDriver.trim().toLowerCase())
        : true;
    return dateMatch && driverMatch;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <div className="mb-2">
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
        <button
          onClick={() => localStorage.setItem("loads", JSON.stringify(data))}
          className="ml-2 px-2 py-1 border rounded"
        >
          Save
        </button>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="ml-2 px-2 py-1 border"
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
          className="ml-2 px-2 py-1 border"
        />
        <button
          onClick={() => {
            setFilterDate("");
            setFilterDriver("");
          }}
          className="ml-2 px-2 py-1 border rounded"
        >
          Clear
        </button>
      </div>
      <table className="table-auto border-collapse border w-full">
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
          {filtered.map((row, idx) => (
            <tr key={idx} className="border">
              <td className="border px-2">{row.driver}</td>
              <td className="border px-2">{row.load}</td>
              <td className="border px-2">{row.puLocation}</td>
              <td className="border px-2">{row.puDate}</td>
              <td className="border px-2">{row.puTime}</td>
              <td className="border px-2">{row.delLocation}</td>
              <td className="border px-2">{row.delDate}</td>
              <td className="border px-2">{row.delTime}</td>
              <td className="border px-2">{row.miles}</td>
              <td className="border px-2">{row.rate}</td>
              <td className="border px-2">
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-red-600 hover:underline"
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
