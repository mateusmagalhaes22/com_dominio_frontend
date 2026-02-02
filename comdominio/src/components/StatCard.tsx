import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor = 'bg-blue-100', 
  textColor = 'text-blue-600',
  className = ''
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <div className={`stat-card-icon-container ${bgColor}`}>
            <div className={`stat-card-icon ${textColor}`}>
              {icon}
            </div>
          </div>
          <div className="stat-card-details">
            <p className="stat-card-title">{title}</p>
            <p className="stat-card-value">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}