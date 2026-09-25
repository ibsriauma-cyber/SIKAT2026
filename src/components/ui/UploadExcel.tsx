import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';

interface UploadExcelProps {
  onUpload: (data: any[]) => void;
  label?: string;
  className?: string;
}

export function UploadExcel({ onUpload, label = "Upload Excel", className = "" }: UploadExcelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        onUpload(parsedData);
      } catch (error) {
        console.error("Error reading excel file", error);
        alert("Gagal membaca file Excel. Pastikan format file sesuai.");
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center gap-2 ${className}`}
      >
        <Upload className="w-4 h-4" /> {label}
      </button>
    </div>
  );
}
