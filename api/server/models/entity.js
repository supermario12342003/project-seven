module.exports = (sequelize, DataTypes) => {
  let entity = sequelize.define('entity', {
  	isin: {
  		type: DataTypes.STRING,
  		validate: {
  			notEmpty: true,
  			notNull: true,
  		}
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
  }, {});
  entity.associate = function(models) {
    // associations can be defined here
  };
  return entity;
};