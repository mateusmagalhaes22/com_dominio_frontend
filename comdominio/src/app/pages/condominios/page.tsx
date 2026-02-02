'use client';

import React from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import AddCondominiumModal from '../../../components/AddCondominiumModal';
import { generateIdempotencyKeySync } from '../../../utils/idempotency';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import './condominios.css';

interface Condominium {
    id: number;
    name: string;
    address: string;
    cnpj: string;
    phone?: string;
    units: number;
    pendingMaintenanceAmount: number;
    overdueMaintenanceAmount: number;
}

export default function ComdominiumsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const [condominiums, setCondominiums] = React.useState<Condominium[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [deletingCondominiumId, setDeletingCondominiumId] = React.useState<number | null>(null);

    const handleCondominiumClick = (condominiumId: number) => {
        if (condominiumId && condominiumId !== undefined) {
            router.push(`/pages/condominios/${condominiumId}/manutencoes`);
        } else {
            console.error('Invalid condominium ID:', condominiumId);
            alert('Erro: ID do condomínio não encontrado');
        }
    };

    const handleAddCondominium = async (formData: {name: string, cnpj: string, address: string, units: number, phone?: string}) => {
        const existingCondominium = condominiums.find(
            condominium => condominium.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (existingCondominium) {
            alert('Já existe um condomínio com este nome. Por favor, escolha um nome diferente.');
            return;
        }

        setLoading(true);
        
        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        const requestBody = {
            name: formData.name,
            cnpj: formData.cnpj,
            address: formData.address,
            units: formData.units,
            phone: formData.phone,
            workspaceId: parseInt(workspaceId || '0')
        };

        try {
            const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': generateIdempotencyKeySync(formData.name, formData.cnpj)
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const updatedResponse = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (updatedResponse.ok) {
                    const updatedData = await updatedResponse.json();
                    setCondominiums(Array.isArray(updatedData) ? updatedData : []);
                } else {
                    console.error('Erro ao buscar condomínios atualizados:', updatedResponse.statusText);
                }
                
                setIsModalOpen(false);
                alert('Condomínio adicionado com sucesso!');
            } else {
                const errorData = await response.json();
                alert(`Erro ao adicionar condomínio: ${errorData.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar condomínio:', error);
            alert('Erro ao adicionar condomínio. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCondominium = async (condominiumId: number, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!confirm(`Tem certeza que deseja deletar este condomínio? Esta ação não pode ser desfeita e todas as manutenções associadas também serão removidas.`)) {
            return;
        }

        setDeletingCondominiumId(condominiumId);

        const workspaceId = localStorage.getItem('workspaceId');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums/${condominiumId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setCondominiums(prevCondominiums => 
                    prevCondominiums.filter(c => c.id !== condominiumId)
                );
                alert('Condomínio removido com sucesso!');
            } else {
                const errorData = await response.json();
                console.error('Erro ao deletar condomínio:', errorData);
                alert(`Erro ao remover condomínio: ${errorData.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao deletar condomínio:', error);
            alert('Erro ao remover condomínio. Tente novamente.');
        } finally {
            setDeletingCondominiumId(null);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const workspaceId = localStorage.getItem('workspaceId');
                const token = localStorage.getItem('token');

                const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setCondominiums(Array.isArray(data) ? data : []);
                } else {
                    console.error('Erro ao buscar condomínios:', response.statusText);
                    setCondominiums([]);
                }
            } catch (error) {
                console.error('Erro ao buscar condomínios:', error);
                setCondominiums([]);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [baseUrl]);

    // Detecta se deve abrir o modal automaticamente baseado no parâmetro da URL
    React.useEffect(() => {
        const openModal = searchParams.get('openModal');
        if (openModal === 'true') {
            setIsModalOpen(true);
            // Remove o parâmetro da URL após abrir o modal
            const url = new URL(window.location.href);
            url.searchParams.delete('openModal');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    if (isLoadingData) {
        return (
            <div className="condominios-loading">
                <p>Carregando condomínios...</p>
            </div>
        );
    }

    return (
        <div className="condominios-container">
            <div className="condominios-header">
                <h1 className="condominios-title">
                    Condomínios
                </h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="condominios-add-button"
                >
                    <AddIcon style={{ fontSize: 20 }} />
                    Adicionar Condomínio
                </button>
            </div>
            
            <div className="condominios-grid">
                {Array.isArray(condominiums) && condominiums.length > 0 ? (
                    condominiums.map((condo, index) => (
                        <div
                            key={condo.id || `condo-${index}`}
                            onClick={() => handleCondominiumClick(condo.id)}
                            className="condominio-card"
                        >
                            <div className="condominio-card-content">
                                <button
                                    onClick={(e) => handleDeleteCondominium(condo.id, e)}
                                    disabled={deletingCondominiumId === condo.id}
                                    className="condominio-delete-button"
                                    title={deletingCondominiumId === condo.id ? "Removendo..." : "Remover condomínio"}
                                >
                                    {deletingCondominiumId === condo.id ? "..." : <><CloseIcon style={{ fontSize: 16 }} /> Remover</>}
                                </button>
                                
                                <h2 className="condominio-name">
                                    {condo.name}
                                </h2>
                                
                                <div className="condominio-info">
                                    <p className="condominio-info-item">
                                        <span className="condominio-info-strong">Endereço:</span> {condo.address}
                                    </p>
                                    <p className="condominio-info-item">
                                        <span className="condominio-info-strong">CNPJ:</span> {condo.cnpj}
                                    </p>
                                    <p className="condominio-info-item">
                                        <span className="condominio-info-strong">Unidades:</span> {condo.units}
                                    </p>
                                    <p className="condominio-info-item">
                                        <span className="condominio-info-strong">Telefone:</span> {condo.phone || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="condominio-stats">
                                <div className={`condominio-maintenance-buttons ${
                                    condo.overdueMaintenanceAmount > 0 ? 'overdue' : 
                                    condo.pendingMaintenanceAmount > 0 ? 'pending' : ''
                                }`}>
                                    <div>
                                        Manutenções pendentes: {condo.pendingMaintenanceAmount}
                                    </div>
                                    <div>
                                        Manutenções atrasadas: {condo.overdueMaintenanceAmount}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="condominios-empty">
                        <p className="condominios-empty-text">
                            Nenhum condomínio encontrado. Clique em &quot;Adicionar Condomínio&quot; para começar.
                        </p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddCondominiumModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddCondominium}
                    loading={loading}
                    existingCondominiums={condominiums}
                />
            )}
        </div>
    );
}