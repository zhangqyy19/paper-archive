import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils'
import { Icon, type IconName } from './Icon'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconOnly = !children
  return (
    <button
      className={cx('btn', `btn--${variant}`, `btn--${size}`, iconOnly && 'btn--icon-only', className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      {children && <span className="btn__label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 18} />}
    </button>
  )
}