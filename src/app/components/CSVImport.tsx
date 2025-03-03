import { useState, ChangeEvent } from 'react';
import Papa from 'papaparse';
import { CSVData } from '../types';

interface CSVImportProps {
  onImport: (data: CSVData[]) => void;
}

export default function CSVImport({ onImport }: CSVImportProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        // Process the parsed data
        const parsedData = results.data as CSVData[];
        
        // Convert empty string parentIds to null
        const processedData = parsedData.map(item => ({
          ...item,
          parentId: item.parentId === '' ? null : item.parentId
        }));
        
        onImport(processedData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full mb-6">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center">
          <svg 
            className="w-10 h-10 text-gray-400 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            CSV file with columns: id, name, title, department, parentId, imageUrl
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Note: Nodes without parents and without children will be hidden.
          </p>
        </div>
        <input 
          id="file-input"
          type="file" 
          accept=".csv"
          className="hidden" 
          onChange={handleChange}
        />
      </div>
    </div>
  );
} 