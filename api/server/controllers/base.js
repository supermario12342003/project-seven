/*
* @Author: mchoong
* @Date:   2018-05-24 19:17:43
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-28 17:20:55
*/
const createError = require('http-errors');
const jsonToCsv = require('../utilities/json_to_csv');

class BaseController {
	constructor(model) {
		this.model = model;
		this.create = this.create.bind(this);
		this.getMany = this.getMany.bind(this);
		this.getOne = this.getOne.bind(this);
		this.delete = this.delete.bind(this);
		this.update = this.update.bind(this);
		this.updateMany = this.updateMany.bind(this);
		this.deleteMany = this.deleteMany.bind(this);
	}

	static parseJSON(str) {
		try {
			return JSON.parse(str);
		}
		catch(error) {
			error.message = str + " <--- " + error.message;
			throw error;
		}
	}

	create(req, res, next) {
		return this.model
		.create(req.body)
		.then(data => res.status(201).send(data))			
		.catch(error => {
			next(createError(400, error.message));
		});
	}

	/*
	* handles sort=['title','ASC']&range=[0, 24]&filter={title:'bar'}
	*/
	static getNormalisedQuery(query) {
		let filter = {};
		let limit = 100000;
		let offset = 0;
		let order = [["created_at", "DESC"]];
		if (query.filter) {
			filter = BaseController.parseJSON(query.filter);
		}
		if (query.range) {
			let range = BaseController.parseJSON(query.range);
			offset = range[0];
			limit = range[1];
		}
		if (query.sort) {
			order = [BaseController.parseJSON(query.sort)];
		}
		return {
			where:filter,
			offset,
			limit,
			order,
			raw:true,
		};
	}

	/*
	* UPDATE_MANY => PUT http://path.to.my.api/posts?filter={"ids":[123,124,125]}
	* try to catch invalid query
	*/
	updateMany(req, res, next) {
		try {
			let filter = {};
			if (req.query.filter) {
				filter = BaseController.parseJSON(req.query.filter);
			}
			return this.model
			.update(req.body, {where: filter})
			.spread((affectedCount, affectedRows) => {
				res.status(200).send({affectedCount: affectedCount});
			})
			.catch(error => {
				next(createError(400, error.message));
			});
		}
		catch(error) {
			next(createError(400, error.message));
		}
	}

	/*
	* DELETE_MANY => DELETE http://path.to.my.api/posts?filter={"ids":[123,124,125]}
	*/
	deleteMany(req, res, next) {
		try {
			let filter = {};
			if (req.query.filter) {
				filter = BaseController.parseJSON(req.query.filter);
			}
			console.log(filter);
			return this.model
			.destroy({where: filter})
			.then(affectedCount => {
				res.status(200).send({affectedCount: affectedCount});
			})
			.catch(error => {
				next(createError(400, error.message));
			});
		}
		catch(error) {
			next(createError(400, error.message));
		}
	}

	/*
	* try to catch invalid query
	*/
	getMany(req, res, next) {
		try {
			req.normalisedQuery = BaseController.getNormalisedQuery(req.query);
			return this.model
			.findAndCountAll(req.normalisedQuery)
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
		catch(error) {
			return next(createError(400, error.message));
		}
	}

	getOne(req, res, next) {
		return this.model
		.findById(req.params.id)
		.then(data => res.status(200).send(data))			
		.catch(error => {
			next(createError(400, error.message));
		});
	};

	delete(req, res, next) {
		return this.model
		.findById(req.params.id)
		.then(obj => {
			obj.destroy()
			.then(() => res.status(200).send("success"))
			.catch(error => {
				next(createError(400, error.message));
			});
		})
		.catch(error => {
			next(createError(400, error.message));
		});
	};

	update(req, res, next) {
		return this.model
		.findById(req.params.id)
		.then(obj => {
			obj.update(req.body)
			.then(data => res.status(200).send(data))			
			.catch(error => {
				next(createError(400, error.message));
			});
		})
		.catch(error => {
			next(createError(400, error.message));
		});
	};
}

module.exports = BaseController;