'use client';

import React from "react";
import { useRouter, useParams } from 'next/navigation';
import AddMaintenanceModal from '../../../../../components/AddMaintenanceModal';
import MaintenanceModal from '../../../../../components/MaintenanceModal';
import { generateIdempotencyKeySync } from '../../../../../utils/idempotency';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './manutencoes.css';

interface Maintenance {
    name: string;
    createdAt: string;
    updatedAt: string;
    id: number;
    description: string;
    status: string;
    endDate: string;
    isRecurring?: boolean;
    recurringPeriod?: string;
    nextRecurrenceDate?: string;
}

interface Condominium {
    id: number;
    name: string;
    address: string;
}

export default function MaintenancesPage() {
    const router = useRouter();
    const params = useParams();
    const condominiumId = params.id;
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const [maintenances, setMaintenances] = React.useState<Maintenance[]>([]);
    const [condominium, setCondominium] = React.useState<Condominium | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isAddingMaintenance, setIsAddingMaintenance] = React.useState(false);
    const [deletingMaintenanceId, setDeletingMaintenanceId] = React.useState<number | null>(null);
    const [completingMaintenanceId, setCompletingMaintenanceId] = React.useState<number | null>(null);
    const [selectedMaintenance, setSelectedMaintenance] = React.useState<Maintenance | null>(null);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = React.useState(false);
    const [isUpdatingMaintenance, setIsUpdatingMaintenance] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            const workspaceId = localStorage.getItem('workspaceId');
            const token = localStorage.getItem('token');

            try {
                const condoResponse = await fetch(
                    `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (condoResponse.ok) {
                    const condoData = await condoResponse.json();
                    setCondominium(condoData);
                }

                const maintenanceResponse = await fetch(
                    `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (maintenanceResponse.ok) {
                    const maintenanceData = await maintenanceResponse.json();
                    setMaintenances(maintenanceData);
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        if (condominiumId) {
            fetchData();
        }
    }, [condominiumId, baseUrl]);

    const handleAddMaintenance = async (formData: {
        name: string;
        description: string;
        status: string;
        endDate: string;
        isRecurring: boolean;
        recurringPeriod: string;
    }) => {
        // Verificar se já existe uma manutenção com o mesmo nome
        const existingMaintenance = maintenances.find(
            maintenance => maintenance.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (existingMaintenance) {
            alert('Já existe uma manutenção com este nome. Por favor, escolha um nome diferente.');
            return;
        }

        setIsAddingMaintenance(true);
        
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        try {
            // Preparar dados, removendo recurringPeriod se isRecurring for false
            const dataToSend: any = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                endDate: formData.endDate,
                isRecurring: formData.isRecurring
            };

            // Só adicionar recurringPeriod se for recorrente e tiver valor
            if (formData.isRecurring && formData.recurringPeriod) {
                dataToSend.recurringPeriod = formData.recurringPeriod;
            }

            const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': generateIdempotencyKeySync(formData.name, formData.endDate)
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                
                const maintenanceResponse = await fetch(
                    `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (maintenanceResponse.ok) {
                    const maintenanceData = await maintenanceResponse.json();
                    setMaintenances(maintenanceData);
                    
                    // Fechar o modal após sucesso
                    setIsModalOpen(false);
                } else {
                    console.error('Erro ao buscar manutenções atualizadas:', maintenanceResponse.statusText);
                    alert('Manutenção criada, mas erro ao atualizar lista');
                }
            } else {
                const errorText = await response.text();
                console.error('Erro ao criar manutenção:', response.status, response.statusText, errorText);
                alert(`Erro ao criar manutenção: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao criar manutenção:', error);
            alert('Erro ao criar manutenção');
        } finally {
            setIsAddingMaintenance(false);
        }
    };

    const handleDeleteMaintenance = async (maintenanceId: number) => {
        if (!confirm('Tem certeza que deseja deletar esta manutenção?')) {
            return;
        }

        setDeletingMaintenanceId(maintenanceId);
        
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances/${maintenanceId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                // Remove from local state
                setMaintenances(prevMaintenances => 
                    prevMaintenances.filter(m => m.id !== maintenanceId)
                );
            } else {
                console.error('Erro ao deletar manutenção:', response.statusText);
                alert('Erro ao deletar manutenção');
            }
        } catch (error) {
            console.error('Erro ao deletar manutenção:', error);
            alert('Erro ao deletar manutenção');
        } finally {
            setDeletingMaintenanceId(null);
        }
    };

    const handleCompleteMaintenance = async (maintenanceId: number) => {
        setCompletingMaintenanceId(maintenanceId);
        
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances/${maintenanceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'feito' })
                }
            );

            if (response.ok) {
                setMaintenances(prevMaintenances => 
                    prevMaintenances.map(m => 
                        m.id === maintenanceId 
                            ? { ...m, status: 'feito' }
                            : m
                    )
                );
            } else {
                console.error('Erro ao concluir manutenção:', response.statusText);
                alert('Erro ao concluir manutenção');
            }
        } catch (error) {
            console.error('Erro ao concluir manutenção:', error);
            alert('Erro ao concluir manutenção');
        } finally {
            setCompletingMaintenanceId(null);
        }
    };

    const handleUpdateMaintenance = async (maintenanceId: number, formData: {
        name: string;
        description: string;
        status: string;
        endDate: string;
        isRecurring: boolean;
        recurringPeriod: string;
    }) => {
        setIsUpdatingMaintenance(true);
        
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        try {
            // Preparar dados, removendo recurringPeriod se isRecurring for false
            const dataToSend: any = {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                endDate: formData.endDate,
                isRecurring: formData.isRecurring
            };

            // Só adicionar recurringPeriod se for recorrente e tiver valor
            if (formData.isRecurring && formData.recurringPeriod) {
                dataToSend.recurringPeriod = formData.recurringPeriod;
            }

            console.log('Dados sendo enviados para atualização:', dataToSend);

            const response = await fetch(
                `${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}/maintenances/${maintenanceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSend)
                }
            );

            if (response.ok) {
                const updatedMaintenance = await response.json();
                
                // Atualizar a lista local
                setMaintenances(prevMaintenances => 
                    prevMaintenances.map(m => 
                        m.id === maintenanceId 
                            ? { ...m, ...updatedMaintenance }
                            : m
                    )
                );

                // Atualizar a manutenção selecionada se for a mesma
                if (selectedMaintenance && selectedMaintenance.id === maintenanceId) {
                    setSelectedMaintenance({ ...selectedMaintenance, ...updatedMaintenance });
                }
            } else {
                let errorMessage = `${response.status} - ${response.statusText}`;
                try {
                    const errorText = await response.text();
                    console.error('Erro ao atualizar manutenção:', response.status, response.statusText, errorText);
                    
                    // Tentar parsear como JSON para mais detalhes
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.message) {
                            errorMessage += `\nDetalhes: ${errorJson.message}`;
                        }
                    } catch (parseError) {
                        if (errorText) {
                            errorMessage += `\nDetalhes: ${errorText}`;
                        }
                    }
                } catch (readError) {
                    console.error('Erro ao ler resposta de erro:', readError);
                }
                
                alert(`Erro ao atualizar manutenção: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar manutenção:', error);
            alert('Erro ao atualizar manutenção');
        } finally {
            setIsUpdatingMaintenance(false);
        }
    };

    const handleOpenMaintenanceModal = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setIsMaintenanceModalOpen(true);
    };

    const handleCloseMaintenanceModal = () => {
        setSelectedMaintenance(null);
        setIsMaintenanceModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return '#ffd900ff';
            case 'feito':
                return '#1a9641';
            case 'atrasado':
                return '#f32121ff';
            default:
                return '#ffd900ff';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatRecurringPeriod = (period: string) => {
        switch (period) {
            case '1_month':
                return '1 mês';
            case '6_months':
                return '6 meses';
            case '1_year':
                return '1 ano';
            default:
                return period;
        }
    };

    if (loading) {
        return (
            <div className="maintenances-loading">
                <p className="maintenances-loading-text">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="maintenances-container">
            <div className="maintenances-header">
                <div className="maintenances-header-left">
                    <button
                        onClick={() => router.back()}
                        className="maintenances-back-button"
                    >
                        <ArrowBackIcon style={{ fontSize: 18 }} />
                        Voltar
                    </button>
                    <div>
                        <h1 className="maintenances-title">
                            Manutenções
                        </h1>
                        {condominium && (
                            <p className="maintenances-subtitle">
                                {condominium.name}
                            </p>
                        )}
                    </div>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="maintenances-add-button"
                >
                    <AddIcon style={{ fontSize: 18 }} />
                    Adicionar Manutenção
                </button>
            </div>

            {maintenances.length === 0 ? (
                <div className="maintenances-empty">
                    <p className="maintenances-empty-text">
                        Nenhuma manutenção encontrada para este condomínio.
                    </p>
                </div>
            ) : (
                <div className="maintenances-list">
                    {maintenances.map((maintenance) => (
                        <div 
                            key={maintenance.id} 
                            className="maintenance-card"
                            onClick={() => handleOpenMaintenanceModal(maintenance)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="maintenance-content">
                                <div className="maintenance-info-section">
                                    <h3 className="maintenance-title">
                                        {maintenance.name}
                                    </h3>
                                    <span className="maintenance-date-item">
                                        <strong>Prazo:</strong> {maintenance.endDate ? formatDate(maintenance.endDate) : 'Não definido'}
                                    </span>
                                    <span className="maintenance-date-item">
                                        <strong>Criado em:</strong> {maintenance.createdAt ? formatDate(maintenance.createdAt) : 'Não definido'}
                                    </span>
                                    <span className="maintenance-date-item">
                                        <strong>Última atualização:</strong> {maintenance.updatedAt ? formatDate(maintenance.updatedAt) : 'Não definido'}
                                    </span>
                                </div>
                                
                                <div className="maintenance-actions">
                                    {maintenance.status !== 'feito' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompleteMaintenance(maintenance.id);
                                            }}
                                            disabled={completingMaintenanceId === maintenance.id}
                                            className={`maintenance-action-btn maintenance-complete-btn ${
                                                completingMaintenanceId === maintenance.id ? 'disabled' : ''
                                            }`}
                                        >
                                            {completingMaintenanceId === maintenance.id ? (
                                                "Concluindo..."
                                            ) : (
                                                <>
                                                    <CheckIcon style={{ fontSize: 16, marginRight: 4 }} />
                                                    Concluir
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMaintenance(maintenance.id);
                                        }}
                                        disabled={deletingMaintenanceId === maintenance.id}
                                        className={`maintenance-action-btn maintenance-delete-btn ${
                                            deletingMaintenanceId === maintenance.id ? 'disabled' : ''
                                        }`}
                                    >
                                        {deletingMaintenanceId === maintenance.id ? (
                                            "Deletando..."
                                        ) : (
                                            <>
                                                <DeleteIcon style={{ fontSize: 16, marginRight: 4 }} />
                                                Deletar
                                            </>
                                        )}
                                    </button>
                                </div>
                                <span
                                    className="maintenance-status-badge"
                                    style={{ background: getStatusColor(maintenance.status) }}
                                >
                                    {maintenance.status}
                                </span>
                            </div>
                            <div className="maintenance-recurring-section">
                                {maintenance.isRecurring && (
                                    <>
                                        <span className="maintenance-date-item maintenance-recurring">
                                            <strong>Recorrência:</strong> {formatRecurringPeriod(maintenance.recurringPeriod || '')}
                                        </span>
                                        {maintenance.nextRecurrenceDate && (
                                            <span className="maintenance-date-item maintenance-next-recurrence">
                                                <strong>Próxima manutenção será criada em:</strong> {formatDate(maintenance.nextRecurrenceDate)}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="maintenance-description">
                                {maintenance.description}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <AddMaintenanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddMaintenance}
                isLoading={isAddingMaintenance}
                existingMaintenances={maintenances}
            />
            
            <MaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={handleCloseMaintenanceModal}
                maintenance={selectedMaintenance}
                onUpdate={handleUpdateMaintenance}
                isLoading={isUpdatingMaintenance}
                existingMaintenances={maintenances}
            />
        </div>
    );
}