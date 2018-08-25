/*
* @Author: mchoong
* @Date:   2018-05-24 19:15:58
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-22 19:52:51
*/

const createError = require('http-errors');
const BaseController = require('./base');
const Model = require('../models').equity;
const Quotation = require('../models').quotation;
const Report = require('../models').report;
const Op = require('sequelize').Op;
const jsonToCsv = require('../utilities/json_to_csv');

class Controller extends BaseController {
	constructor() {
		super(Model);
		this.getQuotations = this.getQuotations.bind(this);
		this.getReports = this.getReports.bind(this);
	}

	getQuotations(req, res, next) {
		req.normalisedQuery = BaseController.getNormalisedQuery(req.query);
		console.log(req.params.id);
		req.normalisedQuery.where.isin = req.params.id;
		Quotation.findAndCountAll(req.normalisedQuery)
		.then(data => {
			if (req.query.format && req.query.format == 'csv') {
				var csv = jsonToCsv(data.rows);
				res.attachment('data.csv');
				res.type('text');
				res.send(csv);
			}
			else
				res.status(200).send(data);
		})
		.catch(error => {
			next(createError(400, error.message));
		});
	}

	getReports(req, res, next) {
		req.normalisedQuery = BaseController.getNormalisedQuery(req.query);
		Model.findOne({where:{id:req.params.id}})
		.then(instance => {
			req.normalisedQuery.where.isin = instance.isin;
			console.log(instance.isin);
			Report.findAndCountAll(req.normalisedQuery)
			.then(data => {
				if (data.count && req.query.format && req.query.format == 'csv') {
					var csv = jsonToCsv(data.rows);
					res.attachment('data.csv');
					res.type('text');
					res.send(csv);
				}
				else
					res.status(200).send(data);
			})
			.catch(error => {
				next(createError(400, error.message));
			});
		});
	}
}

module.exports = Controller;