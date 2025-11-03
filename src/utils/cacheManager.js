// src/utils/cacheManager.js
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Generate cache key from params
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}${sortedParams ? `::${sortedParams}` : ''}`;
  }

  /**
   * Set cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  /**
   * Get cached data if not expired
   */
  get(key) {
    const timestamp = this.timestamps.get(key);
    
    // Check if cache exists and is not expired
    if (timestamp && Date.now() < timestamp) {
      return this.cache.get(key);
    }

    // Remove expired cache
    if (timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    }

    return null;
  }

  /**
   * Check if cache exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalidate specific cache
   */
  invalidate(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Invalidate all caches matching prefix
   */
  invalidatePrefix(prefix) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now < timestamp) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
