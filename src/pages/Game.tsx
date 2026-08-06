import { useState, useEffect, useCallback } from 'react';
import NameInput from '../components/NameInput';
import ImageCard from '../components/ImageCard';
import GuessForm from '../components/GuessForm';
import ResultCard from '../components/ResultCard';
import Sidebar from '../components/Sidebar';
import { getRandomImage, submitGuess, getUserStats } from '../api';
import LanguageSelector from '../components/LanguageSelector';
import { useI18n } from '../i18n';

interface ImageData {
  id: number;
  image_path: string;
  allGuessed: boolean;
  message?: string;
}

interface ResultData {
  correct_weight: number;
  guessed_weight: number;
  difference: number;
  direction: string;
  error_rate: number;
  accuracy: number;
  rank: number;
  total_guessers: number;
  better_percentage: number;
}

interface Stats {
  total_images: number;
  guessed_count: number;
  avg_accuracy: number;
  rank: number;
  total_players: number;
  name: string;
}

export default function Game() {
  const [userId, setUserId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, translateApiError } = useI18n();

  const fetchStats = useCallback(async () => {
    if (userId && sessionId) {
      try {
        const data = await getUserStats(userId, sessionId);
        setStats(data);
      } catch {
        console.error('Failed to fetch stats');
      }
    }
  }, [userId, sessionId]);

  const fetchRandomImage = useCallback(async () => {
    if (!userId || !sessionId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getRandomImage(userId, sessionId);
      if (data.allGuessed) {
        setError('game.allGuessed');
        setCurrentImage(null);
      } else {
        setCurrentImage(data);
        setResult(null);
      }
    } catch {
      setError('game.imageError');
    }
    setLoading(false);
  }, [userId, sessionId]);

  useEffect(() => {
    if (userId && sessionId) {
      fetchRandomImage();
      fetchStats();
    }
  }, [userId, sessionId, fetchRandomImage, fetchStats]);

  const handleGameStart = (id: number, session: string) => {
    setUserId(id);
    setSessionId(session);
  };

  const handleGuess = async (weight: number) => {
    if (!userId || !sessionId || !currentImage) return;
    setLoading(true);
    try {
      const data = await submitGuess(userId, sessionId, currentImage.id, weight);
      if (data.error) {
        alert(translateApiError(data.error));
      } else {
        setResult(data);
        fetchStats();
      }
    } catch {
      alert(t('game.submitError'));
    }
    setLoading(false);
  };

  const handleNext = () => {
    fetchRandomImage();
  };

  if (!userId) {
    return <NameInput onGameStart={handleGameStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{t('game.title')}</h1>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <a href="/admin" className="text-sm text-gray-400 hover:text-gray-600">{t('game.admin')}</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-xl text-center">
                {t(error)}
              </div>
            )}

            {currentImage && !result && (
              <>
                <ImageCard imagePath={currentImage.image_path} />
                <GuessForm onSubmit={handleGuess} disabled={loading} />
              </>
            )}

            {result && (
              <ResultCard result={result} onNext={handleNext} />
            )}

            {loading && !currentImage && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">{t('game.loading')}</p>
              </div>
            )}
          </div>

          <div className="w-72 hidden lg:block">
            <Sidebar stats={stats} />
          </div>
        </div>
      </main>
    </div>
  );
}
