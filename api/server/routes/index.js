/*
* @Author: mchoong
* @Date:   2018-05-25 09:38:28
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-18 12:39:56
*/

const express = require('express');
const router = express.Router();
const permissions = require("../permissions");
router.use(permissions.getUser);
//router.use('/todoitems', require('./todoitem'));

router.use((err, req, res, next) => {
	let data;
	if (err.message) {
		data = err;
	}
	else {
		data = {
			message: err.errors[0].message,
			path: err.errors[0].path,
			type: err.errors[0].type,
		};
	}
	res.status(err.status || 500).send(data);
})

module.exports = router;
