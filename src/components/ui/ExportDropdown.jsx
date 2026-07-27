import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { Download, FileText, Table } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

export default function ExportDropdown({ data, columns, filename, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleExportCSV = () => {
    exportToCSV(data, columns, filename);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    exportToPDF(data, columns, filename, title);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(!isOpen)}
        className="font-black uppercase text-xs tracking-widest gap-2 shadow-none border border-outline/10 h-14"
      >
        <Download size={18} strokeWidth={2.5} />
        Export Base
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-high border border-outline/10 shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2" role="menu">
            <button
              onClick={handleExportCSV}
              disabled={!data || data.length === 0}
              className="group flex w-full items-center gap-3 px-6 py-4 text-xs font-black tracking-widest uppercase text-on-surface hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Table size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              Download as CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!data || data.length === 0}
              className="group flex w-full items-center gap-3 px-6 py-4 text-xs font-black tracking-widest uppercase text-on-surface hover:bg-tertiary/10 hover:text-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-t border-outline/5"
            >
              <FileText size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
