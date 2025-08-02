'use client';

import { FC } from 'react';

const quickQuestions = [
  'What should I watch out for in this wallet?',
  'Explain my wallet risk score.',
  'Is this NFT collection safe?',
  'How can I avoid scams in DeFi?',
  'Summarize my latest transactions.',
];

export const QuickQuestions: FC<{
  onSelect: (q: string) => void;
}> = ({ onSelect }) => {
  return (
    <div className="px-4 py-2 w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="text-sm text-left px-3 py-2 rounded-xl border border-cyan-500 hover:bg-cyan-900/10 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
