'use client';

import { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import type { Value, Country } from 'react-phone-number-input';

/**
 * Input téléphone avec sélecteur de pays + drapeau.
 * Bloque les lettres et caractères spéciaux (chiffres + E.164 uniquement).
 * Taille : 'sm' (profil membre h-8/h-9) | 'md' (admin h-10) | 'lg' (public h-11)
 */

/* Input interne — filtre les caractères non numériques */
const DigitInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function DigitInput(props, ref) {
    return (
      <input
        {...props}
        ref={ref}
        inputMode="tel"
        autoComplete="tel"
        onKeyDown={e => {
          const allowed = [
            '0','1','2','3','4','5','6','7','8','9',
            'Backspace','Delete','Tab','Enter',
            'ArrowLeft','ArrowRight','Home','End',
          ];
          if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
          }
          props.onKeyDown?.(e as React.KeyboardEvent<HTMLInputElement>);
        }}
        onPaste={e => {
          const txt = e.clipboardData.getData('text');
          if (!/^[+\d\s\-()]+$/.test(txt)) e.preventDefault();
          props.onPaste?.(e as React.ClipboardEvent<HTMLInputElement>);
        }}
      />
    );
  },
);
DigitInput.displayName = 'DigitInput';

/* ─── Types ──────────────────────────────────────────────────── */
export type PhoneSize = 'sm' | 'md' | 'lg';

export interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  size?: PhoneSize;
  error?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  /** ISO 3166-1 alpha-2, défaut: CM (Cameroun) */
  defaultCountry?: string;
  className?: string;
}

const sizeH: Record<PhoneSize, string> = {
  sm: 'h-8 sm:h-9',
  md: 'h-10',
  lg: 'h-11',
};

export function PhoneField({
  value,
  onChange,
  size = 'md',
  error,
  placeholder = '+237 6 00 00 00',
  required,
  disabled,
  defaultCountry = 'CM',
  className,
}: PhoneFieldProps) {
  const border = error
    ? 'border-2 border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/15'
    : 'border-neutral-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/12';

  return (
    <PhoneInput
      international
      defaultCountry={defaultCountry as Country}
      value={(value || '') as Value}
      onChange={val => onChange(val ?? '')}
      inputComponent={DigitInput}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      className={[
        'phone-field',
        `phone-field-${size}`,
        'w-full overflow-hidden rounded-xl border bg-white transition-all',
        border,
        sizeH[size],
        disabled ? 'opacity-60' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
    />
  );
}
