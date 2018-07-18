'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "isin" on table "entities"
 *
 **/

var info = {
    "revision": 2,
    "name": "noname",
    "created": "2018-07-18T12:06:54.426Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "entities",
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
