'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
};

interface TransactionEditModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave?: (updated: Transaction) => void;
}

export default function TransactionEditModal({
  transaction,
  onClose,
  onSave
}: TransactionEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date().toISOString()
      };

      const { data } = await api.put(`/transactions/${transaction._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSave) onSave(data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Editar Transação</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título"
              className="w-full p-3 border rounded text-black" 
              required
            />
            <input
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Valor"
              type="number"
              className="w-full p-3 border rounded text-black" 
              required
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border rounded text-black" 
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Categoria"
              className="w-full p-3 border rounded text-black" 
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}