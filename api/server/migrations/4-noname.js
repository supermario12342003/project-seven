'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "date" on table "quotations"
 *
 **/

var info = {
    "revision": 4,
    "name": "noname",
    "created": "2018-08-07T16:11:05.345Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "quotations",
        "date",
        {
            "type": Sequelize.DATE,
            "unique": "compositeDateIsin",
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
