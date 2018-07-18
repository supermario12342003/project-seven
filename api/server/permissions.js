/*
* @Author: mchoong
* @Date:   2018-05-25 12:32:49
* @Last Modified by:   mchoong
* @Last Modified time: 2018-05-29 13:52:39
*/
const User = require('./models').User;
const createError = require('http-errors');

const isAdmin = (req, res, next) => {
	if (req.user && req.user.role === "admin")
		next()
	else 
		next(createError(403, "You need to be admin."));
}

const getUser = (req, res, next) => {
	let token;
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
		token = req.headers.authorization.split(' ')[1];
	else
		token = req.body.token || req.query.token;
	if (token) {
		User.verifyToken(token)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch(next);
	}
	else {
		next();
	}
}

module.exports = {
	isAdmin,
	getUser,
}