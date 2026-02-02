'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '../../../components/StatCard';
import ReportModal from '../../../components/ReportModal';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddIcon from '@mui/icons-material/Add';
import './home.css';

interface Activity {
  id: number;
  type: string;
  description: string;
  entityName: string;
  entityId?: number;
  createdAt: string;
  userId: number;
  workspaceId: number;
}

export default function HomePage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    totalCondominios: 0,
    manutencoesPendentes: 0,
    manutencoesAtrasadas: 0
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleAddCondominiumClick = () => {
    router.push('/pages/condominios?openModal=true');
  };

  const handleGenerateReportClick = () => {
    setIsReportModalOpen(true);
  };

  const loadActivities = async () => {
    try {
      const workspaceId = localStorage.getItem('workspaceId');
      const token = localStorage.getItem('token');
      
      if (!workspaceId || !token) {
        console.error('WorkspaceId ou token não encontrados');
        return;
      }

      const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/activities`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        const activitiesData = await response.json();
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');
        
        if (!workspaceId || !token) {
          console.error('WorkspaceId ou token não encontrados');
          return;
        }

        const qtdCondominios = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        const qtdManutencoesPendentes = await fetch(`${baseUrl}/workspaces/${workspaceId}/maintenances/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Status": "pendente"
          },
        });

        const qtdManutencoesAtrasadas = await fetch(`${baseUrl}/workspaces/${workspaceId}/maintenances/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Status": "atrasado"
          },
        });

        if (qtdCondominios.ok && qtdManutencoesPendentes.ok && qtdManutencoesAtrasadas.ok) {
          const condominiosData = await qtdCondominios.json();
          const manutencoesPendentesData = await qtdManutencoesPendentes.json();
          const manutencoesAtrasadasData = await qtdManutencoesAtrasadas.json();

          setDashboardData({
            totalCondominios: condominiosData || 0,
            manutencoesPendentes: manutencoesPendentesData || 0,
            manutencoesAtrasadas: manutencoesAtrasadasData || 0
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      }
    };

    loadDashboardData();
    loadActivities();
  }, [baseUrl]);

  const getActivityIcon = (type: string) => {
    const iconColor = getActivityColor(type);
    const iconStyle = { fontSize: '24px', color: iconColor === 'blue' ? '#3b82f6' : iconColor === 'green' ? '#10b981' : iconColor === 'red' ? '#ef4444' : iconColor === 'purple' ? '#8b5cf6' : iconColor === 'orange' ? '#f59e0b' : '#3b82f6' };
    
    switch (type) {
      case 'maintenance_created':
        return <AddIcon style={iconStyle} />;
      case 'maintenance_completed':
        return <CheckCircleIcon style={iconStyle} />;
      case 'maintenance_deleted':
        return <DeleteIcon style={iconStyle} />;
      case 'maintenance_auto_created':
        return <AutorenewIcon style={iconStyle} />;
      case 'condominium_created':
        return <BusinessIcon style={iconStyle} />;
      case 'condominium_deleted':
        return <BusinessIcon style={iconStyle} />;
      case 'report_generated':
        return <DescriptionIcon style={iconStyle} />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'maintenance_created':
        return 'blue';
      case 'maintenance_completed':
        return 'green';
      case 'maintenance_deleted':
        return 'red';
      case 'maintenance_auto_created':
        return 'purple';
      case 'condominium_created':
        return 'green';
      case 'condominium_deleted':
        return 'red';
      case 'report_generated':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  };

  const statsData = [
    {
      title: 'Condomínios Ativos',
      value: dashboardData.totalCondominios.toString(),
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      icon: <BusinessIcon />,
    },
    {
      title: 'Manutenções Pendentes',
      value: dashboardData.manutencoesPendentes.toString(),
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      icon: <WarningIcon />,
    },{
      title: 'Manutenções atrasadas',
      value: dashboardData.manutencoesAtrasadas.toString(),
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      icon: <ErrorIcon />,
    },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Dashboard</h1>
      </div>

      {/* Cards de estatísticas */}
      <div className="home-stats-grid">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            textColor={stat.textColor}
          />
        ))}
      </div>

      {/* Seção de ações rápidas */}
      <div className="home-actions-grid">
        <div className="home-card">
          <h3 className="home-card-title">Ações Rápidas</h3>
          <div className="home-actions-list">
            <button 
              className="home-action-button"
              onClick={handleAddCondominiumClick}
            >
              <div className="home-action-content">
                <BusinessIcon className="home-action-icon green" />
                <span className="home-action-text">Adicionar Novo Condomínio</span>
              </div>
            </button>
            <button 
              className="home-action-button"
              onClick={handleGenerateReportClick}
            >
              <div className="home-action-content">
                <DescriptionIcon className="home-action-icon purple" />
                <span className="home-action-text">Gerar Relatório Mensal</span>
              </div>
            </button>
          </div>
        </div>

        <div className="home-card">
          <h3 className="home-card-title">Atividades Recentes</h3>
          <div className="home-activities-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="home-activity-item">
                  <div className="home-activity-dot">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="home-activity-content">
                    <p className="home-activity-text">
                      {activity.description} <span className="home-activity-highlight">{activity.entityName}</span>
                    </p>
                    <p className="home-activity-time">{formatTimeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="home-activity-item">
                <div className="home-activity-dot blue"></div>
                <div className="home-activity-content">
                  <p className="home-activity-text">Nenhuma atividade recente encontrada</p>
                  <p className="home-activity-time">-</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}