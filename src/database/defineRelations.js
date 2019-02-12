const defineRelations = (models) => {
  models.user.hasOne(models.avatar);
  models.user.hasMany(models.deviceToken);
};

export default defineRelations;
