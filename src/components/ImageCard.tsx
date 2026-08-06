import { useI18n } from '../i18n';

interface ImageCardProps {
  imagePath: string;
}

export default function ImageCard({ imagePath }: ImageCardProps) {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={imagePath}
          alt={t('image.alt')}
          className="w-full h-full object-contain"
          onError={(e) => {
            const message = encodeURIComponent(t('image.loadError'));
            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" text-anchor="middle" fill="%23999" font-size="10">${message}</text></svg>`;
          }}
        />
      </div>
    </div>
  );
}
