'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * dropTable "entities"
 * createTable "equities", deps: []
 *
 **/

var info = {
    "revision": 5,
    "name": "noname",
    "created": "2018-07-18T12:15:29.758Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "dropTable",
        params: ["entities"]
    },
    {
        fn: "createTable",
        params: [
            "equities",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "isin": {
                    "type": Sequelize.STRING,
                    "unique": true,
                    "validate": {
                        "notEmpty": true,
                        "notNull": true
                    }
                },
                "name": {
                    "type": Sequelize.STRING,
                    "validate": {
                        "notEmpty": true,
                        "notNull": true
                    }
                },
                "local_identifier": {
                    "type": Sequelize.STRING
                },
                "short_name": {
                    "type": Sequelize.STRING
                },
                "website": {
                    "type": Sequelize.STRING
                },
                "email_ir": {
                    "type": Sequelize.STRING,
                    "validate": {
                        "isEmail": true
                    }
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {}
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
