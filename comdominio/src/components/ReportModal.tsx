'use client';

import { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Condominium {
  id: string;
  name: string;
}

interface Maintenance {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  endDate?: string;
  status: string;
  isRecurring: boolean;
  recurringPeriod?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const loadCondominiums = useCallback(async () => {
    try {
      const workspaceId = localStorage.getItem('workspaceId');
      const token = localStorage.getItem('token');

      if (!workspaceId || !token) {
        console.error('WorkspaceId ou token não encontrados');
        return;
      }

      const response = await fetch(`${baseUrl}/workspaces/${workspaceId}/condominiums`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCondominiums(data);
      }
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
      setSelectedYear(String(now.getFullYear()));
      loadCondominiums();
    }
  }, [isOpen, loadCondominiums]);

  const generateReport = async () => {
    if (!selectedCondominium || !selectedMonth || !selectedYear) {
      alert('Por favor, selecione todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const workspaceId = localStorage.getItem('workspaceId');
      const token = localStorage.getItem('token');

      if (!workspaceId || !token) {
        console.error('WorkspaceId ou token não encontrados');
        return;
      }

      const response = await fetch(
        `${baseUrl}/workspaces/${workspaceId}/condominiums/${selectedCondominium}/maintenances`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Status': 'feito',
          },
        }
      );

      if (response.ok) {
        const allMaintenances: Maintenance[] = await response.json();
        
        const filteredMaintenances = allMaintenances.filter(maintenance => {
          const updatedDate = new Date(maintenance.updatedAt);
          const maintenanceMonth = updatedDate.getMonth() + 1;
          const maintenanceYear = updatedDate.getFullYear();
          
          return maintenanceMonth === parseInt(selectedMonth) && maintenanceYear === parseInt(selectedYear);
        });
        
        const selectedCondominiumData = condominiums.find(c => c.id === selectedCondominium);
        const monthName = months.find(m => m.value === selectedMonth)?.label;

        await generatePDF(filteredMaintenances, selectedCondominiumData?.name || 'Condomínio', monthName || '', selectedYear);
      } else {
        alert('Erro ao buscar manutenções. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const logReportGeneration = async (condominiumName: string, monthName: string, year: string) => {
    try {
      const workspaceId = localStorage.getItem('workspaceId');
      const token = localStorage.getItem('token');

      if (!workspaceId || !token) return;

      await fetch(`${baseUrl}/workspaces/${workspaceId}/activities/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'report_generated',
          description: 'Relatório mensal gerado para',
          entityName: `${condominiumName} - ${monthName}/${year}`,
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  };

  const generatePDF = async (maintenances: Maintenance[], condominiumName: string, monthName: string, year: string) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Mensal de Manutenções', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Condomínio: ${condominiumName}`, 20, 40);
    doc.text(`Período: ${monthName} de ${year}`, 20, 50);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
    doc.text(`Total de manutenções concluídas: ${maintenances.length}`, 20, 70);

    if (maintenances.length === 0) {
      doc.setFontSize(14);
      doc.text('Nenhuma manutenção foi concluída neste período.', 20, 90);
    } else {
      const tableData = maintenances.map(maintenance => [
        maintenance.name,
        maintenance.isRecurring ? 'Recorrente' : 'Única',
        new Date(maintenance.updatedAt).toLocaleDateString('pt-BR'),
        maintenance.endDate ? new Date(maintenance.endDate).toLocaleDateString('pt-BR') : 'N/A',
        maintenance.description.length > 50 ? maintenance.description.substring(0, 50) + '...' : maintenance.description
      ]);

      autoTable(doc, {
        head: [['Nome', 'Tipo', 'Data Conclusão', 'Data Prazo', 'Descrição']],
        body: tableData,
        startY: 85,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 75 },
        },
      });
    }

    const fileName = `relatorio_${condominiumName.replace(/\s+/g, '_')}_${monthName}_${year}.pdf`;
    doc.save(fileName);

    // Log the report generation activity
    await logReportGeneration(condominiumName, monthName, year);

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
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 style={{
                marginBottom: "10px",
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333',
            }}>
            Gerar Relatório Mensal
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condomínio *
            </label>
            <select
              value={selectedCondominium}
              onChange={(e) => setSelectedCondominium(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              style={{ color: '#333' }}
            >
              <option value="">Selecione um condomínio</option>
              {condominiums.map((condominium) => (
                <option key={condominium.id} value={condominium.id}>
                  {condominium.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês *
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                style={{ color: '#333' }}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano *
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                style={{ color: '#333' }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>
    </div>
  );
}