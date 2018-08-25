'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "quotations", deps: [equities]
 *
 **/

var info = {
    "revision": 6,
    "name": "noname",
    "created": "2018-08-07T16:16:19.814Z",
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
                "unique": "compositeDateIsin",
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
            },
            "isin": {
                "type": Sequelize.STRING,
                "unique": "compositeDateIsin",
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
}];

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
