import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
};

export default function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length) - 1]?.focus();
  };

  const handleKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      setDigit(index - 1, '');
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-sm">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            'h-14 w-11 rounded-xl border border-outline-variant bg-surface-container-low text-center font-display text-title text-on-surface outline-none transition-shadow duration-200 focus:border-primary focus:ring-2 focus:ring-primary',
            digit && 'border-primary bg-primary-fixed',
          )}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, '').slice(-1);
            setDigit(index, next);
            if (next && index < length - 1) inputs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => handleKey(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
