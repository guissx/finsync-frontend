'use client';
import { TransactionForm } from '@/components/TransactionForm';
import { useRouter } from 'next/navigation';

type Transaction = {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
};

export default function NewTransactionPage() {
  const router = useRouter();

  const handleAddTransaction = (transaction: Transaction) => {
    console.log('Nova transação:', transaction);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Nova Transação</h1>
      </header>

      <div className="max-w-md mx-auto">
        <TransactionForm />
      </div>
    </div>
  );
}