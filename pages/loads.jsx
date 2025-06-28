import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [fileName, setFileName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setLoads(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(loads));
  }, [loads]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const parsed = json.map((row) => {
      const puRaw = row["PU Date/TIme"] || row["PU Date/Time"] || "";
      const delRaw = row["Del Date/TIme"] || row["Del Date/Time"] || "";

      const puDateTime = puRaw ? new Date((puRaw - 25569) * 86400 * 1000) : null;
      const delDateTime = delRaw ? new Date((delRaw - 25569) * 86400 * 1000) : null;

      return {
        driver: row["Driver Name"] || row["Driver"] || "",
        loadId: row["Load #"] || "",
        puLocation: row["PU Location"] || "",
        puDate: puDateTime instanceof Date && !isNaN(puDateTime) ? puDateTime.toISOString().split("T")[0] : "",
        puTime: puDateTime instanceof Date && !isNaN(puDateTime) ? puDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        delLocation: row["Del Location"] || "",
        delDate: delDateTime instanceof Date && !isNaN(delDateTime) ? delDateTime.toISOString().split("T")[0] : "",
        delTime: delDateTime instanceof Date && !isNaN(delDateTime) ? delDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        miles: row["Estimated Distance"] || 0,
        rate: row["Rate ($)"] || 0,
      };
    });

    setLoads(parsed);
  };

  const saveToLocal = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
    alert("Saved!");
  };

  const removeLoad = (index) => {
    const updated = [...loads];
    updated.splice(index, 1);
    setLoads(updated);
  };

  const filteredLoads = loads.filter((load) => {
    const matchDate = filterDate ? load.puDate === filterDate : true;
    const matchDriver = filterDriver ? load.driver.toLowerCase().includes(filterDriver.toLowerCase()) : true;
    return matchDate && matchDriver;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
      <span className="ml-2">{fileName}</span>
      <div className="my-2">
        <button onClick={saveToLocal}>Save</button>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="mx-2"
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
        />
        <button onClick={() => { setFilterDate(""); setFilterDriver(""); }}>Clear</button>
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
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
          {filteredLoads.map((load, index) => (
            <tr key={index} className="border-t">
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
                <button onClick={() => removeLoad(index)} className="text-red-500">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
