import { useState, useEffect } from "react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("drivers");
    if (saved) setDrivers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("drivers", JSON.stringify(drivers));
  }, [drivers]);

  const addDriver = () => {
    if (firstName.trim() && lastName.trim()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      setDrivers([...drivers, fullName]);
      setFirstName("");
      setLastName("");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Drivers</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={addDriver}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
      <ul className="list-disc pl-6">
        {drivers.map((driver, index) => (
          <li key={index}>{driver}</li>
        ))}
      </ul>
    </div>
  );
}
