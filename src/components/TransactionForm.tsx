'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Transaction = {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
};

interface TransactionFormProps {
  onSuccess?: () => void;
  onAddTransaction?: (transaction: Transaction) => void;
}

export const TransactionForm = ({
  onSuccess = () => {},
  onAddTransaction,
}: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title.trim()) throw new Error('O título é obrigatório');
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Informe um valor válido');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const transactionData: Transaction = {
        title: formData.title,
        amount,
        type: formData.type,
        category: formData.category,
        date: new Date().toISOString()
      };

      if (onAddTransaction) {
        onAddTransaction(transactionData);
      } else {
        await api.post('/transactions/', transactionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setFormData({ title: '', amount: '', type: 'expense', category: '' });
      onSuccess();
      router.push('/dashboard'); 
    } catch (err: unknown) {
      let message = 'Erro ao criar transação';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleClose = () => {
    router.push('/dashboard'); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Nova Transação</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Fechar"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título*</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Salário, Aluguel"
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-white"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valor (R$)*</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0,00"
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-white"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo*</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-white"
                disabled={isLoading}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria*</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Ex: Moradia, Alimentação"
                className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-blue-200 selection:text-white"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Adicionar Transação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


