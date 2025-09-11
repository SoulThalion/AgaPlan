interface CalendarNavigationProps {
  currentView: 'month' | 'week' | 'day' | 'list';
  currentDate: Date;
  navigateMonth: (direction: 'prev' | 'next') => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  navigateDay: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  formatMonthYear: (date: Date) => string;
  formatWeekRange: (date: Date) => string;
  formatDay: (date: Date) => string;
}

export default function CalendarNavigation({
  currentView,
  currentDate,
  navigateMonth,
  navigateWeek,
  navigateDay,
  goToToday,
  formatMonthYear,
  formatWeekRange,
  formatDay
}: CalendarNavigationProps) {
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentView === 'month') {
      navigateMonth(direction);
    } else if (currentView === 'week') {
      navigateWeek(direction);
    } else if (currentView === 'day') {
      navigateDay(direction);
    }
  };

  const getCurrentPeriodTitle = () => {
    switch (currentView) {
      case 'month':
        return formatMonthYear(currentDate);
      case 'week':
        return formatWeekRange(currentDate);
      case 'day':
        return formatDay(currentDate);
      default:
        return 'Lista de Turnos';
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => handleNavigate('prev')}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
        {getCurrentPeriodTitle()}
      </h3>
      
      <div className="flex space-x-2">
        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Hoy
        </button>
        <button
          onClick={() => handleNavigate('next')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
