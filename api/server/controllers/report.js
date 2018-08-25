/*
* @Author: mchoong
* @Date:   2018-05-24 19:15:58
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-24 11:06:50
*/

const createError = require('http-errors');
const BaseController = require('./base');
const Model = require('../models').report;

class Controller extends BaseController {
	constructor() {
		super(Model);
	}
}

module.exports = Controller;