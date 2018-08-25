
module.exports = (sequelize, DataTypes) => {
	const Op = sequelize.Op;
	let model = sequelize.define('equity', {
		isin: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		local_identifier: DataTypes.STRING,
		short_name: {
			type: DataTypes.STRING,

		},
		country: {
			type: DataTypes.STRING,
			defaultValue: "my",
		},
		website: DataTypes.STRING,
		email_ir: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true,
			}
		},
		sector : {
			type: DataTypes.STRING,
		},
		market : {
			type: DataTypes.STRING,
		},
	}, {underscored: true});

	model.associate = function(models) {
		model.hasMany(models.quotation, {
			foreignKey: 'isin',
			sourceKey: 'isin',
			onDelete: "CASCADE",
			as: 'Quotations',
		});
		model.hasMany(models.report, {
			foreignKey: 'isin',
			sourceKey: 'isin',
			onDelete: "CASCADE",
			as: 'Reports',
		});
	};

	model.prototype.getQuotations = function(dateFrom, dateTo=null) {
		if (!dateTo) {
			dateTo = (new Date(dateFrom)).setDate(dateFrom.getDate() + 1);
		}

		console.log(this.isin + " looking for quotations from " + dateFrom + " to " + dateTo);
		const Quotation = sequelize.import("./quotation");
		return Quotation.findAll({
			where: {
				date: {
					[Op.gte]: dateFrom,
					[Op.lt]: dateTo, 
				},
				isin: this.isin,
			}
		})
	}
	return model;
};