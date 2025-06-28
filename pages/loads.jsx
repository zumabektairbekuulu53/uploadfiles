import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [data, setData] = useState([]);
  const [puDateFilter, setPuDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(data));
  }, [data]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws, { raw: false });

      const formatted = parsedData.map((row) => {
        const parseExcelDate = (excelDate) => {
          const jsDate = XLSX.SSF.parse_date_code(parseFloat(excelDate));
          if (!jsDate) return { date: "", time: "" };
          const date = new Date(jsDate.y, jsDate.m - 1, jsDate.d);
          const time = `${String(jsDate.HH).padStart(2, "0")}:${String(jsDate.MM).padStart(2, "0")}`;
          return { date: date.toISOString().split("T")[0], time };
        };

        const pu = parseExcelDate(row["Stop 1 Actual Arrival Date"]);
        const del = parseExcelDate(row["Stop 2 Actual Arrival Date"]);

        return {
          driver: row["Driver Name"] || "",
          load: row["Load ID"] || "",
          puLocation: row["Stop 1"] || "",
          puDate: pu.date,
          puTime: pu.time,
          delLocation: row["Stop 2"] || "",
          delDate: del.date,
          delTime: del.time,
          miles: parseFloat(row["Estimated Cost"]) || 0,
          rate: parseFloat(row["Estimated Cost"]) || 0,
        };
      });

      setData(formatted);
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    localStorage.setItem("loads", JSON.stringify(data));
    alert("Data saved");
  };

  const handleDelete = (index) => {
    const copy = [...data];
    copy.splice(index, 1);
    setData(copy);
  };

  const filteredData = data.filter(
    (row) =>
      (!puDateFilter || row.puDate === puDateFilter) &&
      (!driverFilter || row.driver.toLowerCase().includes(driverFilter.toLowerCase()))
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="mb-4" />
      <button onClick={handleSave}>Save</button>
      <input
        type="date"
        value={puDateFilter}
        onChange={(e) => setPuDateFilter(e.target.value)}
        placeholder="Filter by PU Date"
      />
      <input
        type="text"
        value={driverFilter}
        onChange={(e) => setDriverFilter(e.target.value)}
        placeholder="Filter by Driver"
      />

      <table className="table-auto w-full mt-4 border">
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
              <td>{row.load}</td>
              <td>{row.puLocation}</td>
              <td>{row.puDate}</td>
              <td>{row.puTime}</td>
              <td>{row.delLocation}</td>
              <td>{row.delDate}</td>
              <td>{row.delTime}</td>
              <td>{row.miles}</td>
              <td>{row.rate}</td>
              <td>
                <button onClick={() => handleDelete(i)}>✘</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
