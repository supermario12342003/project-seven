/*
* @Author: Mengwei Choong
* @Date:   2018-08-03 16:10:43
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-08-07 15:35:44
*/


const x = require('x-ray')();
const axios = require('axios');
const Equity = require('../server/models').equity;
const createError = require('../server/utilities/error_handlers').createError;
const logger = require('../server/utilities/logger').bursaLogger();
const url = "http://www.bursamalaysia.com/market/listed-companies/list-of-companies/plc-profile.html?stock_code=";

var options = {
	headers: {
		Cookie: "TS01472ad6=0196683c3dc4f214ffadeaff1a3c3113e1115f7959f1bd2a93daeb213d2a1ccbf65dd38bd11192b0dcb928737e0f9fc6c6aee96046; Path=/",
	}
};



function getExtraInfo(local_identifier) {
	let src = url + local_identifier;
	console.log(src);
	return bursaRequester(src)
	.then(response => {
		return x(response.data, "div.bm_stock_quote table.bm_table", {
			"market": "tr:nth-of-type(1) td",
			"sector": "tr:nth-of-type(2) td",
		});
	})
	.then(res => {
		console.log(res);
		return res;
	})
	.catch(console.error);
}


function main() {
	Equity.findAll()
	.then(async equities => {
		for(let i = 0; i < equities.length; i++) {
			if (!equities[i].sector) {
				let res = await getExtraInfo(equities[i].local_identifier);
				if (res) {
					equities[i].sector = res.sector.trim();
					equities[i].market = res.market.trim();
					await equities[i].save();
					console.log(i + "/ " + equities.length + " ---- got info, yeah");
				}
				else {
					console.log(i + "/ " + equities.length + " ---- get no info, abort");
					process.exit();
				}
			}
			else {
				console.log(i + "/ " + equities.length + " ---- info existed, skipped");
			}
		}
		console.log("finish");
		return equities;
	});
}