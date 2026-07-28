import { useState } from 'react';

interface GuessFormProps {
  onSubmit: (weight: number) => void;
  disabled?: boolean;
}

export default function GuessForm({ onSubmit, disabled }: GuessFormProps) {
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    const num = parseFloat(weight);
    if (!isNaN(num) && num > 0) {
      onSubmit(num);
      setWeight('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">你觉得它有多重？</h3>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="输入重量"
            step="0.1"
            min="0"
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            kg
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !weight}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
        >
          确认
        </button>
      </div>
    </div>
  );
}
