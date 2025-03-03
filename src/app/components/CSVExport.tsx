import Papa from 'papaparse';
import { CSVData } from '../types';

interface CSVExportProps {
  data: CSVData[];
}

export default function CSVExport({ data }: CSVExportProps) {
  const handleExport = () => {
    // Convert data to CSV
    const csv = Papa.unparse(data);
    
    // Create a Blob with the CSV data
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'org-chart.csv');
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Click the link to trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
      disabled={data.length === 0}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export to CSV
    </button>
  );
} 