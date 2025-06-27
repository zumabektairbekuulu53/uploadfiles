import dynamic from "next/dynamic";
const ExcelUploadTable = dynamic(() => import("../components/ExcelUploadTable"), { ssr: false });

export default function Home() {
  return <ExcelUploadTable />;
}