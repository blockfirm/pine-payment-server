const defineRelations = (models) => {
  models.user.hasOne(models.avatar);
};

export default defineRelations;
