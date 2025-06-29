import { useState } from "react";
import { useRouter } from "next/router";

export default function AddDriver() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleSave = () => {
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const newDriver = { firstName, lastName };
    drivers.push(newDriver);
    localStorage.setItem("drivers", JSON.stringify(drivers));
    router.push("/drivers");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Driver</h1>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border px-2 py-1 mr-2"
      />
      <button onClick={handleSave} className="px-4 py-1 bg-blue-500 text-white rounded">
        Save
      </button>
    </div>
  );
}