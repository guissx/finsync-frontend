'use client';

import { useEffect, useState } from 'react';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionCard } from '@/components/TransactionCard';
import TransactionEditModal from '@/components/TransactionEditModal';
import Link from 'next/link';
import { api } from '@/lib/api';

export type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'month' | 'week' | 'day'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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

  const handleUpdate = (updated: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t._id === updated._id ? updated : t))
    );
    setSelectedTransaction(null);
  };

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Finanças Pessoais</h1>
        <p className="text-gray-600">Gerencie suas entradas e saídas</p>
      </header>

      <SummaryCard income={income} expenses={expenses} balance={balance} />

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transações Recentes</h2>
            <Link
              href="/newtransaction"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Nova Transação
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Carregando transações...</p>
          ) : (
            <div className="space-y-3">
  {loading ? (
    <p className="text-gray-500 text-center py-8">Carregando transações...</p>
  ) : filteredTransactions.length > 0 ? (
    filteredTransactions
      .slice(0, 6) 
      .map((t) => (
        <TransactionCard
          key={t._id}
          id={t._id}
          description={t.title}
          amount={t.amount}
          type={t.type}
          date={t.date}
          category={t.category}
          onEdit={() => setSelectedTransaction(t)}
        />
      ))
  ) : (
    <p className="text-gray-500 text-center py-8">Nenhuma transação encontrada</p>
  )}
</div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Resumo</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-2">Total de transações: {filteredTransactions.length}</p>
            <p className="text-gray-600 mb-2">
              Última transação:{' '}
              {filteredTransactions[0] ? new Date(filteredTransactions[0].date).toLocaleDateString() : 'N/A'}
            </p>
            <Link
              href="/transactions"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium block mt-4"
            >
              Ver todas as transações →
            </Link>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionEditModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}