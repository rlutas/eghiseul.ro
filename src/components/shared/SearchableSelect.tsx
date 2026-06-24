'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

function stripDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

interface SearchableSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Cauta...',
  error,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    direction: 'down' | 'up';
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // text-base (16px) on mobile prevents iOS Safari's auto-zoom on focus
  // (it zooms any input < 16px); text-sm (14px) from sm up keeps it compact.
  const baseClassName = `h-11 w-full rounded-lg border bg-white pl-3 pr-8 text-base sm:text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
    error ? 'border-red-500' : 'border-neutral-300'
  } ${className || ''}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Build the displayed list: priority items first (when not searching),
  // then the rest with priority items dedup'd out.
  const normalizedSearch = stripDiacritics(search);
  const isSearching = search.length > 0;
  // Arată TOATE opțiunile (în ordinea dată — alfabetică), scrollabil. Scrii ca să filtrezi.
  const visible = isSearching
    ? options.filter((o) => stripDiacritics(o).includes(normalizedSearch))
    : options;

  // Compute dropdown position relative to viewport so it can escape any
  // ancestor with overflow:hidden (the wizard step Card uses it).
  const computePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 280; // matches max-h-64 (~256px) + a small buffer
    const direction: 'down' | 'up' =
      spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'up' : 'down';

    setPosition({
      top: direction === 'down' ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      width: rect.width,
      direction,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const handler = () => computePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, computePosition]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setSearch(val);
      setOpen(false);
      setHighlightIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setOpen(true);
    setHighlightIndex(-1);
  };

  const handleFocus = () => {
    setOpen(true);
    inputRef.current?.select();
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (
        !containerRef.current?.contains(active) &&
        !listRef.current?.contains(active)
      ) {
        setOpen(false);
        if (!options.includes(search)) {
          setSearch(value);
        }
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < visible.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < visible.length) {
        handleSelect(visible[highlightIndex]);
      } else if (visible.length === 1) {
        handleSelect(visible[0]);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIndex(-1);
      setSearch(value);
    }
  };

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightIndex]) {
        (items[highlightIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightIndex]);

  // Click outside to close.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setOpen(false);
        setHighlightIndex(-1);
        if (!options.includes(search)) {
          setSearch(value);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [options, search, value]);

  const dropdownStyle: React.CSSProperties | undefined = position
    ? {
        position: 'fixed',
        top:
          position.direction === 'down'
            ? position.top
            : undefined,
        bottom:
          position.direction === 'up'
            ? window.innerHeight - position.top
            : undefined,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }
    : undefined;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={baseClassName}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      {mounted && open && position &&
        createPortal(
          <>
            {visible.length > 0 && (
              <ul
                ref={listRef}
                role="listbox"
                style={dropdownStyle}
                className="max-h-64 overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl"
              >
                {visible.map((item, i) => (
                  <li
                    key={item}
                    role="option"
                    aria-selected={i === highlightIndex}
                    className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                      i === highlightIndex
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : item === value
                        ? 'bg-primary-50/50 font-medium text-primary-700'
                        : 'hover:bg-neutral-50'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(item);
                    }}
                    onMouseEnter={() => setHighlightIndex(i)}
                  >
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {visible.length === 0 && search.length > 0 && (
              <div
                style={dropdownStyle}
                className="rounded-lg border border-neutral-200 bg-white p-3 shadow-xl text-xs text-neutral-500 text-center"
              >
                Niciun rezultat găsit.
              </div>
            )}
          </>,
          document.body
        )}
    </div>
  );
}
