// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import userService, { getUserProfile, updateAvatar, updateUsername } from '../services/userService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(getUserProfile());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username || 'Pengguna');
  const [favorites, setFavorites] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadUserReviews();
  }, []);

  const loadProfile = () => {
    const p = getUserProfile();
    setProfile(p);
    setNameInput(p.username || 'Pengguna');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      const res = updateAvatar(base64);
      if (res && res.success) {
        setProfile(res.data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    const res = updateUsername(nameInput || 'Pengguna');
    if (res && res.success) {
      setProfile(res.data);
      setEditingName(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favoriteIds);

      if (favoriteIds.length === 0) {
        setFavoriteRecipes([]);
        return;
      }

      const promises = favoriteIds.map(id =>
        fetch(`https://modlima.fuadfakhruz.id/api/v1/recipes/${id}`)
          .then(res => (res.ok ? res.json() : null))
          .then(json => json?.data || null)
          .catch(() => null)
      );

      const fetched = await Promise.all(promises);
      const valid = fetched.filter(r => r && r.id);
      setFavoriteRecipes(valid);
    } catch (err) {
      setFavoriteRecipes([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadUserReviews = () => {
    const stored = JSON.parse(localStorage.getItem('user_reviews') || '[]');
    // show only reviews for current user identifier
    const userId = profile.userId || userService.getUserIdentifier();
    const my = stored.filter(r => r.user_identifier === userId);
    setReviews(my.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Profile Pengguna
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 mb-4">
                {profile.avatar ? (
                  // avatar is base64 data URL
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>
                )}
              </div>

              <label className="text-sm text-gray-600 mb-4">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <span className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer">Ubah Foto</span>
              </label>

              <div className="w-full">
                {editingName ? (
                  <div className="flex gap-2">
                    <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    <button onClick={handleSaveName} className="px-3 py-2 bg-green-600 text-white rounded-md">Simpan</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">{profile.username}</h2>
                    <button onClick={() => setEditingName(true)} className="text-sm text-indigo-600">Ubah</button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4">ID:21120123120012</p>
            </div>
          </div>

          {/* Middle: Favorites */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Resep Favorit ({favorites.length})</h3>

              {loadingFavorites ? (
                <p className="text-gray-500">Memuat favorit...</p>
              ) : favoriteRecipes.length === 0 ? (
                <p className="text-gray-500">Belum ada resep favorit</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteRecipes.map(r => (
                    <div key={r.id} className="flex gap-4 items-center">
                      <img src={r.image_url || 'https://via.placeholder.com/120x80'} alt={r.name} className="w-28 h-20 object-cover rounded-md" />
                      <div>
                        <h4 className="font-semibold">{r.name}</h4>
                        <p className="text-sm text-gray-500">{r.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews by this user (from local cache) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Ulasan Saya ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500">Belum ada ulasan yang tersimpan</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rv => (
                    <div key={rv._local_id || rv.created_at} className="border-b pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{profile.username}</p>
                          <p className="text-sm text-gray-500">{new Date(rv.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-yellow-400">{'⭐'.repeat(Math.max(1, Math.min(5, rv.rating)))}</div>
                      </div>
                      {rv.comment && <p className="mt-2 text-gray-700">{rv.comment}</p>}
                      <p className="mt-2 text-sm text-gray-500">Resep: {rv.recipe_name || rv.recipeId}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}