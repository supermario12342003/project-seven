'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "isin" on table "quotations"
 *
 **/

var info = {
    "revision": 9,
    "name": "noname",
    "created": "2018-08-07T16:30:26.394Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "quotations",
        "isin",
        {
            "type": Sequelize.STRING,
            "unique": "compositeDateIsin",
            "name": "isin",
            "onUpdate": "CASCADE",
            "onDelete": "CASCADE",
            "references": {
                "model": "equities",
                "key": "isin"
            },
            "allowNull": false
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
