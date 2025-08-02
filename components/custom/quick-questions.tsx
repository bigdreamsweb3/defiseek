'use client';

import { FC, useEffect, useState } from 'react';

const allQuickQuestions = [
  'Explain my wallet risk score.'
  'Any wallet risks?',
  'Wallet score breakdown',
  'Is this NFT safe?',
  'Top Polygon NFT sales 24 hours',
  'Recent transactions',
  'Ethereum NFT trends last 7 days',
  'Supported chains',
];


function getRandomSubset<T>(arr: T[], min = 2, max = 3): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, count);
}

export const QuickQuestions: FC<{
  onSelect: (q: string) => void;
}> = ({ onSelect }) => {
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    setQuestions(getRandomSubset(allQuickQuestions));
  }, []);

  return (
    <div className="px-4 py-2 w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((question, index) => (
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
