export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="empty-state">
    <Icon size={64} strokeWidth={1.5} />
    <h3>{title}</h3>
    <p>{message}</p>
    {action && (
      <button className="btn-primary" onClick={action.onClick}>{action.label}</button>
    )}
  </div>
);