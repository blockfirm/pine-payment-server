const defineRelations = (models) => {
  models.user.hasOne(models.avatar);
  models.user.hasMany(models.deviceToken);
  models.user.hasMany(models.contactRequest);
};

export default defineRelations;
