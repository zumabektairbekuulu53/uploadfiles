import { useState, useEffect } from "react";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [truckNumber, setTruckNumber] = useState("");
  const [driverName, setDriverName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("trucks");
    if (saved) setTrucks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("trucks", JSON.stringify(trucks));
  }, [trucks]);

  const addTruck = () => {
    if (truckNumber.trim() && driverName.trim()) {
      setTrucks([...trucks, { truck: truckNumber.trim(), driver: driverName.trim() }]);
      setTruckNumber("");
      setDriverName("");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trucks</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Truck Number"
          value={truckNumber}
          onChange={(e) => setTruckNumber(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="text"
          placeholder="Assigned Driver"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={addTruck}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
      <ul className="list-disc pl-6">
        {trucks.map((truck, index) => (
          <li key={index}>{truck.truck} — Driver: {truck.driver}</li>
        ))}
      </ul>
    </div>
  );
}
