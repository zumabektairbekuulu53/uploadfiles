import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [puDateFilter, setPuDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setLoads(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(loads));
  }, [loads]);

  const parseExcelDate = (excelDate) => {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const days = Math.floor(excelDate);
    const millisecondsPerDay = 86400000;
    const date = new Date(epoch.getTime() + days * millisecondsPerDay);
    return date;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const newLoads = json.map((row) => {
      const puDate = parseExcelDate(row["Stop 1 Actual Arrival Date"]);
      const delDate = parseExcelDate(row["Stop 2 Actual Arrival Date"]);

      const puTimeFloat = row["Stop 1 Actual Arrival Time"];
      const delTimeFloat = row["Stop 2 Actual Arrival Time"];

      const puTime = typeof puTimeFloat === "number"
        ? new Date(puDate.getTime() + puTimeFloat * 24 * 60 * 60 * 1000)
        : null;

      const delTime = typeof delTimeFloat === "number"
        ? new Date(delDate.getTime() + delTimeFloat * 24 * 60 * 60 * 1000)
        : null;

      return {
        driver: row["Driver Name"] || "",
        loadId: row["Load #"] || "",
        puLocation: row["PU Location"] || "",
        puDate: puDate.toISOString().split("T")[0],
        puTime: puTime ? puTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        delLocation: row["Del Location"] || "",
        delDate: delDate.toISOString().split("T")[0],
        delTime: delTime ? delTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        miles: row["Estimated Distance"] || 0,
        rate: row["Rate ($)"] || 0,
      };
    });

    setLoads(newLoads);
  };

  const handleSave = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
  };

  const handleDelete = (index) => {
    const updated = [...loads];
    updated.splice(index, 1);
    setLoads(updated);
  };

  const filtered = loads.filter((l) => {
    const matchDate = puDateFilter ? l.puDate === puDateFilter : true;
    const matchDriver = driverFilter ? l.driver.toLowerCase().includes(driverFilter.toLowerCase()) : true;
    return matchDate && matchDriver;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="mb-2" />
      <button onClick={handleSave} className="bg-blue-500 text-white px-3 py-1 ml-2 rounded">Save</button>
      <input type="date" value={puDateFilter} onChange={(e) => setPuDateFilter(e.target.value)} className="border px-2 py-1 ml-2" />
      <input type="text" placeholder="Filter by Driver" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="border px-2 py-1 ml-2" />
      <table className="table-auto border w-full mt-4 text-sm">
        <thead>
          <tr className="bg-gray-200">
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
          {filtered.map((load, index) => (
            <tr key={index} className="border-b">
              <td>{load.driver}</td>
              <td>{load.loadId}</td>
              <td>{load.puLocation}</td>
              <td>{load.puDate}</td>
              <td>{load.puTime}</td>
              <td>{load.delLocation}</td>
              <td>{load.delDate}</td>
              <td>{load.delTime}</td>
              <td>{load.miles}</td>
              <td>{load.rate}</td>
              <td>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-800"
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
