const cacheKeys = {
  events: {
    all: () => 'events:all',
    byId: (id) => `event:${id}`,
  },
  shows: {
    byEvent: (eventId) => `shows:event:${eventId}`,
  }
};

module.exports = cacheKeys;
