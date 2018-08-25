/*
var temp = "//tvc4.forexpros.com/init.php?family_prefix=tvc4&carrier=7bf468b0d3ddebcf898f0f9f600a47b8&time=1533652109&domain_ID=1&lang_ID=1&timezone_ID=8&pair_ID=950087&interval=86400&refresh=8&session=session&client=&user=guest&width=650&height=750&init_page=instrument&m_pids=&watchlist=&site=https://www.investing.com"

var temp2 = "//tvc4.forexpros.com/init.php?family_prefix=tvc4&carrier=4ab55ce88c16316cb84cdeb9e3a41aac&time=1533652451&domain_ID=1&lang_ID=1&timezone_ID=8&pair_ID=950473&interval=86400&refresh=8&session=session&client=&user=guest&width=650&height=750&init_page=instrument&m_pids=&watchlist=&site=https://www.investing.com"
https://tvc4.forexpros.com/7bf468b0d3ddebcf898f0f9f600a47b8/1533652109/1/1/8/history?symbol=950087&resolution=5&from=1533061500&to=1533110999

http://ws.shareinvestor.com/web_services/v2/charts/chart_quotes.xml?callback=jQuery1111009278424754786307_1533654314958&to_retrieve%5B%5D=historical_price&to_retrieve%5B%5D=news&years_of_news=5&years_of_historical_prices=5&days_of_intraday_prices=1&id=6556.MY&chg_pretrades_timing=0&with_married_deals=0&ws_hmac=eec7d876044ce9156216c0a51e28dd6f0420fcdc79de31847f119d23c3843215&ws_m1=6556.MY&ws_m2=1533654311&_=1533654314959

"http://ws.shareinvestor.com/web_services/v2/charts/chart_quotes.xml?"

"to_retrieve%5B%5D=historical_price&years_of_historical_prices=5&days_of_intraday_prices=1"
"&id=6556.MY"
"&ws_hmac=eec7d876044ce9156216c0a51e28dd6f0420fcdc79de31847f119d23c3843215"
"&ws_m1=6556.MY"
"&ws_m2=1533654311"

"http://ws.shareinvestor.com/web_services/v2/charts/chart_quotes.xml?"
"to_retrieve%5B%5D=historical_price&to_retrieve%5B%5D=news&years_of_news=5&years_of_historical_prices=5&days_of_intraday_prices=7&id=1724.MY"
"ws_hmac=1957a2f7ad9471db251008c5f19945b8274a7b6634125f45ee684c80844e08fb"
"&ws_m1=1724.MY"
"&ws_m2=1533654819&_=1533654821958"

"hmac":"5aa2d6b793252f6ed48043bab6702a949a3a8e8e92ad981167379d312de2924a","stock_ids_strings":"1724.MY","request_time_from_epoch":1533654992

5aa2d6b793252f6ed48043bab6702a949a3a8e8e92ad981167379d312de2924a

1533654992
*/


const x = require('x-ray')();
const axios = require('axios');
const Quotation = require('../server/models').quotation;
const Equity = require('../server/models').equity;
const createError = require('../server/utilities/error_handlers').createError;
const logger = require('../server/utilities/logger').bursaLogger();
const url = "http://www.bursamalaysia.com/market/listed-companies/list-of-companies/plc-profile.html?stock_code=";
const xmlStrToJson = require('xml2js').parseString;
const csvToJson=require("csvtojson");

async function getQuotations(equity, period=10) {
	let url = "http://www.shareinvestor.com/fundamental/factsheet.html?counter=" + equity.local_identifier + ".MY";

	return x(url, "div#sic_chart_container@class")
	.then(result => {
		return JSON.parse(result);
	})
	.then(data => {
		let url = "http://ws.shareinvestor.com/web_services/v2/charts/chart_quotes.xml?"
		+ "to_retrieve%5B%5D=historical_price&years_of_historical_prices=" + period + "&days_of_intraday_prices=1&id="
		+ data.stock_ids_strings + "&ws_hmac=" + data.hmac + "&ws_m1=" + data.stock_ids_strings
		+ "&ws_m2=" + data.request_time_from_epoch + "&_=" + Date.now();
		return url;
	})
	.then(axios.get)
	.then(response => {
		if (response.data.success) {
			return new Promise((resolve, reject) => {
				return xmlStrToJson(response.data.xml, (err, result) => {
					if (!err)
						resolve(result);
					else
						reject(err);
				});
			});
		}
		else {
			throw "response data success != true";
		}
	})
	.then(result => {
		return csvToJson({
			noheader:true,
			output: "csv"
		})
		.fromString(result.stock.quotes[0]);
	})
	.then((csvRows) => {
		let data = [];
		for (let i = 0; i < csvRows.length; i++) {
			if (csvRows[i].length == 6) {
				data.push({
					date: new Date(parseInt(csvRows[i][0])),
					open: csvRows[i][1],
					high: csvRows[i][2],
					low: csvRows[i][3],
					close: csvRows[i][4],
					volume: csvRows[i][5],
					isin: equity.isin,
				});
			}
		}
		
		data.sort(function(first, second) {
			return -(first.date - second.date);
		});
		return data;
	})
	.catch(console.error);
	console.log(data);
}

async function quotationToDatabase(equity, qs) {
	if (!qs) {
		return ;
	}
	console.log("got quotations");
	let count = 0;
	for (let j = 0; j < qs.length; j++) {
		let existQuotations = await equity.getQuotations(qs[j].date);
		if (existQuotations.length) {
			console.log(qs[j].date + " exists, break");
			if (count++ > 10) {
				break;
			}
		}
		else {
			await Quotation.create(qs[j])
			.catch(error => {
				console.error(error);
				throw "create failed";
			});
		}
	}
}

async function updateQuotations(equities, date) {
	let max = equities.length;
	for (let i = 38; i < max ; i++) {
		console.log(i + "/" + max + "  --- " + equities[i].isin);
		let existQuotations = await equities[i].getQuotations(date);
		if (existQuotations.length) {
			console.log(equities[i].isin + " on " + existQuotations[0].date + " closed at " + existQuotations[0].close);
			continue ;				
		}
		await getQuotations(equities[i])
		.then(quotationToDatabase)
		.catch(error => {
			console.log("getQuotations failed");
			console.error(error);
		});
	}
}

function main() {
	const date = new Date(Date.UTC(2018,7,9,0,0));

	Equity.findAll({
		order: [['local_identifier', 'ASC']],
	})
	.then(async (equities) => {
		await updateQuotations(equities, date);
		process.exit();
	})
	.catch(error => {
		console.error(error);
		process.exit();
	})
}

main();