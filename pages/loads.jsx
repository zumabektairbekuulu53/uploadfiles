import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [puDateFilter, setPuDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);
      setFiltered(parsed);
    }
  }, []);

  useEffect(() => {
    let updated = [...data];
    if (puDateFilter) {
      updated = updated.filter((item) => item.puDate === puDateFilter);
    }
    if (driverFilter) {
      updated = updated.filter((item) =>
        item.driver.toLowerCase().includes(driverFilter.toLowerCase())
      );
    }
    setFiltered(updated);
  }, [puDateFilter, driverFilter, data]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const formatted = jsonData.map((row) => {
      const getExcelDate = (excelDate) => {
        const jsDate = XLSX.SSF.parse_date_code(excelDate);
        if (!jsDate) return { date: "—", time: "—" };
        const pad = (n) => n.toString().padStart(2, '0');
        return {
          date: `${jsDate.y}-${pad(jsDate.m)}-${pad(jsDate.d)}`,
          time: `${pad(jsDate.H)}:${pad(jsDate.M)}`
        };
      };

      const pu = getExcelDate(row["Stop 1 Actual Arrival Time"]);
      const del = getExcelDate(row["Stop 2 Actual Arrival Time"]);

      return {
        driver: row["Driver Name"] || "",
        load: row["Load ID"] || "",
        puLocation: row["Stop 1"] || "",
        puDate: pu.date,
        puTime: pu.time,
        delLocation: row["Stop 2"] || "",
        delDate: del.date,
        delTime: del.time,
        miles: row["Estimated Cost"] || 0,
        rate: row["Estimated Cost"] || 0,
      };
    });

    setData(formatted);
    setFiltered(formatted);
  };

  const handleSave = () => {
    localStorage.setItem("loads", JSON.stringify(data));
    alert("Data saved");
  };

  const handleDelete = (index) => {
    const updated = data.filter((_, i) => i !== index);
    setData(updated);
    setFiltered(updated);
    localStorage.setItem("loads", JSON.stringify(updated));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx" onChange={handleFile} />
      <div className="my-2">
        <button onClick={handleSave}>Save</button>
        <input
          type="text"
          placeholder="Filter by PU Date"
          value={puDateFilter}
          onChange={(e) => setPuDateFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
        />
      </div>
      <table border="1">
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
          {filtered.map((item, i) => (
            <tr key={i}>
              <td>{item.driver}</td>
              <td>{item.load}</td>
              <td>{item.puLocation}</td>
              <td>{item.puDate}</td>
              <td>{item.puTime}</td>
              <td>{item.delLocation}</td>
              <td>{item.delDate}</td>
              <td>{item.delTime}</td>
              <td>{item.miles}</td>
              <td>{item.rate}</td>
              <td>
                <button onClick={() => handleDelete(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
