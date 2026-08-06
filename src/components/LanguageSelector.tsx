import { useI18n, type Language } from '../i18n';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-500">
      <span className="sr-only">{t('language.label')}</span>
      <span aria-hidden="true">🌐</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={t('language.label')}
        className="bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="zh">{t('language.zh')}</option>
        <option value="en">{t('language.en')}</option>
        <option value="ja">{t('language.ja')}</option>
      </select>
    </label>
  );
}
