import React from 'react';

export function Card({ children, className = '', elevated = false, ...props }) {
  const cardClass = `${elevated ? 'card-elevated' : 'card'} ${className}`.trim();
  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', disabled = false, ...props }) {
  let btnClass = 'btn-primary';
  if (variant === 'secondary') btnClass = 'btn-secondary';
  if (variant === 'ghost') btnClass = 'btn-ghost';
  return (
    <button className={`${btnClass} ${className}`.trim()} disabled={disabled} style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'info', className = '', ...props }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

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

export function Alert({ children, type = 'info', className = '', ...props }) {
  return (
    <div className={`alert alert-${type} ${className}`.trim()} role="alert" {...props}>
      {children}
    </div>
  );
}

export function Input({ className = '', style = {}, ...props }) {
  return (
    <input
      className={className}
      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, rgba(197,160,89,.3))', borderRadius: '8px', fontSize: '.9375rem', background: 'var(--surface, rgba(255,255,255,.05))', color: 'var(--text, #fff)', outline: 'none', ...style }}
      {...props}
    />
  );
}

export function Select({ children, className = '', style = {}, ...props }) {
  return (
    <select
      className={className}
      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, rgba(197,160,89,.3))', borderRadius: '8px', fontSize: '.9375rem', background: 'var(--surface, rgba(20,20,20,.95))', color: 'var(--text, #fff)', outline: 'none', cursor: 'pointer', ...style }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', style = {}, ...props }) {
  return (
    <textarea
      className={className}
      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border, rgba(197,160,89,.3))', borderRadius: '8px', fontSize: '.9375rem', background: 'var(--surface, rgba(255,255,255,.05))', color: 'var(--text, #fff)', outline: 'none', resize: 'vertical', minHeight: '100px', ...style }}
      {...props}
    />
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)' }} onClick={onClose}>
      <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ marginBottom: '1rem' }}>{title}</h3>}
        {children}
        <button className="btn-ghost" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
      </div>
    </div>
  );
}

export function Stat({ value, label, icon, className = '' }) {
  return (
    <div className={`stat ${className}`.trim()} style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface, rgba(255,255,255,.04))', borderRadius: '12px', border: '1px solid var(--border, rgba(197,160,89,.2))' }}>
      {icon && <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{icon}</div>}
      <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--accent, #c5a059)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '.875rem', color: 'var(--text-muted, #aaa)', marginTop: '.35rem' }}>{label}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`page-header ${className}`.trim()} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700 }}>{title}</h1>
        {subtitle && <p style={{ margin: '.35rem 0 0', color: 'var(--text-muted, #aaa)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

export function Table({ columns = [], rows = [], className = '' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={`table ${className}`.trim()} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9375rem' }}>
        <thead>
          <tr>{columns.map((col, i) => <th key={i} style={{ padding: '.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--border, rgba(197,160,89,.2))', fontWeight: 600, color: 'var(--text-muted, #aaa)', whiteSpace: 'nowrap' }}>{typeof col === 'string' ? col : col.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--border, rgba(197,160,89,.1))' }}>
              {columns.map((col, ci) => <td key={ci} style={{ padding: '.75rem 1rem' }}>{typeof col === 'string' ? row[col] : (col.accessor ? row[col.accessor] : row[ci])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs = [], active, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`.trim()} style={{ display: 'flex', gap: '.25rem', borderBottom: '2px solid var(--border, rgba(197,160,89,.2))', marginBottom: '1.5rem' }}>
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id;
        const label = typeof tab === 'string' ? tab : tab.label;
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange?.(id)} style={{ padding: '.6rem 1.25rem', background: 'none', border: 'none', borderBottom: isActive ? '2px solid var(--accent, #c5a059)' : '2px solid transparent', marginBottom: '-2px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--accent, #c5a059)' : 'var(--text-muted, #aaa)', cursor: 'pointer', borderRadius: '4px 4px 0 0', transition: 'all .15s' }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function toast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#374151' };
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;color:#fff;font-size:14px;font-weight:500;background:${colors[type] || colors.info};box-shadow:0 4px 16px rgba(0,0,0,.3);transition:opacity .3s;`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}
toast.success = (m) => toast(m, 'success');
toast.error = (m) => toast(m, 'error');
toast.warning = (m) => toast(m, 'warning');
toast.info = (m) => toast(m, 'info');

export default { Card, Button, Badge, EmptyState, Spinner, Alert, Input, Select, Textarea, Modal, Stat, PageHeader, Table, Tabs, toast };
