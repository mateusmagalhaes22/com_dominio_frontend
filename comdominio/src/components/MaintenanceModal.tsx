'use client';

import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface Maintenance {
    id: number;
    name: string;
    description: string;
    status: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    isRecurring?: boolean;
    recurringPeriod?: string;
    nextRecurrenceDate?: string;
}

interface MaintenanceEditData {
    name: string;
    description: string;
    endDate: string;
    status: string;
    isRecurring: boolean;
    recurringPeriod: string;
}

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    maintenance: Maintenance | null;
    onUpdate: (id: number, data: MaintenanceEditData) => Promise<void>;
    isLoading?: boolean;
    existingMaintenances: Maintenance[];
}

export default function MaintenanceModal({ 
    isOpen, 
    onClose, 
    maintenance,
    onUpdate, 
    isLoading = false,
    existingMaintenances 
}: MaintenanceModalProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState<MaintenanceEditData>({
        name: '',
        description: '',
        endDate: '',
        status: 'pendente',
        isRecurring: false,
        recurringPeriod: ''
    });

    const [errors, setErrors] = React.useState({
        name: ''
    });

    // Atualizar formData quando maintenance muda
    React.useEffect(() => {
        if (maintenance) {
            setFormData({
                name: maintenance.name || '',
                description: maintenance.description || '',
                endDate: maintenance.endDate ? maintenance.endDate.split('T')[0] : '',
                status: maintenance.status || 'pendente',
                isRecurring: maintenance.isRecurring || false,
                recurringPeriod: maintenance.recurringPeriod || ''
            });
        }
    }, [maintenance]);

    const validateName = (name: string): string => {
        if (!name.trim()) {
            return 'Nome é obrigatório';
        }
        if (name.trim().length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        
        // Verificar se já existe uma manutenção com o mesmo nome (excluindo a atual)
        const existingMaintenance = existingMaintenances.find(
            m => m.name.toLowerCase() === name.trim().toLowerCase() && m.id !== maintenance?.id
        );
        if (existingMaintenance) {
            return 'Já existe uma manutenção com este nome';
        }
        
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!maintenance) return;

        const nameError = validateName(formData.name);

        setErrors({
            name: nameError
        });

        if (nameError) {
            return;
        }

        try {
            await onUpdate(maintenance.id, {
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim()
            });
            
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao atualizar manutenção:', error);
        }
    };

    const handleClose = () => {
        setIsEditing(false);
        setErrors({
            name: ''
        });
        onClose();
    };

    const handleCancelEdit = () => {
        if (maintenance) {
            setFormData({
                name: maintenance.name || '',
                description: maintenance.description || '',
                endDate: maintenance.endDate ? maintenance.endDate.split('T')[0] : '',
                status: maintenance.status || 'pendente',
                isRecurring: maintenance.isRecurring || false,
                recurringPeriod: maintenance.recurringPeriod || ''
            });
        }
        setErrors({
            name: ''
        });
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Não definido';
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

    if (!isOpen || !maintenance) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 24,
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#333',
                    }}>
                        {isEditing ? 'Editar Manutenção' : 'Detalhes da Manutenção'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={isLoading}
                                style={{
                                    background: '#2196f3',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: 'white',
                                    padding: '6px 12px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                <EditIcon style={{ fontSize: 16 }} />
                                Editar
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 24,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                color: '#666',
                                padding: 0,
                                width: 30,
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 4,
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                            }}>
                                Nome da Manutenção
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333'
                                }}
                            />
                            {errors.name && (
                                <span style={{
                                    display: 'block',
                                    color: '#f44336',
                                    fontSize: 12,
                                    marginTop: 4
                                }}>
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 4,
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                            }}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="feito">Feito</option>
                                <option value="atrasado">Atrasado</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 4,
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                            }}>
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                disabled={isLoading}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                    color: '#333'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 4,
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                            }}>
                                Data de Prazo
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                required
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        isRecurring: e.target.checked,
                                        recurringPeriod: e.target.checked ? formData.recurringPeriod : ''
                                    })}
                                    disabled={isLoading}
                                    style={{
                                        marginRight: 8,
                                        cursor: 'pointer'
                                    }}
                                />
                                Manutenção recorrente
                            </label>
                        </div>

                        {formData.isRecurring && (
                            <div style={{ marginBottom: 24 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 4,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: '#333',
                                }}>
                                    Período de Recorrência
                                </label>
                                <select
                                    value={formData.recurringPeriod}
                                    onChange={(e) => setFormData({...formData, recurringPeriod: e.target.value})}
                                    required={formData.isRecurring}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#333',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Selecione o período</option>
                                    <option value="1_month">1 mês</option>
                                    <option value="6_months">6 meses</option>
                                    <option value="1_year">1 ano</option>
                                </select>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    backgroundColor: 'white',
                                    color: '#333',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                <CancelIcon style={{ fontSize: 16 }} />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: 4,
                                    backgroundColor: isLoading ? '#ccc' : '#4caf50',
                                    color: 'white',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                <SaveIcon style={{ fontSize: 16 }} />
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 16,
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: 18,
                                    color: '#333'
                                }}>
                                    Nome: {maintenance.name}
                                </h3>
                                <span
                                    style={{
                                        background: getStatusColor(maintenance.status),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {maintenance.status}
                                </span>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <strong style={{ color: '#333' }}>Descrição:</strong>
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    color: '#666',
                                    lineHeight: 1.5
                                }}>
                                    {maintenance.description || '-'}
                                </p>
                            </div>

                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 16,
                                marginBottom: 16
                            }}>
                                <div>
                                    <strong style={{ color: '#333' }}>Prazo:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        {formatDate(maintenance.endDate || '')}
                                    </p>
                                </div>
                                <div>
                                    <strong style={{ color: '#333' }}>Criado em:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        {formatDate(maintenance.createdAt || '')}
                                    </p>
                                </div>
                                <div>
                                    <strong style={{ color: '#333' }}>Última atualização:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        {formatDate(maintenance.updatedAt || '')}
                                    </p>
                                </div>
                                {maintenance.isRecurring && (
                                    <div>
                                        <strong style={{ color: '#333' }}>Recorrência:</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                            {formatRecurringPeriod(maintenance.recurringPeriod || '')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {maintenance.isRecurring && maintenance.nextRecurrenceDate && (
                                <div style={{ marginBottom: 16 }}>
                                    <strong style={{ color: '#333' }}>Próxima manutenção será criada em:</strong>
                                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                        {formatDate(maintenance.nextRecurrenceDate)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}