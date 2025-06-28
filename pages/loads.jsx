import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("loads");
    if (saved) setLoads(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("loads", JSON.stringify(loads));
  }, [loads]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const parsed = json.map((row) => {
      const parseExcelDate = (serial) => {
        if (!serial) return null;
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
        let total_seconds = Math.floor(86400 * fractional_day);
        const seconds = total_seconds % 60;
        total_seconds -= seconds;
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;
        date_info.setHours(hours);
        date_info.setMinutes(minutes);
        return date_info;
      };

      const formatDate = (date) => {
        if (!date) return "—";
        return date.toISOString().split("T")[0];
      };

      const formatTime = (date) => {
        if (!date) return "—";
        return date.toTimeString().split(" ")[0].slice(0, 5);
      };

      const puDateObj = parseExcelDate(row["Stop 1  Actual Arrival Date"]);
      const delDateObj = parseExcelDate(row["Stop 2  Actual Arrival Date"]);

      return {
        driver: row["Driver Name"] || "",
        loadId: row["Load ID"] || "",
        puLocation: row["Stop 1"] || "",
        puDate: formatDate(puDateObj),
        puTime: formatTime(puDateObj),
        delLocation: row["Stop 2"] || "",
        delDate: formatDate(delDateObj),
        delTime: formatTime(delDateObj),
        miles: row["Estimated Distance"] || 0,
        rate: row["Estimated Cost"] || 0,
      };
    });

    setLoads(parsed);
  };

  const saveToLocal = () => {
    localStorage.setItem("loads", JSON.stringify(loads));
  };

  const deleteRow = (index) => {
    const newLoads = [...loads];
    newLoads.splice(index, 1);
    setLoads(newLoads);
  };

  const filteredLoads = loads.filter((load) => {
    const dateMatch = selectedDate ? load.puDate === selectedDate : true;
    const driverMatch = selectedDriver ? load.driver === selectedDriver : true;
    return dateMatch && driverMatch;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
      <button onClick={saveToLocal} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
        Save
      </button>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="mm/dd/yyyy"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Driver"
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
        />
        <button
          onClick={() => {
            setSelectedDate("");
            setSelectedDriver("");
          }}
        >
          Clear
        </button>
      </div>

      <table className="table-auto border-collapse w-full mt-4">
        <thead>
          <tr>
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
          {filteredLoads.map((load, index) => (
            <tr key={index}>
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
                <button onClick={() => deleteRow(index)} className="text-red-600">
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
