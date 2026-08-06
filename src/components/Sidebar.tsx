import { useI18n } from '../i18n';

interface Stats {
  total_images: number;
  guessed_count: number;
  avg_accuracy: number;
  rank: number;
  total_players: number;
  name: string;
}

interface SidebarProps {
  stats: Stats | null;
}

export default function Sidebar({ stats }: SidebarProps) {
  const { t } = useI18n();
  if (!stats) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">👤</span>
        </div>
        <div className="font-bold text-gray-800 text-lg">{stats.name}</div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖼️</span>
            <span className="text-gray-600">{t('stats.available')}</span>
          </div>
          <span className="font-bold text-blue-600 text-xl">{stats.total_images}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-gray-600">{t('stats.guessed')}</span>
          </div>
          <span className="font-bold text-green-600 text-xl">{stats.guessed_count}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-gray-600">{t('stats.accuracy')}</span>
          </div>
          <span className="font-bold text-yellow-600 text-xl">{stats.avg_accuracy}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="text-gray-600">{t('stats.rank')}</span>
          </div>
          <span className="font-bold text-purple-600 text-xl">
            #{stats.rank} <span className="text-sm text-gray-400">/ {stats.total_players}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
