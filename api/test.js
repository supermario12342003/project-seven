/*
* @Author: mchoong
* @Date:   2018-06-09 10:42:46
* @Last Modified by:   mchoong
* @Last Modified time: 2018-06-09 12:47:10
*/

process.env.NODE_ENV = "test";
const http = require('http');
const axios = require('axios');
const app = require('./app');
const server = http.createServer(app);
const models = require('./server/models');
const port = 1234;

var assert = require('assert');
describe('Pre-test', function() {
	describe('Environment', function() {
		it('should be test', function() {
			assert.equal(process.env.NODE_ENV, 'test');
		});
	});
});

describe('server-test', () => {

	before((done) => {
		server.listen(port);
		models.sequelize.drop({logging: false})
		.then(() => {
			done();
		});
	})

	after((done) => {
		server.close();
		models.sequelize.close()
		.then(() => {
			done();
		});
	})

	describe('one', () => {
		it('should be one', (done) => {
			axios.get('http://localhost:1234/api/users/')
			.then((response) => {
				console.log(response);
				done();
			})
			.catch((error) => {
				console.error(error);
				done(error);
			});
		})
	});
})