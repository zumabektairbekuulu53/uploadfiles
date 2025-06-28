import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setLoads(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(loads));
  }, [loads]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const formatted = json.map((row) => {
        const formatExcelDate = (excelDate) => {
          const jsDate = XLSX.SSF.parse_date_code(excelDate);
          if (!jsDate) return { date: "", time: "" };

          const pad = (n) => String(n).padStart(2, '0');
          const date = `${jsDate.y}-${pad(jsDate.m)}-${pad(jsDate.d)}`;
          const time = `${pad(jsDate.H)}:${pad(jsDate.M)}`;
          return { date, time };
        };

        const pu = formatExcelDate(row["Stop 1  Actual Arrival Time"]);
        const del = formatExcelDate(row["Stop 2  Actual Arrival Time"]);

        return {
          driver: row["Driver Name"],
          loadId: row["Load ID"],
          puLocation: row["Stop 1"],
          puDate: pu.date,
          puTime: pu.time,
          delLocation: row["Stop 2"],
          delDate: del.date,
          delTime: del.time,
          miles: parseFloat(row["Distance in Miles"] || 0),
          rate: parseFloat(row["Total Pay"] || 0),
        };
      });

      setLoads(formatted);
    };

    reader.readAsArrayBuffer(file);
  };

  const saveToLocal = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
  };

  const deleteRow = (index) => {
    const updated = [...loads];
    updated.splice(index, 1);
    setLoads(updated);
  };

  const filteredLoads = loads.filter((load) => {
    return (
      (!filterDate || load.puDate === filterDate) &&
      (!filterDriver || load.driver.toLowerCase().includes(filterDriver.toLowerCase()))
    );
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" onChange={handleFile} className="mb-2" />
      <button onClick={saveToLocal} className="ml-2 px-3 py-1 border rounded">Save</button>
      <div className="my-2">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-2 py-1 mr-2"
          placeholder="Filter by PU Date"
        />
        <input
          type="text"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
          className="border px-2 py-1"
          placeholder="Filter by Driver"
        />
      </div>
      <table className="w-full table-auto border">
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
          {filteredLoads.map((load, idx) => (
            <tr key={idx}>
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
                <button onClick={() => deleteRow(idx)} className="text-red-600 font-bold">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
