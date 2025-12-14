// frontend/components/Input.tsx (KODE LENGKAP YANG DIKOREKSI)
"use client"

import React, { forwardRef, InputHTMLAttributes } from "react" // Tambahkan InputHTMLAttributes

// Gunakan InputHTMLAttributes untuk menampung semua prop standar (termasuk name)
interface Props extends InputHTMLAttributes<HTMLInputElement> {
    // Override type onChange untuk menampung SelectElement
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void 
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    
    // Props kustom/tambahan
    label?: string 
    required?: boolean 
}

const baseClasses =
    "w-full rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#0077AF] transition-all"

const Input = forwardRef<HTMLInputElement, Props>(function Input(
    {
        // PENTING: Ambil semua props standar yang mungkin ingin kita override atau gunakan
        id,
        type = "text",
        value,
        placeholder,
        onChange,
        leftIcon,
        rightIcon,
        ariaLabel,
        className,
        style = {},
        label, 
        required,
        // Semua props standar HTML lainnya (termasuk 'name') ditangkap di sini
        ...restProps 
    },
    ref
) {
    const isFormMode = !!label; 
    const inputPaddingLeft = leftIcon ? (isFormMode ? 'pl-10' : 'pl-12') : (isFormMode ? 'pl-3' : 'pl-5'); 
    const defaultFormClasses = "w-full border border-gray-300 p-2 rounded-lg text-gray-800 bg-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500";
    
    return (
        <div className="w-full">
            {/* LABEL */}
            {label && (
                <label 
                    htmlFor={id || restProps.name} // Gunakan name jika id tidak ada untuk htmlFor
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div 
                className={`relative ${isFormMode ? '' : 'inline-block w-full'}`} 
                style={isFormMode ? {} : style}
            >
                {/* Ikon Kiri */}
                {leftIcon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 ${isFormMode ? 'text-gray-400' : ''}`}>
                        {leftIcon}
                    </div>
                )}

                {/* Elemen Input */}
                <input
                    id={id || restProps.name} // Pastikan input memiliki id
                    ref={ref}
                    type={type}
                    value={value}
                    // Casting dihapus, diganti dengan 'as any' sementara untuk menghindari konflik
                    onChange={onChange as any} 
                    placeholder={placeholder}
                    aria-label={ariaLabel || placeholder || label}
                    required={required} 
                    
                    // --- KRITIS: Meneruskan semua props standar HTML, termasuk 'name' ---
                    {...restProps} 

                    className={
                        isFormMode 
                        ? `${defaultFormClasses} ${inputPaddingLeft} ${className ?? ""}`
                        : `${baseClasses} ${inputPaddingLeft} ${className ?? ""} miracle-auth-input`
                    }
                    style={
                        isFormMode
                        ? { height: '40px' }
                        : { 
                            backgroundColor: "rgba(159, 159, 159, 0.5)",
                            color: "#FFFFFF",
                            border: "none",
                            outline: "none",
                            appearance: "none",
                            ...style,
                        }
                    }
                />

                {/* Ikon Kanan */}
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        {rightIcon}
                    </div>
                )}
            </div>

            {/* Styled JSX */}
            {!isFormMode && (
                <style jsx global>{`
                    .miracle-auth-input::placeholder { color: #ffffff !important; opacity: 1 !important; }
                    .miracle-auth-input:focus { outline: none !important; box-shadow: none !important; }
                    .miracle-auth-input:-webkit-autofill,
                    .miracle-auth-input:-webkit-autofill:hover,
                    .miracle-auth-input:-webkit-autofill:focus {
                        -webkit-box-shadow: 0 0 0 1000px rgba(159, 159, 159, 0.5) inset !important;
                        -webkit-text-fill-color: #ffffff !important;
                        transition: background-color 9999s ease-in-out 0s !important;
                    }
                    .miracle-auth-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
                `}</style>
            )}
        </div>
    )
})

export default Input