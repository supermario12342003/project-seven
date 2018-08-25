/*
* @Author: Mengwei Choong
* @Date:   2018-07-28 12:01:09
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-07-28 19:03:47
*/

const Logger = require('./logger');

const logError = function(error, msg="", logger) {
	return new Promise((resolve, reject) => {
		console.error(msg);
		logger.error(msg);
		logger.debug(error);
		resolve();
	});
}

const createError = function(msg, logger) {
	if (!logger) {
		logger = Logger.generalLogger();
	}
	return (error) => logError(error, msg, logger);
}

module.exports = {createError}