import { apiClient } from '../config/api';
import cacheManager from '../utils/cacheManager';

class RecipeService {
  constructor() {
    // Cache TTL configurations (in milliseconds)
    this.cacheTTL = {
      list: 5 * 60 * 1000,      // 5 minutes for list
      detail: 10 * 60 * 1000,   // 10 minutes for detail
      search: 3 * 60 * 1000,    // 3 minutes for search results
    };
  }

  /**
   * Get all recipes with optional filters (with caching)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
   * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
   * @param {string} params.search - Search in name/description
   * @param {string} params.sort_by - Sort by field (default: 'created_at')
   * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
   * @param {boolean} params.skipCache - Skip cache and force fresh data
   * @returns {Promise}
   */
  async getRecipes(params = {}) {
    try {
      const { skipCache, ...queryParams } = params;
      
      // Generate cache key based on params
      const cacheKey = cacheManager.generateKey('recipes', queryParams);
      
      // Check cache first (unless skipCache is true)
      if (!skipCache) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Fetch from API
      const response = await apiClient.get('/api/v1/recipes', { params: queryParams });
      
      // Cache the response
      const ttl = queryParams.search ? this.cacheTTL.search : this.cacheTTL.list;
      cacheManager.set(cacheKey, response, ttl);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recipe by ID (with caching)
   * @param {string} id - Recipe ID
   * @param {boolean} skipCache - Skip cache and force fresh data
   * @returns {Promise}
   */
  async getRecipeById(id, skipCache = false) {
    try {
      const cacheKey = `recipe:${id}`;
      
      // Check cache first
      if (!skipCache) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Fetch from API
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      
      // Cache the response
      cacheManager.set(cacheKey, response, this.cacheTTL.detail);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new recipe (invalidates list cache)
   * @param {Object} recipeData - Recipe data
   * @returns {Promise}
   */
  async createRecipe(recipeData) {
    try {
      const response = await apiClient.post('/api/v1/recipes', recipeData);
      
      // Invalidate all recipe list caches
      cacheManager.invalidatePrefix('recipes');
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing recipe (invalidates related caches)
   * @param {string} id - Recipe ID
   * @param {Object} recipeData - Complete recipe data (all fields required)
   * @returns {Promise}
   */
  async updateRecipe(id, recipeData) {
    try {
      const response = await apiClient.put(`/api/v1/recipes/${id}`, recipeData);
      
      // Invalidate specific recipe cache and all list caches
      cacheManager.invalidate(`recipe:${id}`);
      cacheManager.invalidatePrefix('recipes');
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Partially update recipe (invalidates related caches)
   * @param {string} id - Recipe ID
   * @param {Object} partialData - Partial recipe data (only fields to update)
   * @returns {Promise}
   */
  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
      
      // Invalidate specific recipe cache and all list caches
      cacheManager.invalidate(`recipe:${id}`);
      cacheManager.invalidatePrefix('recipes');
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete recipe (invalidates related caches)
   * @param {string} id - Recipe ID
   * @returns {Promise}
   */
  async deleteRecipe(id) {
    try {
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);
      
      // Invalidate specific recipe cache and all list caches
      cacheManager.invalidate(`recipe:${id}`);
      cacheManager.invalidatePrefix('recipes');
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all recipe caches
   */
  clearCache() {
    cacheManager.invalidatePrefix('recipe');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheManager.getStats();
  }
}

export default new RecipeService();