import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [puDateFilter, setPuDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("loads");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setFilteredData(parsed);
    }
  }, []);

  useEffect(() => {
    let filtered = data;
    if (puDateFilter) {
      filtered = filtered.filter(row => row.puDate === puDateFilter);
    }
    if (driverFilter) {
      filtered = filtered.filter(row =>
        row.driver.toLowerCase().includes(driverFilter.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }, [puDateFilter, driverFilter, data]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const formatted = raw.map((row) => {
      const formatDate = (excelDate) => {
        if (!excelDate || isNaN(excelDate)) return "—";
        const date = XLSX.SSF.parse_date_code(excelDate);
        return `${date.m.toString().padStart(2, "0")}/${date.d.toString().padStart(2, "0")}/${date.y}`;
      };

      return {
        driver: row["Driver Name"] || "—",
        load: row["Load ID"] || "—",
        puLocation: row["Stop 1"] || "—",
        puDate: formatDate(row["Stop 1  Actual Arrival Date"]),
        puTime: row["Stop 1  Actual Arrival Time"] || "—",
        delLocation: row["Stop 2"] || "—",
        delDate: formatDate(row["Stop 2  Actual Arrival Date"]),
        delTime: row["Stop 2  Actual Arrival Time"] || "—",
        miles: row["Estimated Cost"] || "—",
        rate: row["Estimated Cost"] || "—",
      };
    });

    setData(formatted);
    setFilteredData(formatted);
  };

  const saveData = () => {
    localStorage.setItem("loads", JSON.stringify(data));
    alert("Data saved!");
  };

  const deleteRow = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    setFilteredData(newData);
    localStorage.setItem("loads", JSON.stringify(newData));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="mb-2" />
      <div className="flex gap-2 my-2">
        <button onClick={saveData} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <input
          type="text"
          placeholder="Filter by PU Date"
          value={puDateFilter}
          onChange={(e) => setPuDateFilter(e.target.value)}
          className="border p-1"
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="border p-1"
        />
      </div>

      <table className="w-full text-sm border mt-4">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Load #</th>
            <th>PU Location</th>
            <th>PU Date</th>
            <th>PU Time</th>
            <th>Del Location</th>
            <th>Del Date</th>
            <th>Del Time</th>
            <th>Miles</th>
            <th>Rate ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.driver}</td>
              <td>{row.load}</td>
              <td>{row.puLocation}</td>
              <td>{row.puDate}</td>
              <td>{row.puTime}</td>
              <td>{row.delLocation}</td>
              <td>{row.delDate}</td>
              <td>{row.delTime}</td>
              <td>{row.miles}</td>
              <td>{row.rate}</td>
              <td><button onClick={() => deleteRow(idx)} className="text-red-600">✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
