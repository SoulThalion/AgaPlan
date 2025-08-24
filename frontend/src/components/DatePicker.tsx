import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  required = false,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value ? new Date(value) : new Date()));
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentDate(new Date(value));
    }
  }, [value]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  };

  const getWeekDays = (): string[] => {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const changeYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(prev.getFullYear() - 1);
      } else {
        newDate.setFullYear(prev.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Días del mes anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-gray-400 dark:text-gray-600" />);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentDate.getMonth() && 
                        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === currentDate.getMonth() && 
                      new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`p-2 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : isToday
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const renderMonths = () => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const isSelected = selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === currentDate.getFullYear();
      
      months.push(
        <button
          key={month}
          onClick={() => {
            setCurrentDate(prev => new Date(prev.getFullYear(), month, 1));
            setViewMode('days');
          }}
          className={`p-3 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {getMonthName(month)}
        </button>
      );
    }
    return months;
  };

  const renderYears = () => {
    const years = [];
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      const isSelected = selectedDate.getFullYear() === year;
      
      years.push(
        <button
          key={year}
          onClick={() => {
            setCurrentDate(prev => new Date(year, prev.getMonth(), 1));
            setViewMode('days');
          }}
          className={`p-3 rounded-md transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {year}
        </button>
      );
    }
    return years;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {value ? formatDate(selectedDate) : placeholder}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => changeMonth('prev')}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('months')}
                  className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  {getMonthName(currentDate.getMonth())}
                </button>
                <button
                  onClick={() => setViewMode('years')}
                  className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  {currentDate.getFullYear()}
                </button>
              </div>
              
              <button
                onClick={() => changeMonth('next')}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {viewMode === 'days' && (
              <>
                {/* Week days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {getWeekDays().map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderDays()}
                </div>
              </>
            )}
            
            {viewMode === 'months' && (
              <div className="grid grid-cols-3 gap-2">
                {renderMonths()}
              </div>
            )}
            
            {viewMode === 'years' && (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {renderYears()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
