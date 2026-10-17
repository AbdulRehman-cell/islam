import React from 'react';

/**
 * Reusable Card component matching design system rules
 */
export function Card({ children, className = '', elevated = false, ...props }) {
  const cardClass = `${elevated ? 'card-elevated' : 'card'} ${className}`.trim();
  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}

/**
 * Reusable Button component with design system classes
 */
export function Button({ children, variant = 'primary', className = '', ...props }) {
  let btnClass = 'btn-primary';
  if (variant === 'secondary') btnClass = 'btn-secondary';
  if (variant === 'ghost') btnClass = 'btn-ghost';
  
  return (
    <button className={`${btnClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

/**
 * Reusable Badge component for tags and status indicators
 */
export function Badge({ children, variant = 'info', className = '', ...props }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

/**
 * Empty state container when list or bookmarks are empty
 */
export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`empty-state card ${className}`.trim()} style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '2rem 0' }}>
      {icon && <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}>{icon}</div>}
      {title && <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>}
      {description && <p style={{ color: 'var(--text-muted, #718096)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Loading spinner matching app theme
 */
export function Spinner({ size = 'medium', className = '' }) {
  const dimensions = size === 'small' ? '20px' : size === 'large' ? '48px' : '32px';
  return (
    <div className={`spinner-container ${className}`.trim()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div
        className="spinner"
        style={{
          width: dimensions,
          height: dimensions,
          border: '3px solid rgba(197, 160, 89, 0.2)',
          borderTopColor: 'var(--accent, #c5a059)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
    </div>
  );
}

/**
 * Alert banner component for errors, success, or info messages
 */
export function Alert({ children, type = 'info', className = '', ...props }) {
  return (
    <div className={`alert alert-${type} ${className}`.trim()} role="alert" {...props}>
      {children}
    </div>
  );
}

// Default export containing all UI components
export default {
  Card,
  Button,
  Badge,
  EmptyState,
  Spinner,
  Alert
};