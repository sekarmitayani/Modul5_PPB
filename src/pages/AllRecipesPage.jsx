import React, { useState, useEffect } from 'react';
import { Search, Filter, ChefHat, Coffee, Clock, Users, Loader } from 'lucide-react';
import recipeService from '../services/recipeService';
import FavoriteButton from '../components/common/FavoriteButton';
import { LazyImage } from '../hooks/useLazyImage.jsx';

const AllRecipesPage = ({ onRecipeClick }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // '', 'makanan', 'minuman'
  const [difficultyFilter, setDifficultyFilter] = useState(''); // '', 'mudah', 'sedang', 'sulit'
  const [sortBy, setSortBy] = useState('created_at'); // 'created_at', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadAllRecipes();
  }, [categoryFilter, difficultyFilter, sortBy, sortOrder, currentPage]);

  const loadAllRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by: sortBy,
        order: sortOrder
      };

      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const result = await recipeService.getRecipes(params);
      
      if (result.success) {
        const recipesData = result.data || [];
        setRecipes(recipesData);
        
        // Calculate total pages
        // If API returns total count, use it
        if (result.total) {
          setTotalPages(Math.ceil(result.total / itemsPerPage));
        } 
        // If we got full page of items, assume there might be more pages
        else if (recipesData.length === itemsPerPage) {
          // Show next page option
          setTotalPages(currentPage + 1);
        } 
        // If less than itemsPerPage, this is the last page
        else if (recipesData.length < itemsPerPage && currentPage > 1) {
          setTotalPages(currentPage);
        } 
        // First page with less than itemsPerPage
        else {
          setTotalPages(1);
        }
      } else {
        throw new Error(result.message || 'Gagal memuat resep');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat resep');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term (client-side)
  const filteredRecipes = recipes.filter(recipe => {
    const matchSearch = recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            🍽️ Semua Resep
          </h1>
          <p className="text-slate-600 text-lg">
            Jelajahi koleksi lengkap resep makanan dan minuman Nusantara
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari resep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter & Sort Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-700">Filter & Sort</span>
            <svg 
              className={`w-4 h-4 text-slate-600 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filter & Sorting Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-lg text-slate-800">Filter & Sorting</h3>
              </div>
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setDifficultyFilter('');
                  setSortBy('created_at');
                  setSortOrder('desc');
                  setCurrentPage(1);
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
              >
                <span>✕</span>
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tingkat Kesulitan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => handleFilterChange(setDifficultyFilter, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kategori
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
                >
                  <option value="">Semua Kategori</option>
                  <option value="makanan">Makanan</option>
                  <option value="minuman">Minuman</option>
                </select>
              </div>

              {/* Urutkan Berdasarkan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="name">Nama (A-Z)</option>
                  <option value="prep_time">Waktu Persiapan</option>
                  <option value="cook_time">Waktu Memasak</option>
                </select>
              </div>

              {/* Urutan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Urutan
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => handleFilterChange(setSortOrder, e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
                >
                  <option value="desc">Descending (Besar → Kecil)</option>
                  <option value="asc">Ascending (Kecil → Besar)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-slate-600">
          Menampilkan <span className="font-semibold text-orange-600">{filteredRecipes.length}</span> resep
          {totalPages > 1 && (
            <span className="ml-2">
              (Halaman {currentPage} dari {totalPages})
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-slate-600">Memuat resep...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 mb-4">⚠️ {error}</div>
            <button
              onClick={loadAllRecipes}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">
              Tidak Ada Resep
            </h3>
            <p className="text-slate-500">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onRecipeClick={onRecipeClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-green-50 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  ← Sebelumnya
                </button>

                <div className="flex flex-col md:flex-row items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-xl border border-white/40">
                  <span className="text-slate-700 font-semibold">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({filteredRecipes.length} resep)
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-green-50 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// Recipe Card Component
function RecipeCard({ recipe, onRecipeClick }) {
  const categoryConfig = recipe.category === 'makanan'
    ? { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        icon: ChefHat,
        label: 'Makanan'
      }
    : { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: Coffee,
        label: 'Minuman'
      };

  const difficultyConfig = {
    'mudah': { bg: 'bg-green-100', text: 'text-green-700' },
    'sedang': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'sulit': { bg: 'bg-red-100', text: 'text-red-700' }
  };

  const CategoryIcon = categoryConfig.icon;
  const difficulty = difficultyConfig[recipe.difficulty] || difficultyConfig.mudah;

  return (
    <div
      onClick={() => onRecipeClick(recipe.id)}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-200">
        {recipe.image_url ? (
          <LazyImage
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <CategoryIcon className="w-16 h-16 text-slate-400" />
          </div>
        )}
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton recipeId={recipe.id} recipe={recipe} />
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <div className={`${categoryConfig.bg} ${categoryConfig.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
            <CategoryIcon className="w-3 h-3" />
            {categoryConfig.label}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3">
          <div className={`${difficulty.bg} ${difficulty.text} px-3 py-1 rounded-full text-xs font-semibold capitalize`}>
            {recipe.difficulty}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {recipe.name}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} menit</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings || 0} porsi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllRecipesPage;
