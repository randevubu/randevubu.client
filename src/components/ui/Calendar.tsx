'use client';

import { useState } from 'react';

interface CalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: string[];
  className?: string;
}

export default function Calendar({ 
  selectedDate, 
  onDateSelect, 
  minDate = new Date(), 
  maxDate,
  disabledDates = [],
  className = '' 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const today = new Date();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Calculate max date (14 days from today if not specified)
  const defaultMaxDate = new Date();
  defaultMaxDate.setDate(defaultMaxDate.getDate() + 14);
  const effectiveMaxDate = maxDate || defaultMaxDate;

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, etc.
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const formatDateString = (date: Date) => {
    // Format date as YYYY-MM-DD in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateDisabled = (date: Date) => {
    // Allow today's date to be selectable by comparing only the date part (not time)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    const dateString = formatDateString(date);
    
    return dateOnly < minDateOnly || dateOnly > effectiveMaxDate || disabledDates.includes(dateString);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate === formatDateString(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const canGoToPreviousMonth = () => {
    const prevMonth = new Date(currentYear, currentMonthIndex - 1, 1);
    const lastDayOfPrevMonth = new Date(currentYear, currentMonthIndex, 0);
    return lastDayOfPrevMonth >= minDate;
  };

  const canGoToNextMonth = () => {
    const nextMonth = new Date(currentYear, currentMonthIndex + 1, 1);
    return nextMonth <= effectiveMaxDate;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonthIndex, day);
    if (!isDateDisabled(date)) {
      onDateSelect(formatDateString(date));
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonthIndex);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 w-full flex items-center justify-center"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonthIndex, day);
      const disabled = isDateDisabled(date);
      const selected = isSelected(date);
      const todayDate = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={disabled}
          className={`
            h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${disabled 
              ? 'text-[var(--theme-foregroundMuted)] cursor-not-allowed opacity-40' 
              : 'hover:bg-[var(--theme-primary)] hover:text-[var(--theme-primaryForeground)] hover:scale-105'
            }
            ${selected 
              ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] scale-105 shadow-lg' 
              : 'text-[var(--theme-foreground)]'
            }
            ${todayDate && !selected 
              ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300 border-2 border-blue-400' 
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`bg-[var(--theme-card)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)] ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoToPreviousMonth()}
          className="p-2 rounded-lg hover:bg-[var(--theme-background)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-[var(--theme-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-bold text-[var(--theme-cardForeground)]">
          {monthNames[currentMonthIndex]} {currentYear}
        </h3>
        
        <button
          onClick={goToNextMonth}
          disabled={!canGoToNextMonth()}
          className="p-2 rounded-lg hover:bg-[var(--theme-background)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-[var(--theme-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="h-12 flex items-center justify-center">
            <span className="text-sm font-semibold text-[var(--theme-foregroundSecondary)]">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 ring-2 ring-blue-300 border border-blue-400"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Bugün</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[var(--theme-primary)]"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Seçili</span>
          </div>
        </div>
      </div>
    </div>
  );
}