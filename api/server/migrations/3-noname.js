'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * dropTable "entities"
 *
 **/

var info = {
    "revision": 3,
    "name": "noname",
    "created": "2018-07-18T12:13:14.114Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "dropTable",
    params: ["entities"]
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
