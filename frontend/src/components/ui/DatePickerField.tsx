import { useEffect, useId, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { Calendar } from 'lucide-react';

export interface DatePickerFieldProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

function parseLocalYmd(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function toLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function DatePickerField({
  label,
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Seleccionar fecha',
  min,
  max,
}: DatePickerFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);

  const selected = parseLocalYmd(value);
  const minDate = parseLocalYmd(min ?? '');
  const maxDate = parseLocalYmd(max ?? '');

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [abierto]);

  const disabledMatchers = [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
  ];

  const textoVisible = selected
    ? format(selected, "dd/MM/yyyy", { locale: es })
    : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>

      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => {
          if (!disabled) {
            setAbierto((prev) => !prev);
          }
        }}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {textoVisible}
        </span>
        <Calendar className="ml-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>

      {abierto && !disabled ? (
        <div className="absolute z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <DayPicker
            mode="single"
            locale={es}
            selected={selected}
            defaultMonth={selected ?? minDate ?? maxDate ?? new Date()}
            disabled={
              disabledMatchers.length > 0 ? disabledMatchers : undefined
            }
            onSelect={(date) => {
              if (!date) {
                return;
              }
              onChange(toLocalYmd(date));
              setAbierto(false);
            }}
            classNames={{
              root: 'rdp-root text-sm text-slate-700',
              months: 'flex flex-col',
              month_caption:
                'flex items-center justify-center px-2 py-1 font-semibold text-slate-800',
              nav: 'flex items-center justify-between gap-2 mb-2',
              button_previous:
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50',
              button_next:
                'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50',
              weekdays: 'flex',
              weekday:
                'w-9 text-center text-xs font-medium uppercase text-slate-400',
              week: 'flex mt-1',
              day: 'w-9 h-9 p-0 text-center',
              day_button:
                'h-9 w-9 rounded-lg text-sm text-slate-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200',
              selected:
                '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
              today: '[&>button]:font-semibold [&>button]:text-blue-700',
              outside: '[&>button]:text-slate-300',
              disabled:
                '[&>button]:text-slate-300 [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed',
              chevron: 'fill-slate-600',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
