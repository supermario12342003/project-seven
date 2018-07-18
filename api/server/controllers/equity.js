/*
* @Author: mchoong
* @Date:   2018-05-24 19:15:58
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-18 17:41:06
*/

const createError = require('http-errors');
const BaseController = require('./base');
const Model = require('../models').equity;
const Quotation = require('../models').quotation;
const Op = require('sequelize').Op;


class Controller extends BaseController {
	constructor() {
		super(Model);
		this.getQuotations = this.getQuotations.bind(this);
	}

	getQuotations(req, res, next) {
		req.normalisedQuery = BaseController.getNormalisedQuery(req.query);
		console.log(req.params.id);
		req.normalisedQuery.where.isin = req.params.id;
		Quotation.findAndCountAll(req.normalisedQuery)
		.then(data => {
			res.status(200).send(data);
		})
		.catch(error => {
			next(createError(400, error.message));
		});
	}
}

module.exports = Controller;