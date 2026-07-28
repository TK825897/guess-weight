const API_BASE = '/api';

export async function startGame(name?: string) {
  const res = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function getRandomImage(userId: number) {
  const res = await fetch(`${API_BASE}/random?userId=${userId}`);
  return res.json();
}

export async function submitGuess(userId: number, imageId: number, guessedWeight: number) {
  const res = await fetch(`${API_BASE}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, imageId, guessed_weight: guessedWeight })
  });
  return res.json();
}

export async function getUserStats(userId: number) {
  const res = await fetch(`${API_BASE}/stats/${userId}`);
  return res.json();
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function getAdminImages(token: string) {
  const res = await fetch(`${API_BASE}/admin/images`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function uploadImage(token: string, file: File, correctWeight: number) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('correct_weight', String(correctWeight));

  const res = await fetch(`${API_BASE}/admin/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

export async function deleteImage(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/images/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
