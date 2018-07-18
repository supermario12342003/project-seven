/*
* @Author: mchoong
* @Date:   2018-05-24 19:15:58
* @Last Modified by:   mchoong
* @Last Modified time: 2018-05-25 15:02:10
*/

const createError = require('http-errors');
const User = require('../models').User;
const BaseController = require('./base');


class UserController extends BaseController {
	constructor() {
		super(User);
	}

	login(req, res, next) {
		if (req.body.email && req.body.password) {
			User.authenticate(req.body.email, req.body.password)
			.then((user) => {
				if (user) {
					user.getToken(req.body.rememberMe)
					.then((token) => {
						res.status(200).send({token: token});
					})
					.catch(next);
				}
				else
					next(createError(400, "Invalid email or password"));
			})
			.catch(next)
		}
		else
			next(createError(400, "email and password are required"));
	}
}

module.exports = UserController;