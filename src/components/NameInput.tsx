import { useState } from 'react';
import { startGame } from '../api';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../i18n';
import { generateRandomName } from '../utils/nameGenerator';

interface NameInputProps {
  onGameStart: (userId: number, name: string) => void;
}

export default function NameInput({ onGameStart }: NameInputProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, t } = useI18n();

  const handleStart = async (inputName?: string) => {
    setLoading(true);
    try {
      const data = await startGame(inputName || name, language);
      onGameStart(data.userId, data.name);
    } catch {
      alert(t('name.error'));
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

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('name.placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleStart()}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStart(generateRandomName(language))}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? t('name.starting') : t('name.random')}
          </button>
          <button
            onClick={() => name.trim() && handleStart()}
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
