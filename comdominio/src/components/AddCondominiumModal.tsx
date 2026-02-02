'use client';

import React from 'react';

interface CondominiumFormData {
    name: string;
    cnpj: string;
    address: string;
    units: number;
    phone?: string;
}

interface AddCondominiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CondominiumFormData) => Promise<void>;
    loading?: boolean;
    existingCondominiums: Array<{
        id: number;
        name: string;
        address: string;
        cnpj: string;
        units: number;
        pendingMaintenanceAmount: number;
        overdueMaintenanceAmount: number;
    }>;
}

export default function AddCondominiumModal({ isOpen, onClose, onSubmit, loading = false, existingCondominiums }: AddCondominiumModalProps) {
    const [formData, setFormData] = React.useState<CondominiumFormData>({
        name: '',
        cnpj: '',
        address: '',
        units: 0,
        phone: ''
    });

    const [errors, setErrors] = React.useState({
        name: '',
        cnpj: '',
        address: '',
        units: '',
        phone: ''
    });

    const formatCNPJ = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 2) {
            return cleanValue;
        } else if (cleanValue.length <= 5) {
            return cleanValue.replace(/(\d{2})(\d+)/, '$1.$2');
        } else if (cleanValue.length <= 8) {
            return cleanValue.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
        } else if (cleanValue.length <= 12) {
            return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
        } else {
            return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        }
    };

    const formatPhone = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 2) {
            return cleanValue;
        } else if (cleanValue.length <= 7) {
            return cleanValue.replace(/(\d{2})(\d+)/, '($1) $2');
        } else {
            return cleanValue.replace(/(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Aplicar formatação específica para cada campo
        if (name === 'cnpj') {
            const formattedCNPJ = formatCNPJ(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedCNPJ
            }));
        } else if (name === 'phone') {
            const formattedPhone = formatPhone(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
        } else if (name === 'units') {
            const unitsValue = parseInt(value) || 0;
            setFormData(prev => ({
                ...prev,
                [name]: unitsValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (name === 'name' && value.trim()) {
            const duplicateName = existingCondominiums.find(
                condominium => condominium.name.toLowerCase() === value.trim().toLowerCase()
            );
            if (duplicateName) {
                setErrors(prev => ({
                    ...prev,
                    name: 'Já existe um condomínio com este nome'
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            cnpj: '',
            address: '',
            units: '',
            phone: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else {
            const duplicateName = existingCondominiums.find(
                condominium => condominium.name.toLowerCase() === formData.name.trim().toLowerCase()
            );
            if (duplicateName) {
                newErrors.name = 'Já existe um condomínio com este nome';
            }
        }

        if (!formData.cnpj.trim()) {
            newErrors.cnpj = 'CNPJ é obrigatório';
        } else {
            const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
            if (cnpjNumbers.length !== 14) {
                newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
            }
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Endereço é obrigatório';
        }

        if (!formData.units || formData.units < 1) {
            newErrors.units = 'Número de unidades deve ser maior que zero';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
            setFormData({
                name: '',
                cnpj: '',
                address: '',
                units: 0,
                phone: ''
            });
            setErrors({
                name: '',
                cnpj: '',
                address: '',
                units: '',
                phone: ''
            });
        } catch (error) {
            console.error('Erro ao adicionar condomínio:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            cnpj: '',
            address: '',
            units: 0,
            phone: ''
        });
        setErrors({
            name: '',
            cnpj: '',
            address: '',
            units: '',
            phone: ''
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
                        Adicionar Condomínio
                    </h2>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            cursor: 'pointer',
                            color: '#666',
                            padding: 0,
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        disabled={loading}
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
                            Nome do Condomínio *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 12,
                                border: `1px solid ${errors.name ? '#ff4444' : '#ddd'}`,
                                borderRadius: 4,
                                fontSize: 14,
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            placeholder="Digite o nome do condomínio"
                        />
                        {errors.name && (
                            <span style={{
                                color: '#ff4444',
                                fontSize: 12,
                                marginTop: 4,
                                display: 'block'
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
                            CNPJ *
                        </label>
                        <input
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            maxLength={18}
                            style={{
                                width: '100%',
                                padding: 12,
                                border: `1px solid ${errors.cnpj ? '#ff4444' : '#ddd'}`,
                                borderRadius: 4,
                                fontSize: 14,
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj && (
                            <span style={{
                                color: '#ff4444',
                                fontSize: 12,
                                marginTop: 4,
                                display: 'block'
                            }}>
                                {errors.cnpj}
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
                            Endereço *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 12,
                                border: `1px solid ${errors.address ? '#ff4444' : '#ddd'}`,
                                borderRadius: 4,
                                fontSize: 14,
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            placeholder="Digite o endereço completo"
                        />
                        {errors.address && (
                            <span style={{
                                color: '#ff4444',
                                fontSize: 12,
                                marginTop: 4,
                                display: 'block'
                            }}>
                                {errors.address}
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
                            Telefone da Portaria
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            disabled={loading}
                            maxLength={15} // (XX) XXXXX-XXXX = 15 caracteres
                            style={{
                                width: '100%',
                                padding: 12,
                                border: `1px solid ${errors.phone ? '#ff4444' : '#ddd'}`,
                                borderRadius: 4,
                                fontSize: 14,
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            placeholder="(00) 00000-0000"
                        />
                        {errors.phone && (
                            <span style={{
                                color: '#ff4444',
                                fontSize: 12,
                                marginTop: 4,
                                display: 'block'
                            }}>
                                {errors.phone}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 4,
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#333',
                        }}>
                            Número de Unidades *
                        </label>
                        <input
                            type="number"
                            name="units"
                            value={formData.units || ''}
                            onChange={handleInputChange}
                            required
                            min="1"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 12,
                                border: `1px solid ${errors.units ? '#ff4444' : '#ddd'}`,
                                borderRadius: 4,
                                fontSize: 14,
                                boxSizing: 'border-box',
                                color: '#333',
                            }}
                            placeholder="Número de unidades"
                        />
                        {errors.units && (
                            <span style={{
                                color: '#ff4444',
                                fontSize: 12,
                                marginTop: 4,
                                display: 'block'
                            }}>
                                {errors.units}
                            </span>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: 12,
                        justifyContent: 'flex-end',
                    }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                background: 'white',
                                color: '#666',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold',
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || Object.values(errors).some(error => error !== '')}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: 4,
                                background: (loading || Object.values(errors).some(error => error !== '')) ? '#ccc' : '#2196f3',
                                color: 'white',
                                cursor: (loading || Object.values(errors).some(error => error !== '')) ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold',
                            }}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}