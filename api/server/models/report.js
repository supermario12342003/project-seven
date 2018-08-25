module.exports = (sequelize, DataTypes) => {
	let model = sequelize.define('report', {
		financial_year_end: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		quarter: {
			type:   DataTypes.ENUM,
			values: ['0', '1', '2', '3', '4'],
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		report_end_date: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		is_audited: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		announce_date: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		revenue: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		profit_loss_before_tax: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		profit_loss_for_period: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		profit_loss_to_holder: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		profit_loss_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		dividend_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		net_assets_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_revenue: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_profit_loss_before_tax: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_profit_loss_for_period: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_profit_loss_to_holder: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_profit_loss_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_dividend_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		py_net_assets_per_share: {
			type: DataTypes.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
			}
		},
		source_unique_reference: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		href: {
			type:DataTypes.STRING,
			unique:true,
			allowNull: false,
		}
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