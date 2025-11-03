// src/main.jsx
import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import SplashScreen from './pages/SplashScreen';
import DesktopNavbar from './components/navbar/DesktopNavbar';
import MobileNavbar from './components/navbar/MobileNavbar';
import './index.css'
import PWABadge from './PWABadge';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const MakananPage = lazy(() => import('./pages/MakananPage'));
const MinumanPage = lazy(() => import('./pages/MinumanPage'));
const AllRecipesPage = lazy(() => import('./pages/AllRecipesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage'));
const EditRecipePage = lazy(() => import('./pages/EditRecipePage'));
const RecipeDetail = lazy(() => import('./components/recipe/RecipeDetail'));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Memuat halaman...</p>
    </div>
  </div>
);

function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('makanan');
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  // Check URL parameters for shared recipe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('recipe');
    
    if (recipeId) {
      // Auto-open recipe detail from shared link
      setShowSplash(false);
      setSelectedRecipeId(recipeId);
      setMode('detail');
      setCurrentPage('home');
      
      // Clean URL after loading (optional)
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateRecipe = () => {
    setMode('create');
  };

  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode('detail');
  };

  const handleEditRecipe = (recipeId) => {
    console.log('🔧 Edit button clicked! Recipe ID:', recipeId);
    setEditingRecipeId(recipeId);
    setMode('edit');
    console.log('✅ Mode changed to: edit');
  };

  const handleBack = () => {
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    setMode('list');
    // Optionally navigate to the new recipe's category
    if (newRecipe && newRecipe.category) {
      setCurrentPage(newRecipe.category);
    }
  };

  const handleEditSuccess = (updatedRecipe) => {
    alert('Resep berhasil diperbarui!');
    setMode('list');
  };

  const renderCurrentPage = () => {
    // Show Create Recipe Page
    if (mode === 'create') {
      return (
        <Suspense fallback={<PageLoader />}>
          <CreateRecipePage
            onBack={handleBack}
            onSuccess={handleCreateSuccess}
          />
        </Suspense>
      );
    }

    // Show Edit Recipe Page
    if (mode === 'edit') {
      return (
        <Suspense fallback={<PageLoader />}>
          <EditRecipePage
            recipeId={editingRecipeId}
            onBack={handleBack}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      );
    }

    // Show Recipe Detail
    if (mode === 'detail') {
      return (
        <Suspense fallback={<PageLoader />}>
          <RecipeDetail
            recipeId={selectedRecipeId}
            category={selectedCategory}
            onBack={handleBack}
            onEdit={handleEditRecipe}
          />
        </Suspense>
      );
    }

    // Show List Pages
    switch (currentPage) {
      case 'home':
        return (
          <Suspense fallback={<PageLoader />}>
            <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />
          </Suspense>
        );
      case 'makanan':
        return (
          <Suspense fallback={<PageLoader />}>
            <MakananPage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      case 'minuman':
        return (
          <Suspense fallback={<PageLoader />}>
            <MinumanPage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      case 'all':
        return (
          <Suspense fallback={<PageLoader />}>
            <AllRecipesPage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<PageLoader />}>
            <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />
          </Suspense>
        );
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar in list mode */}
      {mode === 'list' && (
        <>
          <DesktopNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </>
      )}
      
      {/* Main Content */}
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)