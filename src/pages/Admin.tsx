import { useState, useEffect } from 'react';
import { adminLogin, getAdminImages, uploadImage, deleteImage } from '../api';

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

  useEffect(() => {
    if (token) fetchImages();
  }, [token]);

  const fetchImages = async () => {
    if (!token) return;
    try {
      const data = await getAdminImages(token);
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
        setError(data.error);
      } else {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      }
    } catch {
      setError('登录失败');
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
        setError(data.error);
      } else {
        setUploadFile(null);
        setCorrectWeight('');
        fetchImages();
      }
    } catch {
      setError('上传失败');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('确定删除这张图片？')) return;
    try {
      await deleteImage(token, id);
      fetchImages();
    } catch {
      setError('删除失败');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">管理员登录</h2>

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
              placeholder="用户名"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
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
          <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
          <div className="flex gap-4">
            <a href="/" className="text-gray-500 hover:text-gray-700">返回游戏</a>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">退出登录</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">上传图片</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">选择图片 (jpg/png, 最大5MB)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm text-gray-600 mb-2">正确重量 (kg)</label>
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
              {loading ? '上传中...' : '上传'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">图片列表 ({images.length} 张)</h2>

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
                    删除
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
