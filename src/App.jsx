import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const Calendar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentAmpm = currentHours >= 12 ? 'PM' : 'AM';
    const formattedHours = (currentHours % 12) || 12; // Convert 24hr to 12hr format

    return {
      startDate: now,
      endDate: now,
      startTime: { hours: 12, minutes: 0, seconds: 0, ampm: 'AM' }, // Default to 12 AM
      endTime: { hours: formattedHours, minutes: currentMinutes, seconds: currentSeconds, ampm: currentAmpm }
    };
  });
  
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  const [showTimeFormatOptionsStart, setShowTimeFormatOptionsStart] = useState(false);
  const [showTimeFormatOptionsEnd, setShowTimeFormatOptionsEnd] = useState(false);
  const timeFormatRefStart = useRef(null);
  const timeFormatRefEnd = useRef(null);

  const [leftMonth, setLeftMonth] = useState(dateRange.startDate.getMonth());
  const [leftYear, setLeftYear] = useState(dateRange.startDate.getFullYear());
  const [rightMonth, setRightMonth] = useState(() => {
    const nextMonth = dateRange.startDate.getMonth() + 1;
    return nextMonth > 11 ? 0 : nextMonth; // Handle December to January rollover
  });
  const [rightYear, setRightYear] = useState(() => {
    const nextMonth = dateRange.startDate.getMonth() + 1;
    return nextMonth > 11 ? dateRange.startDate.getFullYear() + 1 : dateRange.startDate.getFullYear();
  });
  
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Close time format dropdowns if clicked outside
      if (timeFormatRefStart.current && !timeFormatRefStart.current.contains(event.target)) {
        setShowTimeFormatOptionsStart(false);
      }
      if (timeFormatRefEnd.current && !timeFormatRefEnd.current.contains(event.target)) {
        setShowTimeFormatOptionsEnd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    let hours = time.hours;
    let minutes = time.minutes;
    let ampm = time.ampm;

    if (is24HourFormat) {
      // Convert 12h to 24h for display
      if (ampm === 'PM' && hours !== 12) {
        hours = hours + 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0; // 12 AM is 00 in 24hr format
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
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

    // Case 1: No start date is selected yet. Set this as the new start date.
    if (!dateRange.startDate) {
      setDateRange(prev => ({
        ...prev,
        startDate: clickedDate,
        endDate: null
      }));
      return;
    }

    // Case 2: Only start date is selected (no end date yet).
    if (dateRange.startDate && !dateRange.endDate) {
      // Sub-case 2.1: Clicked the same date as the start date. Deselect both.
      if (isSameDate(clickedDate, dateRange.startDate)) {
        setDateRange(prev => ({
          ...prev,
          startDate: null,
          endDate: null
        }));
        return;
      }
      // Sub-case 2.2: Clicked a date *before* the current start date.
      // This means the user wants to set a new, earlier start date.
      if (clickedDate < dateRange.startDate) {
        setDateRange(prev => ({
          ...prev,
          startDate: clickedDate,
          endDate: null
        }));
        return;
      }
      // Sub-case 2.3: Clicked a date *on or after* the current start date.
      // This means the user wants to set an end date.
      if (clickedDate >= dateRange.startDate) {
        setDateRange(prev => ({
          ...prev,
          endDate: clickedDate
        }));
        return;
      }
    }

    // Case 3: Both start date and end date are selected (starting a new selection).
    if (dateRange.startDate && dateRange.endDate) {
      // Sub-case 3.1: Clicked the same date as the start date. Deselect both.
      if (isSameDate(clickedDate, dateRange.startDate)) {
        setDateRange(prev => ({
          ...prev,
          startDate: null,
          endDate: null
        }));
        return;
      }
      // Sub-case 3.2: Clicked the same date as the end date. Deselect only end date.
      if (isSameDate(clickedDate, dateRange.endDate)) {
        setDateRange(prev => ({
          ...prev,
          endDate: null
        }));
        return;
      }
      // Sub-case 3.3: Clicked any other date. Start a new selection from clickedDate.
      setDateRange(prev => ({
        ...prev,
        startDate: clickedDate,
        endDate: null
      }));
      return;
    }
  };

  const handleTimeChange = (field, value, isStart) => {
    const timeKey = isStart ? 'startTime' : 'endTime';
    let parsedValue = parseInt(value.toString());

    // Validation checks and format conversion
    if (field === 'hours') {
      if (is24HourFormat) {
        if (parsedValue < 0 || parsedValue > 23) return; // 24-hour format: 0-23
      } else {
        if (parsedValue < 1 || parsedValue > 12) return; // 12-hour format: 1-12
      }
    } else if (field === 'minutes' || field === 'seconds') {
      if (parsedValue < 0 || parsedValue > 59) return; // Minutes and seconds: 0-59
    }

    setDateRange(prev => {
      const newTime = {
        ...prev[timeKey],
        [field]: field === 'ampm' ? value : parsedValue
      };

      // Ensure minutes and seconds are always padded with zeros
      if (field === 'minutes' || field === 'seconds') {
        newTime[field] = String(parsedValue).padStart(2, '0');
      }

      // Adjust hours and ampm if format changes or hours are outside 12-hour range
      if (field === 'hours' && !is24HourFormat) {
        // Convert 24-hour input to 12-hour format if it was previously 24-hour or new input is 24-hour
        if (parsedValue >= 12 && parsedValue <= 23) {
          newTime.ampm = 'PM';
          newTime.hours = parsedValue === 12 ? 12 : parsedValue - 12;
        } else if (parsedValue === 0) {
          newTime.ampm = 'AM';
          newTime.hours = 12;
        } else if (parsedValue >= 1 && parsedValue <= 11) {
          newTime.ampm = 'AM';
          newTime.hours = parsedValue;
        }
      }

      return {
        ...prev,
        [timeKey]: newTime
      };
    });
  };

  const handleTimeFormatChange = (is24Hour) => {
    setIs24HourFormat(is24Hour);
    setShowTimeFormatOptionsStart(false);
    setShowTimeFormatOptionsEnd(false);
    
    // Update time values when switching format
    setDateRange(prev => {
      const updateTime = (time) => {
        if (is24Hour) {
          // Convert to 24-hour format
          let hours = time.hours;
          if (time.ampm === 'PM' && hours !== 12) {
            hours = hours + 12;
          } else if (time.ampm === 'AM' && hours === 12) {
            hours = 0;
          }
          return {
            hours: hours,
            minutes: 59,
            seconds: 59,
            ampm: time.ampm
          };
        } else {
          // Convert to 12-hour format
          let hours = time.hours;
          let ampm = 'AM';
          if (hours >= 12) {
            ampm = 'PM';
            hours = hours === 12 ? 12 : hours - 12;
          } else if (hours === 0) {
            hours = 12;
          }
          return {
            hours: hours,
            minutes: time.minutes,
            seconds: time.seconds,
            ampm: ampm
          };
        }
      };

      return {
        ...prev,
        startTime: updateTime(prev.startTime),
        endTime: updateTime(prev.endTime)
      };
    });
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
      
      let dayClass = 'calendar-day prev-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      
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
      
      let dayClass = 'calendar-day current-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      
      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDateClick(day, month, year)}
        >
          {day}
        </div>
      );
    }

    // Next month days to fill the grid (always 6 weeks = 42 cells)
    const totalCells = 42;
    for (let day = 1; days.length < totalCells; day++) {
      const currentDate = new Date(year, month + 1, day);
      const isSelected = isSameDate(currentDate, dateRange.startDate) || 
                        isSameDate(currentDate, dateRange.endDate);
      const isInRange = isDateInRange(currentDate, dateRange.startDate, dateRange.endDate);
      
      let dayClass = 'calendar-day next-month';
      if (isSelected) dayClass += ' selected';
      if (isInRange) dayClass += ' in-range';
      
      days.push(
        <div key={`next-${day}`} className={dayClass}>
          {day}
        </div>
      );
    }

    const currentTime = isLeft ? dateRange.startTime : dateRange.endTime;
    const showTimeFormatOptions = isLeft ? showTimeFormatOptionsStart : showTimeFormatOptionsEnd;
    const timeFormatRef = isLeft ? timeFormatRefStart : timeFormatRefEnd;
    const setShowTimeFormatOptions = isLeft ? setShowTimeFormatOptionsStart : setShowTimeFormatOptionsEnd;

    return (
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <div className="dropdown-container">
            <select
              value={month}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                if (isLeft) {
                  setLeftMonth(newMonth);
                  // If left month becomes same as right month, move right month forward
                  if (newMonth === rightMonth && leftYear === rightYear) {
                    setRightMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
                    if (newMonth === 11) setRightYear(prevYear => prevYear + 1);
                  }
                } else {
                  setRightMonth(newMonth);
                  // If right month becomes same as left month, move left month backward
                  if (newMonth === leftMonth && rightYear === leftYear) {
                    setLeftMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
                    if (newMonth === 0) setLeftYear(prevYear => prevYear - 1);
                  }
                }
              }}
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
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                if (isLeft) {
                  setLeftYear(newYear);
                  // If left year/month becomes same as right year/month, move right month forward
                  if (newYear === rightYear && leftMonth === rightMonth) {
                    setRightMonth(prevMonth => (prevMonth === 11 ? 0 : prevMonth + 1));
                    if (rightMonth === 11) setRightYear(prevYear => prevYear + 1);
                  }
                } else {
                  setRightYear(newYear);
                  // If right year/month becomes same as left year/month, move left month backward
                  if (newYear === leftYear && rightMonth === leftMonth) {
                    setLeftMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth - 1));
                    if (leftMonth === 0) setLeftYear(prevYear => prevYear - 1);
                  }
                }
              }}
              className="year-select"
            >
              {Array.from({ length: new Date().getFullYear() - (new Date().getFullYear() - 10) + 1 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
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
          
          <div className="time-main-controls">
            <div className="time-input-group">
              <div className="time-inputs">
                <input
                  type="number"
                  value={String(is24HourFormat ? currentTime.hours : (currentTime.hours === 0 ? 12 : currentTime.hours > 12 ? currentTime.hours - 12 : currentTime.hours))}
                  onChange={(e) => handleTimeChange('hours', e.target.value, isLeft)}
                  className="time-input"
                  min={is24HourFormat ? "0" : "1"}
                  max={is24HourFormat ? "23" : "12"}
                />
                <span className="time-separator">:</span>
                <input
                  type="number"
                  value={String(currentTime.minutes).padStart(2, '0')}
                  onChange={(e) => handleTimeChange('minutes', e.target.value, isLeft)}
                  className="time-input"
                  min="0"
                  max="59"
                />
                <span className="time-separator">:</span>
                <input
                  type="number"
                  value={String(currentTime.seconds).padStart(2, '0')}
                  onChange={(e) => handleTimeChange('seconds', e.target.value, isLeft)}
                  className="time-input"
                  min="0"
                  max="59"
                />
              </div>
              {!is24HourFormat && (
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
              )}
            </div>
            
            <div className="time-format-group">
              <div className="time-display-container">
                <div className="time-display" onClick={() => setShowTimeFormatOptions(prev => !prev)}>
                  {is24HourFormat ? '24h' : '12h'}
                  <div className="dropdown-arrow">▼</div>
                  
                  {showTimeFormatOptions && (
                    <div ref={timeFormatRef} className="time-format-options">
                      <div onClick={() => handleTimeFormatChange(false)} className={!is24HourFormat ? 'active' : ''}>12h</div>
                      <div onClick={() => handleTimeFormatChange(true)} className={is24HourFormat ? 'active' : ''}>24h</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const clearDates = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentAmpm = currentHours >= 12 ? 'PM' : 'AM';
    const formattedHours = (currentHours % 12) || 12; // Convert 24hr to 12hr format

    setDateRange({
      startDate: now,
      endDate: now,
      startTime: { hours: 12, minutes: 0, seconds: 0, ampm: 'AM' },
      endTime: { hours: formattedHours, minutes: currentMinutes, seconds: currentSeconds, ampm: currentAmpm }
    });
    setLeftMonth(now.getMonth());
    setLeftYear(now.getFullYear());
    const nextMonth = now.getMonth() + 1;
    setRightMonth(nextMonth > 11 ? 0 : nextMonth);
    setRightYear(nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear());
  };

  const formatDateTime = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(time.hours).padStart(2, '0');
    const minutes = String(time.minutes).padStart(2, '0');
    const seconds = String(time.seconds).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Date Range Calendar</h1>
      
      <div className="date-range-picker">
        <div className="date-time-format">
          {formatDateTime(dateRange.startDate, dateRange.startTime)}
        </div>
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
                <div className="popup-actions">
                <button className="apply-button clear-button">Apply</button>
                  <button onClick={clearDates} className="clear-button">
                    Clear
                  </button>
                  <button onClick={() => setIsOpen(false)} className="close-button">

                  <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                  </button>
                  
                </div>
              </div>

              {/* Calendars */}
              <div className="calendars-container">
                {renderCalendar(leftMonth, leftYear, true)}
                <div className="calendar-separator"></div>
                {renderCalendar(rightMonth, rightYear, false)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;