// src/pages/FavoritesPage.jsx
import { useState, useEffect } from 'react';
import { Heart, Loader, AlertCircle } from 'lucide-react';
import FavoriteButton from '../components/common/FavoriteButton';

/**
 * FavoritesPage Component
 * Display all user's favorite recipes
 */
export default function FavoritesPage({ onRecipeClick }) {
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Load favorites from localStorage and fetch recipe details
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get favorite IDs from localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favoriteIds);

      if (favoriteIds.length === 0) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      // Fetch recipe details for each favorite
      const recipePromises = favoriteIds.map(id =>
        fetch(`https://modlima.fuadfakhruz.id/api/v1/recipes/${id}`)
          .then(res => {
            if (!res.ok) return null;
            return res.json();
          })
          .then(data => data?.data || null)
          .catch(() => null)
      );

      const fetchedRecipes = await Promise.all(recipePromises);
      const validRecipes = fetchedRecipes.filter(r => r !== null && r !== undefined && r.id);
      
      // Clean up localStorage - remove invalid recipe IDs
      const validIds = validRecipes.map(r => r.id);
      const invalidIds = favoriteIds.filter(id => !validIds.includes(id));
      
      if (invalidIds.length > 0) {
        localStorage.setItem('favorites', JSON.stringify(validIds));
        setFavorites(validIds);
      }
      
      setRecipes(validRecipes);
    } catch (err) {
      setError('Gagal memuat resep favorit');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (recipeId, isFavorited) => {
    if (!isFavorited) {
      // Remove from display
      setRecipes(recipes.filter(r => r.id !== recipeId));
      setFavorites(favorites.filter(id => id !== recipeId));
    }
  };

  // Filter by category - safely handle null/undefined values
  const filteredRecipes = categoryFilter
    ? recipes.filter(r => r && r.id && r.category === categoryFilter)
    : recipes.filter(r => r && r.id);

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-red-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-red-600 fill-current" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
            Resep Favorit
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Kumpulan resep yang kamu sukai
          </p>
        </div>

        {/* Category Filter */}
        {recipes.length > 0 && (
          <div className="mb-6 flex justify-center gap-3">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                categoryFilter === ''
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              Semua ({recipes.length})
            </button>
            <button
              onClick={() => setCategoryFilter('makanan')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                categoryFilter === 'makanan'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              Makanan ({recipes.filter(r => r.category === 'makanan').length})
            </button>
            <button
              onClick={() => setCategoryFilter('minuman')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                categoryFilter === 'minuman'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              Minuman ({recipes.filter(r => r.category === 'minuman').length})
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-slate-600">Memuat resep favorit...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-700 font-semibold mb-2">Terjadi Kesalahan</p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadFavorites}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recipes.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Belum Ada Favorit
            </h3>
            <p className="text-slate-600 mb-6">
              Mulai tambahkan resep favoritmu dengan menekan tombol ❤️ di resep yang kamu suka
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                {/* Image */}
                <div 
                  onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
                  className="relative h-48 overflow-hidden bg-slate-200"
                >
                  <img
                    src={recipe.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  
                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton
                      recipeId={recipe.id}
                      onToggle={handleFavoriteToggle}
                      size="md"
                    />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      recipe.category === 'makanan'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}>
                      {recipe.category === 'makanan' ? 'Makanan' : 'Minuman'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div 
                  onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
                  className="p-5"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {recipe.name}
                  </h3>
                  
                  {recipe.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      ⏱️ {recipe.prep_time + recipe.cook_time || 0} min
                    </span>
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium">
                      {recipe.difficulty || 'mudah'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results After Filter */}
        {!loading && !error && recipes.length > 0 && filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Tidak ada resep {categoryFilter} di favorit
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
