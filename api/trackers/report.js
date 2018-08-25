
const fs = require('fs');
const path = require('path');
const Xray = require('x-ray');
const x = Xray();
const queryString = require('querystring');
const axios = require('axios');
const Equity = require('../server/models').equity;
const Report = require('../server/models').report;
const moment = require('moment');
const createError = require('../server/utilities/error_handlers').createError;
const sleep = require('../server/utilities/sleep');
const logger = require('../server/utilities/logger').bursaLogger();
const Op = require('sequelize').Op;
var options = {
	headers: {
		"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
		"Cookie": "TS0110e099=01c0211da88ff139e0a407b2dc466695048741c955a27f5f5cbe858194b5bec8b078a924dd; Path=/",
	}
};
var waitingTime = 45;
var globalCount = 0;
var retryCount = 0;
var maximumRetry = 10;

var prepareReportInfo = async function(srcHtml) {
	let reportInfo = {};
	let firstRowTitle = await x(srcHtml, 'table.formContentTable tr:nth-of-type(1) td:nth-of-type(1)');
	if (firstRowTitle.indexOf('Year End') > -1) {
		reportInfo.financial_year_end = await x(srcHtml, 'table.formContentTable tr:nth-of-type(1) td:nth-of-type(2)');
		reportInfo.report_end_date = await x(srcHtml, 'table.formContentTable tr:nth-of-type(3) td:nth-of-type(2)');
	}
	else {
		reportInfo.financial_year_end = await x(srcHtml, 'table.formContentTable tr:nth-of-type(3) td:nth-of-type(2)');
		reportInfo.report_end_date = await x(srcHtml, 'table.formContentTable tr:nth-of-type(1) td:nth-of-type(2)');
	}

	if (reportInfo.financial_year_end.indexOf('/') == -1)
		reportInfo.financial_year_end = moment(reportInfo.financial_year_end + ' 12', 'DD MMM YYYY HH');
	else
		reportInfo.financial_year_end = moment(reportInfo.financial_year_end + ' 12', 'DD/MM/YYYY HH');
	if (reportInfo.report_end_date.indexOf('/') == -1)
		reportInfo.report_end_date = moment(reportInfo.report_end_date + ' 12', 'DD MMM YYYY HH');
	else
		reportInfo.report_end_date = moment(reportInfo.report_end_date + ' 12', 'DD/MM/YYYY HH');

	reportInfo.quarter = await x(srcHtml, 'table.formContentTable tr:nth-of-type(2) td:nth-of-type(2)');
	reportInfo.quarter = reportInfo.quarter[0];
	if (!["1", "2", "3", "4"].includes(reportInfo.quarter)) {
		reportInfo.quarter = "0";
	}

	reportInfo.is_audited = await x(srcHtml, 'table.formContentTable tr:nth-of-type(4) td:nth-of-type(2)');
	reportInfo.is_audited = !(reportInfo.is_audited.trim() === 'have not been audited');

	reportInfo.announce_date = await x(srcHtml, 'div.ven_announcement_info tr:nth-of-type(3) td:nth-of-type(2)');
	reportInfo.announce_date = moment(reportInfo.announce_date + ' 12', 'DD MMM YYYY HH');

	reportInfo.revenue = await x(srcHtml, 'table.ven_table tr:nth-of-type(6) td:nth-of-type(3)');
	reportInfo.profit_loss_before_tax = await x(srcHtml, 'table.ven_table tr:nth-of-type(7) td:nth-of-type(3)');
	reportInfo.profit_loss_for_period = await x(srcHtml, 'table.ven_table tr:nth-of-type(8) td:nth-of-type(3)');
	reportInfo.profit_loss_to_holder = await x(srcHtml, 'table.ven_table tr:nth-of-type(9) td:nth-of-type(3)');
	reportInfo.profit_loss_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(10) td:nth-of-type(3)');
	reportInfo.dividend_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(11) td:nth-of-type(3)');
	reportInfo.py_revenue = await x(srcHtml, 'table.ven_table tr:nth-of-type(6) td:nth-of-type(4)');
	reportInfo.py_profit_loss_before_tax = await x(srcHtml, 'table.ven_table tr:nth-of-type(7) td:nth-of-type(4)');
	reportInfo.py_profit_loss_for_period = await x(srcHtml, 'table.ven_table tr:nth-of-type(8) td:nth-of-type(4)');
	reportInfo.py_profit_loss_to_holder = await x(srcHtml, 'table.ven_table tr:nth-of-type(9) td:nth-of-type(4)');
	reportInfo.py_profit_loss_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(10) td:nth-of-type(4)');
	reportInfo.py_dividend_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(11) td:nth-of-type(4)');
	reportInfo.source_unique_reference = await x(srcHtml, 'div.ven_announcement_info tr:nth-of-type(5) td:nth-of-type(2)');

	reportInfo.revenue = parseFloat(reportInfo.revenue.trim().replace(/,/g, ''));
	reportInfo.profit_loss_before_tax = parseFloat(reportInfo.profit_loss_before_tax.trim().replace(/,/g, ''));
	reportInfo.profit_loss_for_period = parseFloat(reportInfo.profit_loss_for_period.trim().replace(/,/g, ''));
	reportInfo.profit_loss_to_holder = parseFloat(reportInfo.profit_loss_to_holder.trim().replace(/,/g, ''));
	reportInfo.profit_loss_per_share = parseFloat(reportInfo.profit_loss_per_share.trim().replace(/,/g, ''));
	reportInfo.dividend_per_share = parseFloat(reportInfo.dividend_per_share.trim().replace(/,/g, ''));
	reportInfo.py_revenue = parseFloat(reportInfo.py_revenue.trim().replace(/,/g, ''));
	reportInfo.py_profit_loss_before_tax = parseFloat(reportInfo.py_profit_loss_before_tax.trim().replace(/,/g, ''));
	reportInfo.py_profit_loss_for_period = parseFloat(reportInfo.py_profit_loss_for_period.trim().replace(/,/g, ''));
	reportInfo.py_profit_loss_to_holder = parseFloat(reportInfo.py_profit_loss_to_holder.trim().replace(/,/g, ''));
	reportInfo.py_profit_loss_per_share = parseFloat(reportInfo.py_profit_loss_per_share.trim().replace(/,/g, ''));
	reportInfo.py_dividend_per_share = parseFloat(reportInfo.py_dividend_per_share.trim().replace(/,/g, ''));

	reportInfo.net_assets_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(13) td:nth-of-type(3)');
	if (!reportInfo.net_assets_per_share) {
		reportInfo.net_assets_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(13) td:nth-of-type(5)');
	}
	reportInfo.net_assets_per_share = parseFloat(reportInfo.net_assets_per_share.trim().replace(/,/g, ''));

	reportInfo.py_net_assets_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(13) td:nth-of-type(4)');
	if (!reportInfo.py_net_assets_per_share)
		reportInfo.py_net_assets_per_share = await x(srcHtml, 'table.ven_table tr:nth-of-type(13) td:nth-of-type(6)');
	reportInfo.py_net_assets_per_share = parseFloat(reportInfo.py_net_assets_per_share.trim().replace(/,/g, ''));
	return reportInfo;
}

function createReport(srcHtml, url, equity) {
	return new Promise(async (resolve, reject) => {
		logger.info("preparing Report");
		var reportInfo = {};
		try {
			reportInfo = await prepareReportInfo(srcHtml);
		}
		catch(error) {
			logger.error("prepare report info failed");
			logger.debug(error.message);
			reject();
		}
		reportInfo.isin = equity.isin;
		reportInfo.href = url;
		Report.create(reportInfo)
		.then(report => {
			logger.info("Report " + url + " is created");
			resolve(report);
		})
		.catch((error) => {
			console.error(error);
			logger.error("Report create failed");
			logger.debug(error.message);
			reject();
		});
	});
}

function createOldReport(url, announce_year) {
	let temps = url.split('/');
	let ref = temps[temps.length - 1];
	return Report.create({
		financial_year_end: Date.now(),
		quarter: "0",
		report_end_date: Date.now(),
		is_audited: false,
		announce_date: new Date('1989-12-17T03:24:00'),
		revenue: 0,
		profit_loss_before_tax: -1,
		profit_loss_for_period: -1,
		profit_loss_to_holder: -1,
		profit_loss_per_share: -1,
		dividend_per_share: -1,
		net_assets_per_share: -1,
		py_revenue: -1,
		py_profit_loss_before_tax: -1,
		py_profit_loss_for_period: -1,
		py_profit_loss_to_holder: -1,
		py_profit_loss_per_share: -1,
		py_dividend_per_share: -1,
		py_net_assets_per_share: -1,
		source_unique_reference: "TOO_OLD_" + ref + "_" + announce_year,
		href: url,
	})
	.then(report => {
		logger.info("Report (too old) " + url + " is created");
		return report;
	})
	.catch((error) => {
		logger.error("Report create (too old) failed");
		console.error(error);
		logger.debug(error.message);
	});
}

function scrap(srcHtml, url, equity) {
	try {
		return x(srcHtml, 'div.ven_announcement_info tr:nth-of-type(3) td:nth-of-type(2)')
		.then(announce_date => {
			return parseInt(announce_date.split(' ')[2]);
		})
		.then(announce_year => {
			logger.info(announce_year);
			if (!announce_year) {
				console.error("get srcHtml failed --- announce_year === 0");
				process.exit();
			}
			logger.verbose("got srcHtml");
			if (announce_year >= 2003) {
				return createReport(srcHtml, url, equity);
			}
			else {
				return createOldReport(url, announce_year);
			}
		})
		.catch((error) => {
			logger.error("get srcHtml failed --- catched");
			console.error(error);
		});
	}
	catch {
		console.log("xray failed");
		return null;
	}
	
}

async function scanReportPage(url) {
	return x(url, 'div.bm_grid2 iframe@src')
	.then(link => {
		console.log("link ===>>>>> " + link);
		return axios.get(link, options);
	})
	.then(response => {
		if (response.headers["set-cookie"]) {
			options["Cookies"] = "";
			for (let i = 0; i < response.headers["set-cookie"].length; i++) {
				options["Cookies"] += response.headers["set-cookie"][i];
				options["Cookies"] += ";";
			}
			console.log(options["Cookies"]);
		}
		return x(response.data, "body@html")
	})
	.then(html => {
		if (!html) {
			throw "srcHtml is empty";
		}
		else {
			retryCount = 0;
			globalCount++;
			console.log("globalCount = " + globalCount);
			return html.trim();
		}
	})
	.catch(async error => {
		console.log(error);
		console.log("scanReportPage failed ==> " + url);
		retryCount++;
		if (retryCount > maximumRetry) {
			throw "maximum retry";
		}
		await sleep(waitingTime * 1000);
		return scanReportPage(url);
	})
}

async function scanReportListPage(equity, html) {
	var requests = [];

	try {
		var hrefs = await x(html, ['tr td:nth-of-type(4) a@href'])
	}
	catch(error) {
		logger.error("failed to get hrefs");
		logger.debug(error.message);
		return requests;
	}

	for (let i = 0; i < hrefs.length; i++) {
		hrefs[i] = 'http://www.bursamalaysia.com' + hrefs[i];
		let req = new Promise((resolve, reject) => {
			Report.findOne({
				where:{
					href: hrefs[i]
				},
				attributes:['id'],
			})
			.then(async (report) => {
				if (!report) {
					logger.info("scanReportPage " + hrefs[i]);
					scanReportPage(hrefs[i])
					.then(async srcHtml => {
						let createdReport = await scrap(srcHtml, hrefs[i], equity);
						if (createdReport != null) {
							await sleep(waitingTime * 1000);
						}
						resolve(createdReport);
					})
					.catch(error => {
						console.log("skip", error);
						resolve();
					});
				}
				else {
					logger.verbose("Report " + report.id + " exists");
					resolve(report);
				}
			})
			.catch((error) => {
				console.error(error);
				reject();
			});
		});
		await req.then(report => {console.log('done');});
		//requests.push(req);
	}
	return requests;
}

async function getFinancialReportFromBursa(equity) {
	var page = 1;
	var host = 'http://ws.bursamalaysia.com/market/listed-companies/company-announcements/announcements_listing_f.html?_=1532260415175&page_category=company&category=FA&sub_category=FA1&company=';
	var url = host + equity.local_identifier;
	var maxPage = 1;
	var isMaxPageValid = false;
	var requests = [];

	while (page <= maxPage) {
		await axios.get(url + '&page=' + page)
		.then(async response => {
			if (response) {
				if (!isMaxPageValid) {
					try {
						maxPage = await x(response.data.pagination, 'span.bm_total_page');
					}
					catch(error) {
						logger.error("failed to get max_page for equity " + equity.local_identifier);
						return ;
					}
					logger.verbose("update maxPage to " + maxPage);
					isMaxPageValid = true;
				}
				try {
					logger.info("scanning Report list for page " + page + "/" + maxPage);
					requests = requests.concat(await scanReportListPage(equity, response.data.html));
				}
				catch(error) {
					logger.warn("scanReportListPage failed " + equity.local_identifier + " page=" + page);
					logger.debug(error);
				}
			}
		})
		.catch(error => {
			logger.error("failed to get response on url " + url + '&page=' + page);
		});
		page++;
	}
	console.log("waiting all requests........");
	await Promise.all(requests)
	.then(result => {
		console.log("finish equity " + equity.isin);
	})
	.catch(error => {
		console.log("somethign went wrong");
		console.log(error);
		process.exit();
	})
	//wait all promises
}

var getSmallMidCapList = function() {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, 'smallmidcap.json'), 'utf8', (err, data) => {
			if (!err) {
				let list = JSON.parse(data);
				logger.info('Small Mid Cap List length = ' + list.length);
				resolve(list);
			}
			else {
				logger.warn('failed to readFile ' + __dirname, 'smallmidcap.json');
				reject(err);
			}
		});
	});
}

async function getEquities(list) {
	return Equity.findAll({
		where:{
			local_identifier: {
				[Op.or]: list,
			}
		},
		order: [['local_identifier', 'ASC'],],
	})
}

function main() {
	getSmallMidCapList()
	.then(getEquities)
	.then(async (equities) => {
		for (let i = 166; i < equities.length; i++) {
			logger.info(i + "/" + equities.length + " <------------ getting Financial Report for [" + equities[i].local_identifier + "] ------------> ");
			await getFinancialReportFromBursa(equities[i])
			logger.info(i + "/" + equities.length + " <------------ Finish getting Financial Report for [" + equities[i].local_identifier + "] ------------> ");
		}
	})
	.then(() => {
		process.exit();
	})
	.catch((error) => {
		console.error(error);
		logger.on('close', process.exit);
	});
}
main();