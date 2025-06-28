import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) {
      const parsed = JSON.parse(saved);
      setLoads(parsed);
      setFiltered(parsed);
    }
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const mapped = json.map((row) => {
      const parseDateTime = (excelDate) => {
        if (!excelDate && excelDate !== 0) return { date: "", time: "" };
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const fullDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
        const date = fullDate.toISOString().split("T")[0];
        const time = fullDate.toTimeString().split(" ")[0].slice(0, 5);
        return { date, time };
      };

      const pu = parseDateTime(row["Stop 1  Actual Arrival Time"]);
      const del = parseDateTime(row["Stop 2  Actual Arrival Time"]);

      return {
        driver: row["Driver Name"] || "",
        loadId: row["Load ID"] || "",
        puLocation: row["Stop 1"] || "",
        puDate: pu.date,
        puTime: pu.time,
        delLocation: row["Stop 2"] || "",
        delDate: del.date,
        delTime: del.time,
        miles: row["Distance in Miles"] || 0,
        rate: row["Rate ($)"] || 0,
      };
    });

    setLoads(mapped);
    setFiltered(mapped);
  };

  const handleSave = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
    alert("Saved");
  };

  const applyFilters = () => {
    const result = loads.filter((load) => {
      const matchDate = filterDate ? load.puDate === filterDate : true;
      const matchDriver = filterDriver ? load.driver.toLowerCase().includes(filterDriver.toLowerCase()) : true;
      return matchDate && matchDriver;
    });
    setFiltered(result);
  };

  const handleDelete = (index) => {
    const updated = filtered.filter((_, i) => i !== index);
    setFiltered(updated);
    setLoads(loads.filter((_, i) => loads.indexOf(filtered[index]) !== i));
    localStorage.setItem("loads", JSON.stringify(loads.filter((_, i) => loads.indexOf(filtered[index]) !== i)));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" onChange={handleFile} className="mb-2" />
      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleSave}>Save</button>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
        />
        <button onClick={applyFilters}>Filter</button>
      </div>
      <table className="table-auto border-collapse border w-full">
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
          {filtered.map((load, index) => (
            <tr key={index}>
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
                <button onClick={() => handleDelete(index)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
