'use client';

import { useEffect, useState } from 'react';
import { TransactionCard } from '@/components/TransactionCard';
import { api } from '@/lib/api';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'month' | 'week' | 'day'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado');

        const { data } = await api.get('/transactions/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Erro ao carregar transações');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const now = new Date();
    const timeFilterFuncMap: Record<string, (t: Transaction) => boolean> = {
      all: () => true,
      year: (t) => new Date(t.date).getFullYear() === now.getFullYear(),
      month: (t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      },
      week: (t) => {
        const d = new Date(t.date);
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return d >= start && d <= end;
      },
      day: (t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      },
    };

    const timeFilterFunc = timeFilterFuncMap[timeFilter] || (() => true);
    
    const categoryFilterFunc = (t: Transaction) => 
      categoryFilter === 'all' || t.type === categoryFilter;
    
    const searchFilterFunc = (t: Transaction) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase());

    const filtered = transactions
      .filter(timeFilterFunc)
      .filter(categoryFilterFunc)
      .filter(searchFilterFunc);

    setFilteredTransactions(filtered);
  }, [transactions, timeFilter, categoryFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Todas as Transações</h1>
        <p className="text-gray-600">Visualize e filtre seu histórico completo</p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Filtrar por período:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="w-full border rounded px-3 py-2 text-black"
          >
            <option value="all">Todos</option>
            <option value="year">Ano</option>
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="day">Dia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Filtrar por tipo:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full border rounded px-3 py-2 text-black"
          >
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">Pesquisar:</label>
          <input
            type="text"
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded px-3 py-2 text-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-center py-12">Carregando transações...</p>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => (
            <TransactionCard
              key={t._id}
              id={t._id}
              description={t.title}
              amount={t.amount}
              type={t.type}
              date={t.date}
              category={t.category}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-12">Nenhuma transação encontrada</p>
        )}
      </div>
    </div>
  );
}