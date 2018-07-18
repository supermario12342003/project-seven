'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "equity_id" from table "quotations"
 *
 **/

var info = {
    "revision": 12,
    "name": "noname",
    "created": "2018-07-18T13:46:33.585Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "removeColumn",
    params: ["quotations", "equity_id"]
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
