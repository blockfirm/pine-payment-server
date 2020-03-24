const getChannelProperty = (redis, userId, key) => {
  return redis.get(`pine:lightning:user:${userId}:channel:${key}`);
};

export default getChannelProperty;
