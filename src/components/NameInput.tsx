import { useState } from 'react';
import { startGame } from '../api';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../i18n';

interface NameInputProps {
  onGameStart: (userId: number, sessionId: string, name: string) => void;
}

export default function NameInput({ onGameStart }: NameInputProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { language, t, translateApiError } = useI18n();

  const handleStart = async (inputName?: string) => {
    setLoading(true);
    setError('');
    try {
      // 随机名：不传 name，由后端生成去重随机名；手动输入则传入 name
      const data = await startGame(inputName || undefined, language);
      if (data.error) {
        setError(translateApiError(data.error));
      } else {
        onGameStart(data.userId, data.sessionId, data.name);
      }
    } catch {
      setError(t('name.error'));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-2xl font-bold text-gray-800">{t('game.title')}</h2>
          <LanguageSelector />
        </div>
        <p className="text-gray-500 mb-6">{t('name.description')}</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('name.placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleStart(name)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStart()}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? t('name.starting') : t('name.random')}
          </button>
          <button
            onClick={() => name.trim() && handleStart(name.trim())}
            disabled={loading || !name.trim()}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
          >
            {loading ? t('name.starting') : t('name.custom')}
          </button>
        </div>
      </div>
    </div>
  );
}