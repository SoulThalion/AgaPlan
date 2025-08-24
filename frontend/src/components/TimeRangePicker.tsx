import React, { useState, useRef, useEffect } from 'react';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  placeholder = "Seleccionar horario",
  required = false,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStartHour, setSelectedStartHour] = useState(0);
  const [selectedStartMinute, setSelectedStartMinute] = useState(0);
  const [selectedEndHour, setSelectedEndHour] = useState(0);
  const [selectedEndMinute, setSelectedEndMinute] = useState(0);
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
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      setSelectedStartHour(hours);
      setSelectedStartMinute(minutes);
    }
    if (endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      setSelectedEndHour(hours);
      setSelectedEndMinute(minutes);
    }
  }, [startTime, endTime]);

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const generateHourOptions = (): number[] => {
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      hours.push(hour);
    }
    return hours;
  };

  const generateMinuteOptions = (): number[] => {
    const minutes = [];
    for (let minute = 0; minute < 60; minute++) {
      minutes.push(minute);
    }
    return minutes;
  };

  const handleStartHourSelect = (hour: number) => {
    setSelectedStartHour(hour);
    const newTime = `${hour.toString().padStart(2, '0')}:${selectedStartMinute.toString().padStart(2, '0')}`;
    onStartTimeChange(newTime);
  };

  const handleStartMinuteSelect = (minute: number) => {
    setSelectedStartMinute(minute);
    const newTime = `${selectedStartHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onStartTimeChange(newTime);
  };

  const handleEndHourSelect = (hour: number) => {
    setSelectedEndHour(hour);
    const newTime = `${hour.toString().padStart(2, '0')}:${selectedEndMinute.toString().padStart(2, '0')}`;
    onEndTimeChange(newTime);
  };

  const handleEndMinuteSelect = (minute: number) => {
    setSelectedEndMinute(minute);
    const newTime = `${selectedEndHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onEndTimeChange(newTime);
  };

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

  const getDisplayText = (): string => {
    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
    return placeholder;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {getDisplayText()}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Seleccionar Horario</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Hora de Inicio */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Hora de Inicio</h4>
                <div className="flex items-center justify-center space-x-2">
                  {/* Selector de Hora */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hora</label>
                    <div className="w-14 h-24 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {hourOptions.map((hour) => {
                        const isSelected = selectedStartHour === hour;
                        return (
                          <button
                            key={hour}
                            onClick={() => handleStartHourSelect(hour)}
                            className={`w-full py-1 text-center text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            }`}
                          >
                            {hour.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="text-lg font-bold text-gray-400 dark:text-gray-500">:</div>

                  {/* Selector de Minutos */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Minutos</label>
                    <div className="w-14 h-24 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {minuteOptions.map((minute) => {
                        const isSelected = selectedStartMinute === minute;
                        return (
                          <button
                            key={minute}
                            onClick={() => handleStartMinuteSelect(minute)}
                            className={`w-full py-1 text-center text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            }`}
                          >
                            {minute.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hora de Fin */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Hora de Fin</h4>
                <div className="flex items-center justify-center space-x-2">
                  {/* Selector de Hora */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hora</label>
                    <div className="w-14 h-24 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {hourOptions.map((hour) => {
                        const isSelected = selectedEndHour === hour;
                        return (
                          <button
                            key={hour}
                            onClick={() => handleEndHourSelect(hour)}
                            className={`w-full py-1 text-center text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            }`}
                          >
                            {hour.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="text-lg font-bold text-gray-400 dark:text-gray-500">:</div>

                  {/* Selector de Minutos */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Minutos</label>
                    <div className="w-14 h-24 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {minuteOptions.map((minute) => {
                        const isSelected = selectedEndMinute === minute;
                        return (
                          <button
                            key={minute}
                            onClick={() => handleEndMinuteSelect(minute)}
                            className={`w-full py-1 text-center text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                            }`}
                          >
                            {minute.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario seleccionado */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Horario seleccionado:</span>
              <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {selectedStartHour.toString().padStart(2, '0')}:{selectedStartMinute.toString().padStart(2, '0')} - {selectedEndHour.toString().padStart(2, '0')}:{selectedEndMinute.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangePicker;
