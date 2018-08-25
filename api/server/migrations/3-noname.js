'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "sector" to table "equities"
 * addColumn "market" to table "equities"
 * changeColumn "quarter" on table "reports"
 *
 **/

var info = {
    "revision": 3,
    "name": "noname",
    "created": "2018-08-03T14:36:22.347Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "equities",
            "sector",
            {
                "type": Sequelize.STRING
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "equities",
            "market",
            {
                "type": Sequelize.STRING
            }
        ]
    },
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
