module.exports = (sequelize, DataTypes) => {
  let model = sequelize.define('equity', {
  	isin: {
  		type: DataTypes.STRING,
  		validate: {
  			notEmpty: true,
  			notNull: true,
  		},
      primaryKey: true,
  	},
  	name: {
  		type: DataTypes.STRING,
  		validate: {
  			notEmpty: true,
  			notNull: true,
  		}
  	},
  	local_identifier: DataTypes.STRING,
  	short_name: {
  		type: DataTypes.STRING,

  	},
  	website: DataTypes.STRING,
  	email_ir: {
  		type: DataTypes.STRING,
  		validate: {
  			isEmail: true,
  		}
  	}
  }, {underscored: true});
  model.associate = function(models) {
    model.hasMany(models.quotation, {
      foreignKey: 'isin',
      sourceKey: 'isin',
      onDelete: "CASCADE",
      as: 'Quotations',
    });
  };
  return model;
};