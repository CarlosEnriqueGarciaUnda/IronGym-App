export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="ig-page-header">
      <div>
        <p className="eyebrow">IRON GYM</p>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {action && <div className="ig-header-actions">{action}</div>}
    </div>
  );
}
