'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "equities", deps: []
 * createTable "quotations", deps: [equities]
 * createTable "reports", deps: [equities]
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2018-07-22T17:03:13.661Z",
    "comment": ""
};

var migrationCommands = [
    {
        fn: "createTable",
        params: [
            "reports",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "financial_year_end": {
                    "type": Sequelize.DATE,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "quarter": {
                    "type": Sequelize.ENUM('1', '2', '3', '4'),
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "report_end_date": {
                    "type": Sequelize.DATE,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "is_audited": {
                    "type": Sequelize.BOOLEAN,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "announce_date": {
                    "type": Sequelize.DATE,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "revenue": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "profit_loss_before_tax": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "profit_loss_for_period": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "profit_loss_to_holder": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "profit_loss_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "dividend_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "net_assets_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_revenue": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_profit_loss_before_tax": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_profit_loss_for_period": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_profit_loss_to_holder": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_profit_loss_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_dividend_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "py_net_assets_per_share": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true
                    },
                    "allowNull": false
                },
                "source_unique_reference": {
                    "type": Sequelize.STRING,
                    "allowNull": false,
                    "unique": true
                },
                "created_at": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updated_at": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "isin": {
                    "type": Sequelize.STRING,
                    "name": "isin",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "equities",
                        "key": "isin"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
