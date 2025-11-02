'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Dialog from '../../../components/ui/Dialog';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAuth } from '../../../context/AuthContext';
import { useMyBusiness } from '../../../lib/hooks/useMyBusiness';

interface TableColumn {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface TableRow {
  id: string;
  date: string;
  values: { [columnId: string]: number };
}

interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

export default function TablesPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const { isLoading } = useMyBusiness();
  
  const [tableData, setTableData] = useState<TableData>({
    columns: [
      { id: 'income1', name: 'Gelir 1', type: 'income', color: '#10B981' },
      { id: 'expense1', name: 'Gider 1', type: 'expense', color: '#EF4444' }
    ],
    rows: []
  });
  
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [isEditCellDialogOpen, setIsEditCellDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'income' as 'income' | 'expense' });
  const [newRow, setNewRow] = useState({ date: '' });
  const [cellValue, setCellValue] = useState('');

  // Generate rows for current month
  useEffect(() => {
    if (tableData.rows.length === 0) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const newRows: TableRow[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        
        const values: { [columnId: string]: number } = {};
        tableData.columns.forEach(column => {
          values[column.id] = 0;
        });
        
        newRows.push({
          id: `row-${day}`,
          date: dateString,
          values
        });
      }
      
      setTableData(prev => ({ ...prev, rows: newRows }));
    }
  }, [tableData.columns]);

  const addColumn = () => {
    if (newColumn.name.trim()) {
      const newColumnData: TableColumn = {
        id: `col-${Date.now()}`,
        name: newColumn.name,
        type: newColumn.type,
        color: newColumn.type === 'income' ? '#10B981' : '#EF4444'
      };
      
      setTableData(prev => ({
        ...prev,
        columns: [...prev.columns, newColumnData],
        rows: prev.rows.map(row => ({
          ...row,
          values: { ...row.values, [newColumnData.id]: 0 }
        }))
      }));
      
      setNewColumn({ name: '', type: 'income' });
      setIsAddColumnDialogOpen(false);
    }
  };

  const addRow = () => {
    if (newRow.date) {
      const values: { [columnId: string]: number } = {};
      tableData.columns.forEach(column => {
        values[column.id] = 0;
      });
      
      const newRowData: TableRow = {
        id: `row-${Date.now()}`,
        date: newRow.date,
        values
      };
      
      setTableData(prev => ({
        ...prev,
        rows: [...prev.rows, newRowData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }));
      
      setNewRow({ date: '' });
      setIsAddRowDialogOpen(false);
    }
  };

  const editCell = (rowId: string, columnId: string) => {
    const row = tableData.rows.find(r => r.id === rowId);
    if (row) {
      setSelectedCell({ rowId, columnId });
      setCellValue(row.values[columnId]?.toString() || '0');
      setIsEditCellDialogOpen(true);
    }
  };

  const saveCellValue = () => {
    if (selectedCell) {
      const value = parseFloat(cellValue) || 0;
      setTableData(prev => ({
        ...prev,
        rows: prev.rows.map(row => 
          row.id === selectedCell.rowId 
            ? { ...row, values: { ...row.values, [selectedCell.columnId]: value } }
            : row
        )
      }));
      setIsEditCellDialogOpen(false);
      setSelectedCell(null);
      setCellValue('');
    }
  };

  const calculateRowTotal = (row: TableRow) => {
    return tableData.columns.reduce((total, column) => {
      const value = row.values[column.id] || 0;
      return column.type === 'income' ? total + value : total - value;
    }, 0);
  };

  const calculateColumnTotal = (columnId: string) => {
    return tableData.rows.reduce((total, row) => total + (row.values[columnId] || 0), 0);
  };

  const calculateMonthlyTotal = () => {
    return tableData.rows.reduce((total, row) => total + calculateRowTotal(row), 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-foreground)]">Gelir-Gider Tablosu</h1>
          <p className="text-[var(--theme-muted-foreground)] mt-1">
            Günlük gelir ve giderlerinizi takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddColumnDialogOpen(true)}
            variant="outline"
            size="sm"
          >
            Sütun Ekle
          </Button>
          <Button
            onClick={() => setIsAddRowDialogOpen(true)}
            size="sm"
          >
            Satır Ekle
          </Button>
        </div>
      </div>

      {/* Monthly Summary */}
      <Card className="mb-6 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Aylık Özet</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--theme-foreground)]">
              {calculateMonthlyTotal().toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-sm text-[var(--theme-muted-foreground)]">
              {calculateMonthlyTotal() >= 0 ? 'Kâr' : 'Zarar'}
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--theme-muted)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--theme-foreground)] border-r">
                  Tarih
                </th>
                {tableData.columns.map(column => (
                  <th 
                    key={column.id} 
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--theme-foreground)] border-r min-w-[120px]"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: column.color }}
                      ></div>
                      {column.name}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--theme-foreground)] min-w-[120px]">
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-[var(--theme-muted)]/50">
                  <td className="px-4 py-3 text-sm text-[var(--theme-foreground)] border-r">
                    {formatDate(row.date)}
                  </td>
                  {tableData.columns.map(column => (
                    <td 
                      key={column.id} 
                      className="px-4 py-3 text-sm text-[var(--theme-foreground)] border-r cursor-pointer hover:bg-[var(--theme-muted)]/30"
                      onClick={() => editCell(row.id, column.id)}
                    >
                      {(row.values[column.id] || 0).toLocaleString('tr-TR')} ₺
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm font-medium text-[var(--theme-foreground)]">
                    {calculateRowTotal(row).toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-[var(--theme-muted)] font-semibold">
                <td className="px-4 py-3 text-sm text-[var(--theme-foreground)] border-r">
                  Toplam
                </td>
                {tableData.columns.map(column => (
                  <td key={column.id} className="px-4 py-3 text-sm text-[var(--theme-foreground)] border-r">
                    {calculateColumnTotal(column.id).toLocaleString('tr-TR')} ₺
                  </td>
                ))}
                <td className="px-4 py-3 text-sm text-[var(--theme-foreground)]">
                  {calculateMonthlyTotal().toLocaleString('tr-TR')} ₺
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Column Dialog */}
      <Dialog
        isOpen={isAddColumnDialogOpen}
        onClose={() => setIsAddColumnDialogOpen(false)}
        title="Yeni Sütun Ekle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Sütun Adı
            </label>
            <Input
              value={newColumn.name}
              onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Örn: Satış, Kira, Malzeme"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Tip
            </label>
            <Select
              value={newColumn.type}
              onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
            >
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddColumnDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={addColumn}>
              Ekle
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Row Dialog */}
      <Dialog
        isOpen={isAddRowDialogOpen}
        onClose={() => setIsAddRowDialogOpen(false)}
        title="Yeni Satır Ekle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Tarih
            </label>
            <Input
              type="date"
              value={newRow.date}
              onChange={(e) => setNewRow(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddRowDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={addRow}>
              Ekle
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Cell Dialog */}
      <Dialog
        isOpen={isEditCellDialogOpen}
        onClose={() => setIsEditCellDialogOpen(false)}
        title="Değer Düzenle"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Tutar (₺)
            </label>
            <Input
              type="number"
              value={cellValue}
              onChange={(e) => setCellValue(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditCellDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={saveCellValue}>
              Kaydet
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
