'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "close" on table "quotations"
 * changeColumn "close" on table "quotations"
 * changeColumn "date" on table "quotations"
 * changeColumn "date" on table "quotations"
 *
 **/

var info = {
    "revision": 7,
    "name": "noname",
    "created": "2018-08-07T16:27:22.859Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "quotations",
            "close",
            {
                "type": Sequelize.FLOAT,
                "validate": {
                    "notEmpty": true
                },
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "quotations",
            "close",
            {
                "type": Sequelize.FLOAT,
                "validate": {
                    "notEmpty": true
                },
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "quotations",
            "date",
            {
                "type": Sequelize.DATE,
                "unique": "compositeDateIsin",
                "validate": {
                    "notEmpty": true
                },
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "quotations",
            "date",
            {
                "type": Sequelize.DATE,
                "unique": "compositeDateIsin",
                "validate": {
                    "notEmpty": true
                },
                "allowNull": false
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
