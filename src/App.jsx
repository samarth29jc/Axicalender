import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const Calendar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(2024, 11, 15), // December 15, 2024
    endDate: new Date(2025, 0, 15), // January 15, 2025
    startTime: { hours: 12, minutes: 59, seconds: 58, ampm: 'AM' },
    endTime: { hours: 12, minutes: 59, seconds: 0, ampm: 'AM' }
  });
  
  const [leftMonth, setLeftMonth] = useState(11); // December (0-indexed)
  const [leftYear, setLeftYear] = useState(2024);
  const [rightMonth, setRightMonth] = useState(0); // January
  const [rightYear, setRightYear] = useState(2025);
  
  const calendarRef = useRef(null);
  const secondsDisplayRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (secondsDisplayRef.current) {
      const activeSecond = secondsDisplayRef.current.querySelector('.seconds-number.active');
      if (activeSecond) {
        activeSecond.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [dateRange.startTime.seconds]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = months[date.getMonth()].slice(0, 3);
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (time) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')} ${time.ampm}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday = 0 to Monday = 0
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateInRange = (date, startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return current >= start && current <= end;
  };

  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      // Start new selection
      setDateRange(prev => ({
        ...prev,
        startDate: clickedDate,
        endDate: null
      }));
    } else if (clickedDate < dateRange.startDate) {
      // Don't allow selecting dates before start date
      return;
    } else {
      // Set end date
      setDateRange(prev => ({
        ...prev,
        endDate: clickedDate
      }));
    }
  };

  const handleTimeChange = (field, value, isStart) => {
    const timeKey = isStart ? 'startTime' : 'endTime';
    setDateRange(prev => ({
      ...prev,
      [timeKey]: {
        ...prev[timeKey],
        [field]: field === 'ampm' ? value : parseInt(value.toString())
      }
    }));
  };

  const renderCalendar = (month, year, isLeft) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];
    
    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const currentDate = new Date(prevYear, prevMonth, day);
      const isSelected = isSameDate(currentDate, dateRange.startDate) || 
                        isSameDate(currentDate, dateRange.endDate);
      const isInRange = isDateInRange(currentDate, dateRange.startDate, dateRange.endDate);
      const isDisabled = dateRange.startDate && !dateRange.endDate && currentDate < dateRange.startDate;
      
      let dayClass = 'calendar-day prev-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      if (isDisabled) dayClass += ' disabled';
      
      days.push(
        <div key={`prev-${day}`} className={dayClass}>
          {day}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected = isSameDate(currentDate, dateRange.startDate) || 
                        isSameDate(currentDate, dateRange.endDate);
      const isInRange = isDateInRange(currentDate, dateRange.startDate, dateRange.endDate);
      const isDisabled = dateRange.startDate && !dateRange.endDate && currentDate < dateRange.startDate;
      
      let dayClass = 'calendar-day current-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      if (isDisabled) dayClass += ' disabled';
      
      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => !isDisabled && handleDateClick(day, month, year)}
        >
          {day}
        </div>
      );
    }

    // Next month days to fill the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const currentDate = new Date(year, month + 1, day);
      const isSelected = isSameDate(currentDate, dateRange.startDate) || 
                        isSameDate(currentDate, dateRange.endDate);
      const isInRange = isDateInRange(currentDate, dateRange.startDate, dateRange.endDate);
      const isDisabled = dateRange.startDate && !dateRange.endDate && currentDate < dateRange.startDate;
      
      let dayClass = 'calendar-day next-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      if (isDisabled) dayClass += ' disabled';
      
      days.push(
        <div key={`next-${day}`} className={dayClass}>
          {day}
        </div>
      );
    }

    const currentTime = isLeft ? dateRange.startTime : dateRange.endTime;

    return (
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <div className="dropdown-container">
            <select
              value={month}
              onChange={(e) => isLeft ? setLeftMonth(parseInt(e.target.value)) : setRightMonth(parseInt(e.target.value))}
              className="month-select"
            >
              {months.map((monthName, index) => (
                <option key={index} value={index}>{monthName}</option>
              ))}
            </select>
            <div className="dropdown-arrow">▼</div>
          </div>
          <div className="dropdown-container">
            <select
              value={year}
              onChange={(e) => isLeft ? setLeftYear(parseInt(e.target.value)) : setRightYear(parseInt(e.target.value))}
              className="year-select"
            >
              {Array.from({ length: 10 }, (_, i) => year - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="dropdown-arrow">▼</div>
          </div>
        </div>

        {/* Day names */}
        <div className="day-names">
          {dayNames.map(day => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {days}
        </div>

        {/* Time picker */}
        <div className="time-picker">
          <div className="time-header">
            <span className="time-label">Time</span>
            <span className="default-label">Default</span>
          </div>
          
          <div className="time-controls">
            <div className="time-inputs">
              <input
                type="number"
                min="1"
                max="12"
                value={currentTime.hours}
                onChange={(e) => handleTimeChange('hours', e.target.value, isLeft)}
                className="time-input"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={currentTime.minutes}
                onChange={(e) => handleTimeChange('minutes', e.target.value, isLeft)}
                className="time-input"
              />
              <div className="seconds-display" ref={secondsDisplayRef}>
                {[...Array(60).keys()].map(sec => (
                  <div
                    key={sec}
                    className={`seconds-number ${sec === currentTime.seconds ? 'active' : ''}`}
                    onClick={() => handleTimeChange('seconds', sec, isLeft)}
                  >
                    {sec}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ampm-container">
              <button
                onClick={() => handleTimeChange('ampm', 'AM', isLeft)}
                className={`ampm-button ${currentTime.ampm === 'AM' ? 'active' : ''}`}
              >
                AM
              </button>
              <button
                onClick={() => handleTimeChange('ampm', 'PM', isLeft)}
                className={`ampm-button ${currentTime.ampm === 'PM' ? 'active' : ''}`}
              >
                PM
              </button>
            </div>

            <div className="clock-icon">🕐</div>
            
            <div className="time-display-container">
              <span className="time-display">
                {formatTime(currentTime)}
                <div className="dropdown-arrow">▼</div>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const clearDates = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      startTime: { hours: 12, minutes: 0, seconds: 0, ampm: 'PM' },
      endTime: { hours: 12, minutes: 0, seconds: 0, ampm: 'PM' }
    });
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Date Range Calendar</h1>
      
      {/* Date Input */}
      <div className="date-input-container">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="date-input"
        >
          <span>
            Start date <strong>{formatDate(dateRange.startDate)}</strong> → End date <strong>{formatDate(dateRange.endDate)}</strong>
          </span>
          <div className="dropdown-arrow">▼</div>
        </div>

        {/* Calendar Popup */}
        {isOpen && (
          <div ref={calendarRef} className="calendar-popup">
            {/* Header */}
            <div className="popup-header">
              <div className="date-range-display">
                Start date <strong>{formatDate(dateRange.startDate)}</strong> → End date <strong>{formatDate(dateRange.endDate)}</strong>
              </div>
              <button onClick={clearDates} className="clear-button">
                Clear
              </button>
            </div>

            {/* Calendars */}
            <div className="calendars-container">
              {renderCalendar(leftMonth, leftYear, true)}
              {renderCalendar(rightMonth, rightYear, false)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;