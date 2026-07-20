import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils'
import './Field.css'

interface FieldWrapProps {
  label?: string
  hint?: string
  children: ReactNode
  optional?: boolean
}

export function Field({ label, hint, children, optional }: FieldWrapProps) {
  return (
    <label className="field">
      {label && (
        <span className="field__label">
          {label}
          {optional && <span className="field__optional">optional</span>}
        </span>
      )}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>

export function TextField({ className, ...rest }: TextFieldProps) {
  return <input className={cx('input', className)} {...rest} />
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ className, ...rest }: TextAreaProps) {
  return <textarea className={cx('input input--area', className)} {...rest} />
}