/*
* @Author: mchoong
* @Date:   2018-05-25 09:38:28
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-18 16:20:05
*/

const express = require('express');
const router = express.Router();
const permissions = require("../permissions");
router.use(permissions.getUser);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'API' });
});

router.use('/equity', require('./equity'));

router.use((err, req, res, next) => {
	console.error(err);
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
