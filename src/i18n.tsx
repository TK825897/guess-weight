import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'zh' | 'en' | 'ja';

type Messages = Record<string, string>;

const messages: Record<Language, Messages> = {
  zh: {
    'language.label': '语言',
    'language.zh': '中文', 'language.en': 'English', 'language.ja': '日本語',
    'game.title': '猜重量游戏', 'game.admin': '管理后台', 'game.loading': '加载中...',
    'game.imageError': '获取图片失败，请重试', 'game.submitError': '提交失败，请重试',
    'game.allGuessed': '恭喜！你已猜完所有图片',
    'name.description': '输入你的名称开始游戏，或随机生成一个', 'name.placeholder': '输入你的名称...',
    'name.random': '随机名称开始', 'name.custom': '用此名称开始', 'name.starting': '启动中...', 'name.error': '启动失败，请重试',
    'guess.question': '你觉得它有多重？', 'guess.placeholder': '输入重量', 'guess.confirm': '确认',
    'image.alt': '猜猜这个有多重', 'image.loadError': '图片加载失败',
    'result.exact': '完全正确！', 'result.high': '大了', 'result.low': '小了', 'result.difference': '差了 {{value}} kg',
    'result.yours': '你的猜测', 'result.correct': '正确答案', 'result.accuracy': '本次准确率',
    'result.comparison': '在 {{total}} 位猜测者中，你比 {{percentage}}% 的人更接近',
    'result.rank': '排名第 {{rank}} / {{total}}', 'result.next': '猜下一张',
    'stats.available': '可猜图片', 'stats.guessed': '已猜图片', 'stats.accuracy': '平均准确率', 'stats.rank': '世界排名',
    'admin.loginTitle': '管理员登录', 'admin.username': '用户名', 'admin.password': '密码', 'admin.loggingIn': '登录中...',
    'admin.login': '登录', 'admin.loginError': '登录失败', 'admin.title': '管理后台', 'admin.back': '返回游戏', 'admin.logout': '退出登录',
    'admin.uploadTitle': '上传图片', 'admin.chooseImage': '选择图片 (jpg/png, 最大5MB)', 'admin.correctWeight': '正确重量 (kg)',
    'admin.uploading': '上传中...', 'admin.upload': '上传', 'admin.uploadError': '上传失败',
    'admin.passwordTitle': '修改密码', 'admin.oldPassword': '旧密码', 'admin.newPassword': '新密码（至少6位）',
    'admin.confirmPassword': '确认新密码', 'admin.passwordMismatch': '两次输入的新密码不一致',
    'admin.passwordTooShort': '新密码至少需要6个字符', 'admin.passwordSuccess': '密码修改成功', 'admin.passwordError': '修改失败',
    'admin.imageList': '图片列表（{{count}} 张）', 'admin.delete': '删除', 'admin.deleteConfirm': '确定删除这张图片？', 'admin.deleteError': '删除失败',
  },
  en: {
    'language.label': 'Language',
    'language.zh': '中文', 'language.en': 'English', 'language.ja': '日本語',
    'game.title': 'Guess the Weight', 'game.admin': 'Admin', 'game.loading': 'Loading...',
    'game.imageError': 'Failed to load an image. Please try again.', 'game.submitError': 'Submission failed. Please try again.',
    'game.allGuessed': 'Congratulations! You have guessed all images.',
    'name.description': 'Enter your name to start, or generate a random one', 'name.placeholder': 'Enter your name...',
    'name.random': 'Start with random name', 'name.custom': 'Start with this name', 'name.starting': 'Starting...', 'name.error': 'Failed to start. Please try again.',
    'guess.question': 'How much do you think it weighs?', 'guess.placeholder': 'Enter weight', 'guess.confirm': 'Confirm',
    'image.alt': 'Guess how much this weighs', 'image.loadError': 'Image failed to load',
    'result.exact': 'Exactly right!', 'result.high': 'Too high', 'result.low': 'Too low', 'result.difference': 'Off by {{value}} kg',
    'result.yours': 'Your guess', 'result.correct': 'Correct answer', 'result.accuracy': 'Accuracy',
    'result.comparison': 'Out of {{total}} players, you were closer than {{percentage}}%',
    'result.rank': 'Rank {{rank}} / {{total}}', 'result.next': 'Guess the next image',
    'stats.available': 'Available images', 'stats.guessed': 'Images guessed', 'stats.accuracy': 'Average accuracy', 'stats.rank': 'World rank',
    'admin.loginTitle': 'Admin Login', 'admin.username': 'Username', 'admin.password': 'Password', 'admin.loggingIn': 'Logging in...',
    'admin.login': 'Log in', 'admin.loginError': 'Login failed', 'admin.title': 'Admin Dashboard', 'admin.back': 'Back to game', 'admin.logout': 'Log out',
    'admin.uploadTitle': 'Upload Image', 'admin.chooseImage': 'Choose image (jpg/png, max 5 MB)', 'admin.correctWeight': 'Correct weight (kg)',
    'admin.uploading': 'Uploading...', 'admin.upload': 'Upload', 'admin.uploadError': 'Upload failed',
    'admin.passwordTitle': 'Change Password', 'admin.oldPassword': 'Current password', 'admin.newPassword': 'New password (at least 6 characters)',
    'admin.confirmPassword': 'Confirm new password', 'admin.passwordMismatch': 'The new passwords do not match',
    'admin.passwordTooShort': 'The new password must be at least 6 characters', 'admin.passwordSuccess': 'Password changed successfully', 'admin.passwordError': 'Password change failed',
    'admin.imageList': 'Images ({{count}})', 'admin.delete': 'Delete', 'admin.deleteConfirm': 'Delete this image?', 'admin.deleteError': 'Delete failed',
  },
  ja: {
    'language.label': '言語',
    'language.zh': '中文', 'language.en': 'English', 'language.ja': '日本語',
    'game.title': '重さ当てゲーム', 'game.admin': '管理画面', 'game.loading': '読み込み中...',
    'game.imageError': '画像を取得できませんでした。もう一度お試しください。', 'game.submitError': '送信できませんでした。もう一度お試しください。',
    'game.allGuessed': 'おめでとうございます！すべての画像を回答しました。',
    'name.description': '名前を入力するか、ランダムな名前でゲームを始めます', 'name.placeholder': '名前を入力...',
    'name.random': 'ランダム名で開始', 'name.custom': 'この名前で開始', 'name.starting': '開始中...', 'name.error': '開始できませんでした。もう一度お試しください。',
    'guess.question': 'どのくらいの重さだと思いますか？', 'guess.placeholder': '重さを入力', 'guess.confirm': '決定',
    'image.alt': 'この重さを当ててください', 'image.loadError': '画像を読み込めません',
    'result.exact': '正解です！', 'result.high': '重すぎます', 'result.low': '軽すぎます', 'result.difference': '{{value}} kg の差',
    'result.yours': 'あなたの予想', 'result.correct': '正解', 'result.accuracy': '今回の正確度',
    'result.comparison': '{{total}} 人中、{{percentage}}% の人より正解に近いです',
    'result.rank': '順位 {{rank}} / {{total}}', 'result.next': '次の画像へ',
    'stats.available': '回答可能な画像', 'stats.guessed': '回答済み画像', 'stats.accuracy': '平均正確度', 'stats.rank': '世界ランキング',
    'admin.loginTitle': '管理者ログイン', 'admin.username': 'ユーザー名', 'admin.password': 'パスワード', 'admin.loggingIn': 'ログイン中...',
    'admin.login': 'ログイン', 'admin.loginError': 'ログインに失敗しました', 'admin.title': '管理画面', 'admin.back': 'ゲームに戻る', 'admin.logout': 'ログアウト',
    'admin.uploadTitle': '画像をアップロード', 'admin.chooseImage': '画像を選択 (jpg/png、最大5MB)', 'admin.correctWeight': '正しい重さ (kg)',
    'admin.uploading': 'アップロード中...', 'admin.upload': 'アップロード', 'admin.uploadError': 'アップロードに失敗しました',
    'admin.passwordTitle': 'パスワード変更', 'admin.oldPassword': '現在のパスワード', 'admin.newPassword': '新しいパスワード（6文字以上）',
    'admin.confirmPassword': '新しいパスワードを確認', 'admin.passwordMismatch': '新しいパスワードが一致しません',
    'admin.passwordTooShort': '新しいパスワードは6文字以上必要です', 'admin.passwordSuccess': 'パスワードを変更しました', 'admin.passwordError': '変更に失敗しました',
    'admin.imageList': '画像一覧（{{count}}枚）', 'admin.delete': '削除', 'admin.deleteConfirm': 'この画像を削除しますか？', 'admin.deleteError': '削除に失敗しました',
  },
};

const apiErrorKeys: Record<string, string> = {
  '请输入用户名和密码': 'api.credentialsRequired', '用户名或密码错误': 'api.invalidCredentials',
  '请填写旧密码和新密码': 'api.passwordsRequired', '新密码至少需要6个字符': 'admin.passwordTooShort',
  '管理员不存在': 'api.adminMissing', '旧密码错误': 'api.oldPasswordWrong',
  '仅支持 jpg 和 png 格式': 'api.imageFormat', '请上传图片': 'api.imageRequired',
  '请输入正确的重量数值': 'api.weightRequired', '未授权，请先登录': 'api.unauthorized',
  'Token 无效或已过期': 'api.tokenInvalid', '图片不存在': 'api.imageMissing',
  '缺少必要参数': 'api.missingParameters', '你已经猜过这张图片了': 'api.alreadyGuessed',
};

Object.assign(messages.zh, {
  'api.credentialsRequired': '请输入用户名和密码', 'api.invalidCredentials': '用户名或密码错误', 'api.passwordsRequired': '请填写旧密码和新密码',
  'api.adminMissing': '管理员不存在', 'api.oldPasswordWrong': '旧密码错误', 'api.imageFormat': '仅支持 jpg 和 png 格式',
  'api.imageRequired': '请上传图片', 'api.weightRequired': '请输入正确的重量数值', 'api.unauthorized': '未授权，请先登录',
  'api.tokenInvalid': '登录已过期，请重新登录', 'api.imageMissing': '图片不存在', 'api.missingParameters': '缺少必要参数', 'api.alreadyGuessed': '你已经猜过这张图片了',
});
Object.assign(messages.en, {
  'api.credentialsRequired': 'Enter a username and password', 'api.invalidCredentials': 'Incorrect username or password', 'api.passwordsRequired': 'Enter the current and new passwords',
  'api.adminMissing': 'Administrator not found', 'api.oldPasswordWrong': 'Current password is incorrect', 'api.imageFormat': 'Only jpg and png images are supported',
  'api.imageRequired': 'Select an image', 'api.weightRequired': 'Enter a valid weight', 'api.unauthorized': 'Please log in first',
  'api.tokenInvalid': 'Your session has expired. Please log in again', 'api.imageMissing': 'Image not found', 'api.missingParameters': 'Required information is missing', 'api.alreadyGuessed': 'You have already guessed this image',
});
Object.assign(messages.ja, {
  'api.credentialsRequired': 'ユーザー名とパスワードを入力してください', 'api.invalidCredentials': 'ユーザー名またはパスワードが違います', 'api.passwordsRequired': '現在と新しいパスワードを入力してください',
  'api.adminMissing': '管理者が見つかりません', 'api.oldPasswordWrong': '現在のパスワードが違います', 'api.imageFormat': 'jpg と png 画像のみ対応しています',
  'api.imageRequired': '画像を選択してください', 'api.weightRequired': '正しい重さを入力してください', 'api.unauthorized': '先にログインしてください',
  'api.tokenInvalid': 'セッションが期限切れです。再度ログインしてください', 'api.imageMissing': '画像が見つかりません', 'api.missingParameters': '必要な情報がありません', 'api.alreadyGuessed': 'この画像にはすでに回答済みです',
});

type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string, values?: Record<string, string | number>) => string; translateApiError: (message: string) => string };
const I18nContext = createContext<I18nValue | null>(null);

function initialLanguage(): Language {
  const saved = localStorage.getItem('language');
  if (saved === 'zh' || saved === 'en' || saved === 'ja') return saved;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('ja')) return 'ja';
  if (browser.startsWith('en')) return 'en';
  return 'zh';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  useEffect(() => { localStorage.setItem('language', language); document.documentElement.lang = language; }, [language]);
  const value = useMemo<I18nValue>(() => {
    const t = (key: string, values: Record<string, string | number> = {}) => {
      let text = messages[language][key] ?? messages.zh[key] ?? key;
      Object.entries(values).forEach(([name, value]) => { text = text.split(`{{${name}}}`).join(String(value)); });
      return text;
    };
    return { language, setLanguage, t, translateApiError: (message) => t(apiErrorKeys[message] ?? message) };
  }, [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
