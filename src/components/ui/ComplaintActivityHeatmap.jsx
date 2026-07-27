import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './Card';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to get color based on complaint count - Low (1-3), Medium (4-6), High (7-9), Very High (9+)
const getHeatmapColor = (count) => {
  if (count === 0) return 'bg-surface-container-low border-outline/10';
  if (count <= 3) return 'bg-primary/20 border-primary/30'; // Low
  if (count <= 6) return 'bg-primary/40 border-primary/50'; // Medium
  if (count <= 9) return 'bg-primary/65 border-primary/75'; // High
  return 'bg-primary/90 border-primary'; // Very High
};

export default function ComplaintActivityHeatmap({ complaints = [] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const minYear = currentYear - 1;
  const minMonth = currentMonth;
  
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  // Calculate complaint counts by date
  const complaintsByDate = useMemo(() => {
    const map = {};
    complaints.forEach(complaint => {
      const date = formatDateKey(complaint.created_at);
      map[date] = (map[date] || 0) + 1;
    });
    return map;
  }, [complaints]);

  // Get all dates for the current month view
  const monthStart = new Date(displayYear, displayMonth, 1);
  const monthEnd = new Date(displayYear, displayMonth + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay()); // Start from Sunday

  const calendarDays = [];
  const currentDate = new Date(startDate);
  
  while (calendarDays.length < 42) { // 6 weeks * 7 days
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Navigation handlers with date limits
  const goToPreviousMonth = () => {
    if (displayMonth === minMonth && displayYear === minYear) {
      return; // Don't go back beyond one year
    }
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === currentMonth && displayYear === currentYear) {
      return; // Don't go forward beyond current month
    }
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const goToToday = () => {
    setDisplayMonth(currentMonth);
    setDisplayYear(currentYear);
  };

  const canGoBack = !(displayMonth === minMonth && displayYear === minYear);
  const canGoForward = !(displayMonth === currentMonth && displayYear === currentYear);

  return (
    <Card className="p-8 border border-outline/10 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-on-surface mb-1">
            Complaint Activity <span className="text-primary">Heatmap</span>
          </h3>
          <p className="text-sm font-medium text-on-surface-variant">
            Visual intensity of grievance reports throughout the year
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-8 p-4 bg-surface-container-low rounded-xl border border-outline/10">
        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Intensity Scale</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-surface-container-low border border-outline/10" />
            <span className="text-xs text-on-surface-variant">No data (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
            <span className="text-xs text-on-surface-variant">Low (1-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/40 border border-primary/50" />
            <span className="text-xs text-on-surface-variant">Medium (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/65 border border-primary/75" />
            <span className="text-xs text-on-surface-variant">High (7-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/90 border border-primary" />
            <span className="text-xs text-on-surface-variant">Very High (9+)</span>
          </div>
        </div>
      </div>

      {/* Navigation and Month Display */}
      <div className="flex justify-between items-center mb-8 p-4 bg-surface-container-high rounded-xl border border-outline/10">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoBack}
          className={`p-2 rounded-lg transition-colors ${canGoBack ? 'hover:bg-primary/10 text-on-surface-variant hover:text-primary cursor-pointer' : 'text-on-surface-variant/30 cursor-not-allowed'}`}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div className="text-center flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Month & Year</p>
          <p className="text-xl font-black text-on-surface">
            {monthLabels[displayMonth]} {displayYear}
          </p>
        </div>

        <button
          onClick={goToNextMonth}
          disabled={!canGoForward}
          className={`p-2 rounded-lg transition-colors ${canGoForward ? 'hover:bg-primary/10 text-on-surface-variant hover:text-primary cursor-pointer' : 'text-on-surface-variant/30 cursor-not-allowed'}`}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Today Button */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={goToToday}
          className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all"
        >
          Go to Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayLabels.map(day => (
              <div key={day} className="aspect-square flex items-center justify-center">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{day}</p>
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, idx) => {
              const dateKey = formatDateKey(date);
              const count = complaintsByDate[dateKey] || 0;
              const isCurrentMonth = date.getMonth() === displayMonth;
              
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 cursor-help hover:ring-2 hover:ring-primary/50 ${
                    getHeatmapColor(count)
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} complaint${count !== 1 ? 's' : ''}`}
                >
                  <p className="text-[10px] font-black text-on-surface/80">{date.getDate()}</p>
                  {count > 0 && (
                    <p className="text-[8px] font-bold text-primary">{count}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total Days</p>
          <p className="text-2xl font-black text-on-surface">{Object.keys(complaintsByDate).filter(date => complaintsByDate[date] > 0).length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total Complaints</p>
          <p className="text-2xl font-black text-on-surface">{complaints.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Peak Day</p>
          <p className="text-2xl font-black text-primary">{Math.max(...Object.values(complaintsByDate), 0)}</p>
        </div>
      </div>
    </Card>
  );
}
