import { useEffect, useMemo, useRef, useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownSelectProps {
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  emptyMessage?: string;
}

const baseButtonClassName = [
  'w-full rounded-xl border border-indigo-200 bg-white/88 px-4 py-3 pr-12 text-left text-sm text-slate-800',
  'shadow-[0_10px_30px_rgba(99,102,241,0.08)] transition-all outline-none',
  'hover:border-indigo-300 hover:bg-white focus:border-transparent focus:ring-2 focus:ring-indigo-400',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ');

const baseMenuClassName = [
  'absolute left-0 right-0 top-[calc(100%+0.55rem)] z-30 overflow-hidden rounded-2xl border border-indigo-100',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(238,242,255,0.98)_100%)] p-2',
  'shadow-[0_24px_60px_rgba(79,70,229,0.22)] backdrop-blur-sm',
].join(' ');

const baseOptionClassName = [
  'flex w-full items-start justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm',
  'text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-700',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

function getInitialIndex(options: DropdownOption[], selectedValue?: string) {
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue && !option.disabled
  );

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return options.findIndex((option) => !option.disabled);
}

export default function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  emptyMessage = 'No options available',
}: DropdownSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    getInitialIndex(options, value)
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(getInitialIndex(options, value));
  }, [options, value]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) {
      return;
    }

    optionRefs.current[highlightedIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [highlightedIndex, isOpen]);

  const selectOption = (nextValue: string, shouldRefocus = true) => {
    onChange(nextValue);
    setIsOpen(false);

    if (shouldRefocus) {
      window.requestAnimationFrame(() => {
        buttonRef.current?.focus();
      });
    }
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) {
      return;
    }

    let nextIndex = highlightedIndex;

    for (let step = 0; step < options.length; step += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;

      if (!options[nextIndex]?.disabled) {
        setHighlightedIndex(nextIndex);
        return;
      }
    }
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setHighlightedIndex(getInitialIndex(options, value));
          setIsOpen(true);
          return;
        }
        moveHighlight(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setHighlightedIndex(getInitialIndex(options, value));
          setIsOpen(true);
          return;
        }
        moveHighlight(-1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setHighlightedIndex(getInitialIndex(options, value));
          setIsOpen(true);
          return;
        }
        if (highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
          selectOption(options[highlightedIndex].value);
        }
        return;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
        }
        return;
      default:
        return;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setHighlightedIndex(getInitialIndex(options, value));
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleButtonKeyDown}
        className={`${baseButtonClassName} ${buttonClassName}`}
      >
        <span
          className={`block pr-2 leading-5 ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {selectedOption?.label || placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50/80 text-indigo-600 transition-transform ${
              isOpen ? 'rotate-180 bg-indigo-100' : ''
            }`}
          >
            <i className="ri-arrow-down-s-line text-base"></i>
          </span>
        </span>
      </button>

      {isOpen && (
        <div className={baseMenuClassName + (menuClassName ? ` ${menuClassName}` : '')}>
          {options.length === 0 ? (
            <div className="px-3.5 py-3 text-sm text-slate-500">{emptyMessage}</div>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1">
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={option.value}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onMouseEnter={() => {
                      if (!option.disabled) {
                        setHighlightedIndex(index);
                      }
                    }}
                    onClick={() => {
                      if (!option.disabled) {
                        selectOption(option.value);
                      }
                    }}
                    className={[
                      baseOptionClassName,
                      isHighlighted && !isSelected ? 'bg-indigo-50/80 text-indigo-700' : '',
                      isSelected ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-600 hover:text-white' : '',
                      optionClassName,
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1 break-words leading-5">{option.label}</span>
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100/80 text-indigo-500'
                      }`}
                    >
                      <i className={`text-xs ${isSelected ? 'ri-check-line' : 'ri-arrow-right-up-line'}`}></i>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
