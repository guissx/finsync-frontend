'use client';
import { Pencil } from 'lucide-react';

interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  onEdit?: () => void; 
}

export const TransactionCard = ({
  description,
  amount,
  type,
  date,
  category,
  onEdit
}: TransactionCardProps) => (
  <div className={`bg-white p-4 rounded-lg shadow mb-3 border-l-4 ${type === 'income' ? 'border-green-500' : 'border-red-500'}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-black">{description}</h3> {/* Adicionado text-black aqui */}
        <p className="text-sm text-gray-500">{category} • {new Date(date).toLocaleDateString()}</p>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'income' ? '+' : '-'}R$ {amount.toFixed(2)}
        </span>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
            title="Editar transação"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>
    </div>
  </div>
);