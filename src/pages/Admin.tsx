import { useState, useEffect } from 'react';
import { adminLogin, getAdminImages, uploadImage, deleteImage, changePassword } from '../api';
import LanguageSelector from '../components/LanguageSelector';
import { useI18n } from '../i18n';

interface Image {
  id: number;
  image_path: string;
  correct_weight: number;
  created_at: string;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [correctWeight, setCorrectWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { t, translateApiError } = useI18n();

  useEffect(() => {
    if (token) fetchImages();
  }, [token]);

  const fetchImages = async () => {
    if (!token) return;
    try {
      const data = await getAdminImages(token);
      // 登录过期时接口返回错误对象而不是数组，直接渲染会导致 images.map 报错并出现白屏。
      if (!Array.isArray(data)) {
        handleLogout();
        return;
      }
      setImages(data);
    } catch {
      handleLogout();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(username, password);
      if (data.error) {
        setError(translateApiError(data.error));
      } else {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      }
    } catch {
      setError(t('admin.loginError'));
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setImages([]);
  };

  const handleUpload = async () => {
    if (!token || !uploadFile || !correctWeight) return;
    setLoading(true);
    try {
      const data = await uploadImage(token, uploadFile, parseFloat(correctWeight));
      if (data.error) {
        setError(translateApiError(data.error));
      } else {
        setUploadFile(null);
        setCorrectWeight('');
        fetchImages();
      }
    } catch {
      setError(t('admin.uploadError'));
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!token) return;
    setPasswordMsg('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordMsg(t('admin.passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg(t('admin.passwordTooShort'));
      return;
    }
    try {
      const data = await changePassword(token, oldPassword, newPassword);
      if (data.error) {
        setPasswordMsg(translateApiError(data.error));
      } else {
        setPasswordMsg(t('admin.passwordSuccess'));
        setPasswordSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMsg(t('admin.passwordError'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm(t('admin.deleteConfirm'))) return;
    try {
      await deleteImage(token, id);
      fetchImages();
    } catch {
      setError(t('admin.deleteError'));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-end mb-4"><LanguageSelector /></div>
          <h2 className="text-2xl font-bold text-center mb-6">{t('admin.loginTitle')}</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('admin.username')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? t('admin.loggingIn') : t('admin.login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h1>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <a href="/" className="text-gray-500 hover:text-gray-700">{t('admin.back')}</a>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">{t('admin.logout')}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('admin.uploadTitle')}</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">{t('admin.chooseImage')}</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm text-gray-600 mb-2">{t('admin.correctWeight')}</label>
              <input
                type="number"
                step="0.1"
                value={correctWeight}
                onChange={(e) => setCorrectWeight(e.target.value)}
                placeholder="kg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={loading || !uploadFile || !correctWeight}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? t('admin.uploading') : t('admin.upload')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('admin.passwordTitle')}</h2>

          {passwordMsg && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-center ${
              passwordSuccess ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {passwordMsg}
            </div>
          )}

          <div className="max-w-sm space-y-4">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t('admin.oldPassword')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('admin.newPassword')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('admin.confirmPassword')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleChangePassword}
              disabled={!oldPassword || !newPassword || !confirmPassword}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {t('admin.passwordTitle')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">{t('admin.imageList', { count: images.length })}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={`/uploads/${img.image_path}`}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="font-medium text-gray-700">{img.correct_weight} kg</span>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
