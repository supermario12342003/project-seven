module.exports = (sequelize, DataTypes) => {
  let model = sequelize.define('quotation', {
  	date: {
  		type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
    open: {
      type: DataTypes.FLOAT,
    },
    close: {
      type: DataTypes.FLOAT,
      validate: {
        notEmpty: true,
        notNull: true,
      },
    },
    high: {
      type: DataTypes.FLOAT,
    },
    low: {
      type: DataTypes.FLOAT,
    },
    volume: {
      type: DataTypes.INTEGER,
    },
  }, {underscored: true});
  model.associate = function(models) {
    // associations can be defined here
    model.belongsTo(models.equity, {
      foreignKey: {
        name: 'isin',
        allowNull: false,
      },
      targetKey: 'isin',
      validate: {
        notEmpty: true,
        notNull: true,
      },
    });
  };
  return model;
};