'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "id" to table "equities"
 * changeColumn "isin" on table "equities"
 *
 **/

var info = {
    "revision": 7,
    "name": "noname",
    "created": "2018-07-18T12:58:05.385Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "equities",
            "id",
            {
                "type": Sequelize.INTEGER,
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "equities",
            "isin",
            {
                "type": Sequelize.STRING,
                "unique": true,
                "validate": {
                    "notEmpty": true,
                    "notNull": true
                }
            }
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
