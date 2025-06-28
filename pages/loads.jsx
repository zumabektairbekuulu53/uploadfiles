import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterDriver, setFilterDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);
      setFilteredData(parsed);
    }
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);

    const formatted = json.map((row) => ({
      driver: row["Driver Name"] || "",
      loadId: row["Load ID"] || "",
      puLocation: row["Stop 1"] || "",
      puDate: excelDateToString(row["Stop 1 Actual Arrival Date"]),
      puTime: excelTimeToString(row["Stop 1 Actual Arrival Time"]),
      delLocation: row["Stop 2"] || "",
      delDate: excelDateToString(row["Stop 2 Actual Arrival Date"]),
      delTime: excelTimeToString(row["Stop 2 Actual Arrival Time"]),
      miles: row["Estimated Cost"] || 0,
      rate: row["Estimated Cost"] || 0,
    }));

    setData(formatted);
    setFilteredData(formatted);
  };

  const saveData = () => {
    localStorage.setItem("loads", JSON.stringify(data));
    alert("Data saved!");
  };

  const excelDateToString = (excelDate) => {
    if (!excelDate || isNaN(excelDate)) return "—";
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toLocaleDateString("en-US");
  };

  const excelTimeToString = (excelTime) => {
    if (!excelTime || isNaN(excelTime)) return "—";
    const seconds = Math.round(86400 * excelTime);
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  const handleFilter = () => {
    const filtered = data.filter((row) => {
      const dateMatch = filterDate ? row.puDate.includes(filterDate) : true;
      const driverMatch = filterDriver ? row.driver.toLowerCase().includes(filterDriver.toLowerCase()) : true;
      return dateMatch && driverMatch;
    });
    setFilteredData(filtered);
  };

  const handleDelete = (index) => {
    const updated = [...data];
    updated.splice(index, 1);
    setData(updated);
    setFilteredData(updated);
    localStorage.setItem("loads", JSON.stringify(updated));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      <div className="flex gap-2 my-2">
        <button onClick={saveData}>Save</button>
        <input
          placeholder="Filter by PU Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <input
          placeholder="Filter by Driver"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <table border={1} cellPadding={6} className="text-sm">
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
          {filteredData.map((row, i) => (
            <tr key={i}>
              <td>{row.driver}</td>
              <td>{row.loadId}</td>
              <td>{row.puLocation}</td>
              <td>{row.puDate}</td>
              <td>{row.puTime}</td>
              <td>{row.delLocation}</td>
              <td>{row.delDate}</td>
              <td>{row.delTime}</td>
              <td>{row.miles}</td>
              <td>{row.rate}</td>
              <td>
                <button onClick={() => handleDelete(i)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
