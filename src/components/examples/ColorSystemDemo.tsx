/**
 * Color System Demo Components
 * Examples of using the eGhiseul.ro color system in React components
 */

import React from 'react';
import { getStatusBadgeClasses, type OrderStatus } from '@/lib/design/colors';

// ============================================
// Button Components
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary-500 text-secondary-900 hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-transparent border-2 border-primary-500 text-secondary-900 hover:bg-primary-50 active:bg-primary-100',
    ghost: 'bg-transparent text-primary-700 hover:bg-primary-100 active:bg-primary-200',
    destructive: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
  };

  return (
    <button
      className={`
        px-6 py-3
        rounded-lg
        font-semibold
        transition-colors
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================
// Service Card Component
// ============================================

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  onOrder?: () => void;
}

export function ServiceCard({ title, description, price, icon, onOrder }: ServiceCardProps) {
  return (
    <div
      className="
        bg-card
        border border-neutral-200
        border-l-4 border-l-primary-500
        rounded-2xl
        p-6
        shadow-[0_6px_20px_rgba(6,16,31,0.08)]
        hover:shadow-[0_10px_30px_rgba(6,16,31,0.12)]
        transition-shadow
      "
    >
      {/* Icon Container */}
      <div className="bg-primary-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
        <div className="text-primary-600">{icon}</div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <span className="text-2xl font-bold text-secondary-900">{price} RON</span>
        <button
          onClick={onOrder}
          className="bg-primary-500 text-secondary-900 px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Comandă
        </button>
      </div>
    </div>
  );
}

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  status: OrderStatus;
  label: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const icons = {
    pending: '⏱️',
    processing: '⚙️',
    completed: '✓',
    rejected: '✕',
    cancelled: '⊗',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        rounded-full
        text-sm font-medium
        border
        ${getStatusBadgeClasses(status)}
      `}
    >
      {showIcon && <span>{icons[status]}</span>}
      {label}
    </span>
  );
}

// ============================================
// Alert Components
// ============================================

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, onClose }: AlertProps) {
  const variants = {
    success: {
      bg: 'bg-success-100',
      border: 'border-l-success-500',
      titleColor: 'text-success-800',
      messageColor: 'text-success-700',
      icon: '✓',
    },
    warning: {
      bg: 'bg-warning-100',
      border: 'border-l-warning-500',
      titleColor: 'text-warning-800',
      messageColor: 'text-warning-700',
      icon: '⚠',
    },
    error: {
      bg: 'bg-error-100',
      border: 'border-l-error-500',
      titleColor: 'text-error-800',
      messageColor: 'text-error-700',
      icon: '✕',
    },
    info: {
      bg: 'bg-info-100',
      border: 'border-l-info-500',
      titleColor: 'text-info-800',
      messageColor: 'text-info-700',
      icon: 'ℹ',
    },
  };

  const variant = variants[type];

  return (
    <div className={`${variant.bg} border-l-4 ${variant.border} p-4 rounded-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{variant.icon}</span>
        <div className="flex-1">
          <h4 className={`font-semibold ${variant.titleColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${variant.messageColor}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-500 hover:text-secondary-900">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Form Input Component
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-secondary-900">
        {label} {props.required && <span className="text-error-500">*</span>}
      </label>

      <input
        id={inputId}
        className={`
          w-full
          border-2
          ${error ? 'border-error-500' : 'border-input'}
          bg-background
          text-foreground
          placeholder:text-muted-foreground
          focus:ring-2
          ${error ? 'focus:ring-error-500' : 'focus:ring-ring'}
          focus:border-transparent
          rounded-lg
          px-4 py-2.5
          transition-all
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ============================================
// Info Card Component
// ============================================

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'featured';
}

export function InfoCard({ title, children, variant = 'default' }: InfoCardProps) {
  if (variant === 'featured') {
    return (
      <div
        className="
          bg-primary-500
          text-secondary-900
          rounded-2xl
          p-6
          shadow-[0_10px_30px_rgba(6,16,31,0.12)]
        "
      >
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <div className="opacity-90">{children}</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-neutral-200 rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-secondary-900 mb-2">{title}</h4>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

// ============================================
// Progress Bar Component
// ============================================

interface ProgressBarProps {
  label: string;
  progress: number; // 0-100
  showPercentage?: boolean;
}

export function ProgressBar({ label, progress, showPercentage = true }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary-900 font-medium">{label}</span>
        {showPercentage && <span className="text-muted-foreground">{progress}%</span>}
      </div>
      <div className="bg-neutral-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Step Indicator Component
// ============================================

interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`
                w-10 h-10 rounded-full
                flex items-center justify-center
                font-semibold
                ${
                  step.status === 'completed'
                    ? 'bg-success-500 text-white'
                    : step.status === 'current'
                      ? 'bg-primary-500 text-secondary-900'
                      : 'bg-neutral-200 text-neutral-600'
                }
              `}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <span
              className={`
                text-xs
                ${
                  step.status === 'completed'
                    ? 'text-success-700'
                    : step.status === 'current'
                      ? 'text-primary-700'
                      : 'text-neutral-600'
                }
              `}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-1 mx-2
                ${step.status === 'completed' ? 'bg-success-500' : 'bg-neutral-200'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// Example Usage Demo
// ============================================

export function ColorSystemShowcase() {
  return (
    <div className="max-w-[1100px] mx-auto p-8 space-y-8 bg-neutral-50">
      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Service Cards */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Service Card</h2>
        <div className="max-w-sm">
          <ServiceCard
            title="Cazier Fiscal"
            description="Obține certificatul de cazier fiscal rapid și online, fără deplasări."
            price={49}
            icon={<span className="text-2xl">📄</span>}
            onOrder={() => alert('Comandă plasată!')}
          />
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="completed" label="Finalizat" />
          <StatusBadge status="pending" label="În Așteptare" />
          <StatusBadge status="processing" label="În Procesare" />
          <StatusBadge status="rejected" label="Respins" />
          <StatusBadge status="cancelled" label="Anulat" />
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Alerts</h2>
        <div className="space-y-4">
          <Alert type="success" title="Success!" message="Comanda a fost plasată cu succes." />
          <Alert type="warning" title="Atenție" message="Documentul necesită verificare." />
          <Alert type="error" title="Eroare" message="A apărut o eroare. Încercați din nou." />
          <Alert type="info" title="Informație" message="Procesarea durează 2-3 zile." />
        </div>
      </section>

      {/* Form Inputs */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Form Inputs</h2>
        <div className="max-w-md space-y-4">
          <Input label="Email" type="email" placeholder="nume@exemplu.ro" required />
          <Input
            label="Telefon"
            type="tel"
            error="Vă rugăm introduceți un număr valid"
            placeholder="0712345678"
          />
          <Input
            label="CNP"
            helperText="Introduceți cele 13 cifre ale CNP-ului"
            placeholder="1234567890123"
          />
        </div>
      </section>

      {/* Progress */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Progress Bar</h2>
        <div className="max-w-md">
          <ProgressBar label="Progres comandă" progress={60} />
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Step Indicator</h2>
        <div className="max-w-2xl">
          <StepIndicator
            steps={[
              { label: 'Comandă', status: 'completed' },
              { label: 'Plată', status: 'current' },
              { label: 'Confirmare', status: 'upcoming' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
