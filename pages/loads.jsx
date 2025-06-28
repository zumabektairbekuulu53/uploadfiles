import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-2 gap-6">
        <Link href="/loads">
          <div className="bg-blue-100 hover:bg-blue-200 p-6 rounded shadow cursor-pointer text-center">
            <h2 className="text-xl font-bold">Loads</h2>
          </div>
        </Link>
        <Link href="/drivers">
          <div className="bg-green-100 hover:bg-green-200 p-6 rounded shadow cursor-pointer text-center">
            <h2 className="text-xl font-bold">Drivers</h2>
          </div>
        </Link>
        <Link href="/trucks">
          <div className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded shadow cursor-pointer text-center">
            <h2 className="text-xl font-bold">Trucks</h2>
          </div>
        </Link>
        <Link href="/payroll">
          <div className="bg-purple-100 hover:bg-purple-200 p-6 rounded shadow cursor-pointer text-center">
            <h2 className="text-xl font-bold">Payroll</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}
