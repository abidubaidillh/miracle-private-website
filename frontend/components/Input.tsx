"use client"

import React, { forwardRef } from 'react'

type Props = {
  id?: string
  type?: string
  value?: string
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  ariaLabel?: string
  className?: string
}

const baseClasses = 'w-full rounded-full px-5 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#0077AF] transition-all'

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { id, type = 'text', value, placeholder, onChange, leftIcon, rightIcon, ariaLabel, className },
  ref
) {
  return (
    <div className="relative">
      {leftIcon && <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">{leftIcon}</div>}
      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${className || ''} ${baseClasses} miracle-auth-input`}
        style={{
          backgroundColor: 'rgba(159, 159, 159, 0.5)',
          color: '#FFFFFF',
          border: 'none',
          outline: 'none',
          WebkitAppearance: 'none',
          appearance: 'none',
          WebkitBoxSizing: 'border-box',
          boxSizing: 'border-box',
          backgroundClip: 'padding-box',
        }}
      />
      {rightIcon && <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{rightIcon}</div>}

      <style jsx>{`
        .miracle-auth-input::placeholder { color: #FFFFFF !important; opacity: 1 !important; }
        .miracle-auth-input { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        .miracle-auth-input:focus { outline: none !important; box-shadow: none !important; }

        /* Autofill overrides for Chrome/Edge */
        .miracle-auth-input:-webkit-autofill,
        .miracle-auth-input:-webkit-autofill:hover,
        .miracle-auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(159, 159, 159, 0.5) inset !important;
          box-shadow: 0 0 0 1000px rgba(159, 159, 159, 0.5) inset !important;
          -webkit-text-fill-color: #FFFFFF !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        /* Date input indicator and password default shadows */
        .miracle-auth-input[type="date"] { background-clip: padding-box; }
        .miracle-auth-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) contrast(1.2); background: transparent; }
        .miracle-auth-input[type="password"] { box-shadow: none !important; }

        /* vendor placeholder fallbacks */
        .miracle-auth-input:-moz-placeholder { color: #FFFFFF !important; opacity: 1 !important; }
        .miracle-auth-input::-moz-placeholder { color: #FFFFFF !important; opacity: 1 !important; }
        .miracle-auth-input:-ms-input-placeholder { color: #FFFFFF !important; opacity: 1 !important; }
      `}</style>
    </div>
  )
})

export default Input
