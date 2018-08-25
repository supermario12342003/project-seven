const winston = require("winston");

const _createLogger = function(filename) {
	return winston.createLogger({
		level: 'silly',
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.prettyPrint(),
			winston.format.json()
		),
		transports: [
		new winston.transports.Console({ level: 'info' }),
		new winston.transports.File({ filename: __dirname + filename })
		]
	});
}

function generalLogger() {
	return _createLogger('/logs/general.log');
}

const bursaLogger = function() {
	return _createLogger('/logs/bursa.log');
}

module.exports = {
	bursaLogger,
	generalLogger,
}