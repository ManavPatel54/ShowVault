const { redisClient } = require('../config/redis');

const getCache = async (key) => {
  if (!redisClient.isOpen) return null;
  
  try {
    const data = await redisClient.get(key);
    if (data) {
      console.log(`CACHE HIT: ${key}`);
      return JSON.parse(data);
    }
    console.log(`CACHE MISS: ${key}`);
    return null;
  } catch (error) {
    console.warn(`Redis GET error for key ${key}:`, error.message);
    return null; // Graceful degradation
  }
};

const setCache = async (key, value, ttlSeconds) => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.warn(`Redis SET error for key ${key}:`, error.message);
  }
};

const deleteCache = async (key) => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn(`Redis DEL error for key ${key}:`, error.message);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache
};
