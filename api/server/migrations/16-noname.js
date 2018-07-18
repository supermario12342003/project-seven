'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "isin" on table "equities"
 *
 **/

var info = {
    "revision": 16,
    "name": "noname",
    "created": "2018-07-18T15:28:24.400Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "equities",
        "isin",
        {
            "type": Sequelize.STRING,
            "primaryKey": true,
            "validate": {
                "notEmpty": true,
                "notNull": true
            }
        }
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
