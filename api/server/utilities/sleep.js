function _sleep(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	})
}

async function sleep(ms) {
	console.log("start sleep " + ms);
	await _sleep(ms)
	console.log("finish sleep " + ms);
}

module.exports = sleep;