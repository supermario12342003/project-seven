'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "id" from table "equities"
 * removeColumn "createdAt" from table "equities"
 * removeColumn "updatedAt" from table "equities"
 * createTable "quotations", deps: []
 * addColumn "created_at" to table "equities"
 * addColumn "updated_at" to table "equities"
 * changeColumn "isin" on table "equities"
 *
 **/

var info = {
    "revision": 6,
    "name": "noname",
    "created": "2018-07-18T12:53:36.055Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "quotations",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "date": {
                    "type": Sequelize.DATE,
                    "validate": {
                        "notEmpty": true,
                        "notNull": true
                    }
                },
                "open": {
                    "type": Sequelize.FLOAT
                },
                "close": {
                    "type": Sequelize.FLOAT,
                    "validate": {
                        "notEmpty": true,
                        "notNull": true
                    }
                },
                "high": {
                    "type": Sequelize.FLOAT
                },
                "low": {
                    "type": Sequelize.FLOAT
                },
                "volume": {
                    "type": Sequelize.INTEGER
                },
                "created_at": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updated_at": {
                    "type": Sequelize.DATE,
                    "allowNull": false
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
