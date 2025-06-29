import { useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";

export default function UploadPage() {
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const router = useRouter();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    setSuccess(false);
    setError("");
    setPreview([]);
    setFileLoaded(false);
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const formatted = json.map((row) => {
        const puDateRaw = row["Stop 1  Actual Arrival Date"];
        const puTimeRaw = row["Stop 1  Actual Arrival Time"];
        const delDateRaw = row["Stop 2  Actual Arrival Date"];
        const delTimeRaw = row["Stop 2  Actual Arrival Time"];
        const puDateObj = puDateRaw ? new Date(Math.round((puDateRaw - 25569) * 86400 * 1000)) : null;
        const delDateObj = delDateRaw ? new Date(Math.round((delDateRaw - 25569) * 86400 * 1000)) : null;

        const puDate = puDateObj ? puDateObj.toISOString().split("T")[0] : "";
        const puTime =
          puTimeRaw && !isNaN(new Date(`1970-01-01T${puTimeRaw}`).getTime())
            ? new Date(`1970-01-01T${puTimeRaw}`).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "";
        const delDate = delDateObj ? delDateObj.toISOString().split("T")[0] : "";
        const delTime =
          delTimeRaw && !isNaN(new Date(`1970-01-01T${delTimeRaw}`).getTime())
            ? new Date(`1970-01-01T${delTimeRaw}`).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "";

        const miles = row["Stop 1"] && row["Stop 2"] && puTimeRaw && delTimeRaw ? Math.round(row["Estimate Distance"] || 0) : 0;

        return {
          driver: row["Driver Name"] || "",
          loadId: row["Load ID"] || "",
          puLocation: row["Stop 1"] || "",
          puDate,
          puTime,
          delLocation: row["Stop 2"] || "",
          delDate,
          delTime,
          miles,
          rate: row["Estimated Cost"] || 0,
        };
      });

      setPreview(formatted);
      setFileLoaded(true);
    } catch (err) {
      setError("Failed to parse the file.");
    }
  };

  const handleSave = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("loads") || "[]");
      const existingIds = new Set(existing.map((l) => l.loadId));
      const duplicates = preview.filter((l) => existingIds.has(l.loadId));

      if (duplicates.length > 0) {
        setError("Error: One or more Load # already exist.");
        return;
      }

      const updated = [...existing, ...preview];
      localStorage.setItem("loads", JSON.stringify(updated));
      setSuccess(true);
      setError("");
      setPreview([]);
      setFileLoaded(false);
    } catch {
      setError("Unexpected error during save.");
    }
  };

  const handleChange = (index, key, value) => {
    const updated = [...preview];
    updated[index][key] = value;
    setPreview(updated);
  };

  const handleDeleteRow = (index) => {
    const updated = [...preview];
    updated.splice(index, 1);
    setPreview(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Load Report</h1>
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFile} />

      {fileLoaded && (
        <button onClick={handleSave} className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">
          Save
        </button>
      )}

      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">Report successfully saved</div>}

      {preview.length > 0 && (
        <table className="w-full mt-6 text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">Driver</th>
              <th className="border p-1">Load #</th>
              <th className="border p-1">PU Location</th>
              <th className="border p-1">PU Date</th>
              <th className="border p-1">PU Time</th>
              <th className="border p-1">Del Location</th>
              <th className="border p-1">Del Date</th>
              <th className="border p-1">Del Time</th>
              <th className="border p-1">Miles</th>
              <th className="border p-1">Rate ($)</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border">
                {[
                  "driver", "loadId", "puLocation", "puDate", "puTime",
                  "delLocation", "delDate", "delTime", "miles", "rate"
                ].map((key) => (
                  <td key={key} className="border p-1">
                    <input
                      className="w-full border px-1"
                      value={row[key]}
                      onChange={(e) => handleChange(i, key, e.target.value)}
                    />
                  </td>
                ))}
                <td className="border p-1 text-center">
                  <button
                    onClick={() => handleDeleteRow(i)}
                    className="text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}