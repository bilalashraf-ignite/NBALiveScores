'use client';

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'swapped';
  title: string;
  amount: string;
  date: string;
  token?: string;
}

interface CryptoTransactionsProps {
  transactions?: Transaction[];
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'received', title: 'Received Ethereum', amount: '+0.42 ETH', date: 'Oct 24', token: 'ETH' },
  { id: '2', type: 'swapped', title: 'Swapped SOL for USDC', amount: '45.00 USDC', date: 'Oct 22', token: 'USDC' },
  { id: '3', type: 'sent', title: 'Sent Bitcoin', amount: '-0.002 BTC', date: 'Oct 20', token: 'BTC' },
  { id: '4', type: 'received', title: 'Received Solana', amount: '+10.5 SOL', date: 'Oct 18', token: 'SOL' },
];

const typeIcons = {
  received: (
    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  ),
  sent: (
    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </div>
  ),
  swapped: (
    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </div>
  ),
};

export function CryptoTransactions({ transactions = mockTransactions }: CryptoTransactionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#16162a] border border-purple-500/10 hover:border-purple-500/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              {typeIcons[tx.type]}
              <div>
                <p className="text-sm font-medium text-white">{tx.title}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                tx.type === 'received'
                  ? 'text-green-400'
                  : tx.type === 'sent'
                  ? 'text-red-400'
                  : 'text-white'
              }`}
            >
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
