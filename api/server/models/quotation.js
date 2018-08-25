module.exports = (sequelize, DataTypes) => {
  let model = sequelize.define('quotation', {
  	date: {
  		type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      unique: "compositeDateIsin",
    },
    open: {
      type: DataTypes.FLOAT,
    },
    close: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
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
        unique: "compositeDateIsin",
      },
      targetKey: 'isin',
      validate: {
        notEmpty: true,
      },
    });
  };
  return model;
};