import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploadTable() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("loads");
  const [drivers, setDrivers] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const excelDateToDate = (serial) => {
    if (!serial) return "";
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split("T")[0];
  };

  const excelTimeToTime = (value) => {
    if (!value && value !== 0) return "";
    const totalSeconds = Math.floor(86400 * value);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json(ws);

      const cleaned = raw.map((row) => {
        const rate = parseFloat(row["Estimated Cost"] || 0) * 2.5;
        return {
          driver: row["Driver Name"] || "",
          load: row["Load ID"] || "",
          pu_location: row["Stop 1"] || "",
          pu_date: excelDateToDate(row["Stop 1 Actual Departure Date"]),
          pu_time: excelTimeToTime(row["Stop 1  Actual Arrival Time"]),
          del_location: row["Stop 2"] || "",
          del_date: excelDateToDate(row["Stop 2  Actual Arrival Date"]),
          del_time: excelTimeToTime(row["Stop 2  Actual Arrival Time"]),
          miles: row["Estimated Cost"] || 0,
          rate: rate.toFixed(2),
        };
      });

      setData(cleaned);
    };
    reader.readAsBinaryString(file);
  };

  const addDriver = () => {
    if (firstName && lastName) {
      setDrivers([...drivers, `${firstName} ${lastName}`]);
      setFirstName("");
      setLastName("");
    }
  };

  return (
    <div className="flex">
      <div className="w-48 h-screen bg-gray-100 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Menu</h2>
        <ul className="space-y-2">
          <li className="hover:underline cursor-pointer" onClick={() => setActiveTab("loads")}>Loads</li>
          <li className="hover:underline cursor-pointer" onClick={() => setActiveTab("drivers")}>Drivers</li>
          <li className="hover:underline cursor-pointer" onClick={() => setActiveTab("trucks")}>Trucks</li>
          <li className="hover:underline cursor-pointer" onClick={() => setActiveTab("payroll")}>Payroll</li>
        </ul>
      </div>

      <div className="flex-1 p-6">
        {activeTab === "loads" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mb-4" />

            {data.length > 0 && (
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border p-2">Driver</th>
                    <th className="border p-2">Load #</th>
                    <th className="border p-2">PU Location</th>
                    <th className="border p-2">PU Date</th>
                    <th className="border p-2">PU Time</th>
                    <th className="border p-2">Del Location</th>
                    <th className="border p-2">Del Date</th>
                    <th className="border p-2">Del Time</th>
                    <th className="border p-2">Miles</th>
                    <th className="border p-2">Rate ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-2 py-1">{row.driver}</td>
                      <td className="border px-2 py-1">{row.load}</td>
                      <td className="border px-2 py-1">{row.pu_location}</td>
                      <td className="border px-2 py-1">{row.pu_date}</td>
                      <td className="border px-2 py-1">{row.pu_time}</td>
                      <td className="border px-2 py-1">{row.del_location}</td>
                      <td className="border px-2 py-1">{row.del_date}</td>
                      <td className="border px-2 py-1">{row.del_time}</td>
                      <td className="border px-2 py-1">{row.miles}</td>
                      <td className="border px-2 py-1">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === "drivers" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Driver List</h1>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border p-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border p-2"
              />
              <button onClick={addDriver} className="bg-blue-500 text-white px-4 py-2 rounded">Add Driver</button>
            </div>
            <ul className="list-disc pl-6">
              {drivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
