'use client';

import React from 'react';

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

interface MaintenanceFormData {
    name: string;
    description: string;
    endDate: string;
    status: string;
    isRecurring: boolean;
    recurringPeriod: string;
}

interface AddMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MaintenanceFormData) => Promise<void>;
    isLoading?: boolean;
    existingMaintenances: Maintenance[];
}

export default function AddMaintenanceModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading = false,
    existingMaintenances 
}: AddMaintenanceModalProps) {
    const [formData, setFormData] = React.useState<MaintenanceFormData>({
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

    const validateName = (name: string): string => {
        if (!name.trim()) {
            return 'Nome é obrigatório';
        }
        if (name.trim().length < 3) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        
        // Verificar se já existe uma manutenção com o mesmo nome
        const existingMaintenance = existingMaintenances.find(
            m => m.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (existingMaintenance) {
            return 'Já existe uma manutenção com este nome';
        }
        
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const nameError = validateName(formData.name);

        setErrors({
            name: nameError
        });

        if (nameError) {
            return;
        }

        try {
            await onSubmit({
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: 'pendente'
            });
            
            handleClose();
        } catch (error) {
            console.error('Erro ao criar manutenção:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            endDate: '',
            status: 'pendente',
            isRecurring: false,
            recurringPeriod: ''
        });
        setErrors({
            name: ''
        });
        onClose();
    };

    if (!isOpen) return null;

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
                maxWidth: 500,
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
                        Adicionar Manutenção
                    </h2>
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
                            onClick={handleClose}
                            disabled={isLoading}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                backgroundColor: 'white',
                                color: '#333',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: 4,
                                backgroundColor: isLoading ? '#ccc' : '#2196f3',
                                color: 'white',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold'
                            }}
                        >
                            {isLoading ? 'Adicionando...' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}