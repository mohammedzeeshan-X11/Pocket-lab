import React, { useEffect, useId, useRef, useState } from 'react';

export interface ParameterSliderInputProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  displayValue?: string;
  onChange: (value: number) => void;
  testId?: string;
}

function getStepDecimals(step: number): number {
  const s = String(step);
  const dotIdx = s.indexOf('.');
  return dotIdx === -1 ? 0 : s.length - dotIdx - 1;
}

function clampAndRound(val: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, val));
  const decimals = getStepDecimals(step);
  const rounded = Math.round((clamped - min) / step) * step + min;
  const fixed = Number(rounded.toFixed(decimals));
  return Math.min(max, Math.max(min, fixed));
}

export const ParameterSliderInput: React.FC<ParameterSliderInputProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  unit = '',
  displayValue,
  onChange,
  testId,
}) => {
  const fallbackId = useId();
  const controlId = id || fallbackId;
  const decimals = getStepDecimals(step);

  const [draft, setDraft] = useState<string>(value.toFixed(decimals));
  const [isFocused, setIsFocused] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const highlightTimerRef = useRef<number | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!isFocused) {
      setDraft(value.toFixed(decimals));
    }
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setJustUpdated(true);
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setJustUpdated(false);
      }, 420);
    }
  }, [value, decimals, isFocused]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const commitValue = (rawStr: string) => {
    const parsed = Number(rawStr);
    if (!Number.isFinite(parsed)) {
      setDraft(value.toFixed(decimals));
      return;
    }
    const next = clampAndRound(parsed, min, max, step);
    setDraft(next.toFixed(decimals));
    if (next !== value) {
      onChange(next);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === '' || raw === '-' || raw.endsWith('.')) return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
      const next = clampAndRound(parsed, min, max, step);
      onChange(next);
    }
  };

  return (
    <div
      data-testid={testId}
      data-updated={justUpdated ? 'true' : 'false'}
      className={`rounded-xl border px-3 py-2 sm:py-2.5 space-y-1.5 sm:space-y-2 transition-colors duration-200 scroll-mt-20 scroll-mb-28 ${
        justUpdated
          ? 'border-[#F49A3C]/60 bg-[#FFF3E3]/35'
          : 'border-[#EFE7DF]/85 bg-[#FFF9F4]/55'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={`${controlId}-number`}
          className="text-xs font-semibold text-[#171A2F] leading-tight min-w-0 truncate"
        >
          {label}
        </label>

        <div className="flex items-center gap-1.5 shrink-0">
          {displayValue && (
            <span className="text-[11px] font-mono-tabular text-[#6F7487]">
              {displayValue}
            </span>
          )}
          <div className="inline-flex items-center rounded-lg border border-[#EFE7DF] bg-white px-2 py-0.5 min-h-[34px] focus-within:border-[#F49A3C]">
            <input
              id={`${controlId}-number`}
              type="number"
              inputMode="decimal"
              min={min}
              max={max}
              step={step}
              value={draft}
              aria-label={unit ? `${label} (${unit})` : label}
              onFocus={(e) => {
                setIsFocused(true);
                e.currentTarget.select();
                e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }}
              onChange={handleNumberChange}
              onBlur={() => {
                setIsFocused(false);
                commitValue(draft);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitValue(draft);
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  setDraft(value.toFixed(decimals));
                  e.currentTarget.blur();
                }
              }}
              className="w-14 bg-transparent text-right text-xs font-semibold font-mono-tabular text-[#C96D12] focus:outline-none"
            />
            {unit && (
              <span className="ml-1 text-[11px] font-medium text-[#6F7487] select-none">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="py-1">
        <input
          id={controlId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => {
            const next = clampAndRound(Number(e.target.value), min, max, step);
            setDraft(next.toFixed(decimals));
            onChange(next);
          }}
          className="physix-slider"
        />
      </div>
    </div>
  );
};
