import { useState } from 'react';
import { startGame } from '../api';

interface NameInputProps {
  onGameStart: (userId: number, name: string) => void;
}

export default function NameInput({ onGameStart }: NameInputProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async (inputName?: string) => {
    setLoading(true);
    try {
      const data = await startGame(inputName || name);
      onGameStart(data.userId, data.name);
    } catch {
      alert('启动失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">猜重量游戏</h2>
        <p className="text-gray-500 mb-6">输入你的名称开始游戏，或随机生成一个</p>

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入你的名称..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleStart()}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStart()}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? '启动中...' : '随机名称开始'}
          </button>
          <button
            onClick={() => name.trim() && handleStart()}
            disabled={loading || !name.trim()}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
          >
            {loading ? '启动中...' : '用此名称开始'}
          </button>
        </div>
      </div>
    </div>
  );
}
