// MCR file header: Frontend\src\components\DatePickerInput.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';

interface DatePickerInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  calendarClassName?: string;
}

const baseButtonClassName = [
  'relative w-full rounded-xl border border-indigo-200 bg-white/88 px-4 py-3 pr-14 text-left text-sm text-slate-800',
  'shadow-[0_10px_30px_rgba(99,102,241,0.08)] transition-all outline-none',
  'hover:border-indigo-300 hover:bg-white focus:border-transparent focus:ring-2 focus:ring-indigo-400',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

const baseCalendarClassName = [
  'absolute left-0 top-[calc(100%+0.55rem)] z-30 w-full overflow-hidden rounded-[24px] border border-indigo-100',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(238,242,255,0.98)_100%)] p-3',
  'shadow-[0_24px_60px_rgba(79,70,229,0.20)] backdrop-blur-sm',
].join(' ');

function toDateValue(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
  disabled = false,
  className = '',
  buttonClassName = '',
  calendarClassName = '',
}: DatePickerInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = useMemo(() => toDateValue(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [viewDate]);

  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder;
  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const selectDate = (nextDate: Date) => {
    onChange(format(nextDate, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    selectDate(today);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setViewDate(selectedDate || new Date());
            setIsOpen((prev) => !prev);
          }
        }}
        className={`${baseButtonClassName} ${buttonClassName}`}
      >
        <span className={selectedDate ? 'text-slate-800' : 'text-slate-400'}>
          {displayValue}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
          <i className="ri-calendar-line text-lg text-slate-500"></i>
        </span>
      </button>

      {isOpen && (
        <div className={`${baseCalendarClassName} ${calendarClassName}`}>
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2">
            <button
              type="button"
              onClick={() => setViewDate((prev) => subMonths(prev, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>
            <div className="text-sm font-semibold text-slate-900">
              {format(viewDate, 'MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={() => setViewDate((prev) => addMonths(prev, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-white text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                {label}
              </div>
            ))}

            {calendarDays.map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={[
                    'flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all',
                    isSelected ? 'bg-indigo-600 text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)]' : '',
                    !isSelected && isCurrentMonth ? 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700' : '',
                    !isCurrentMonth ? 'text-slate-300 hover:bg-slate-50' : '',
                    isCurrentDay && !isSelected ? 'ring-1 ring-indigo-200 bg-white text-indigo-700' : '',
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-indigo-100 px-1 pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
