/*
* @Author: Mengwei Choong
* @Date:   2018-07-19 12:19:33
* @Last Modified by:   Mengwei Choong
* @Last Modified time: 2018-08-13 10:28:07
*/

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
var options = {
	headers: {
		Cookie: "TS0110e099=01c0211da86fe24afbc1c9059328b81cddfe9cd991986cd56d84efe6ee2981f9b85635a1fc; Path=/",
	}
};

function bursaRequester(url) {
	return axios.get(url, options)
	.then(response => {
		let key = response.request.res.headers["set-cookie"];
		if (key) {
			console.log("refresh key");
			options = {headers: {Cookie: key}};
		}
		return response;
	});
}

var getList = function() {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, 'bursa_org.json'), 'utf8', (err, data) => {
			if (!err) {
				let list = JSON.parse(data)[0];
				let i = list.length;
				while (i--) {
					if (list[i].type != 's' || list[i].id.length > 4) {
						list.splice(i, 1);
					}
				}
				resolve(list);
			}
			else {
				reject(err);
			}
		});
	});
}

var getListFromBursamalaysia = function() {
	var url = 'http://www.bursamalaysia.com/searchbox_data.json';

	return axios.get(url)
	.then(response => {
		let list = response.data[0];
		let i = list.length;
		while (i--) {
			if (list[i].type != 's' || list[i].id.length > 4) {
				list.splice(i, 1);
			}
		}
		return list;
	})
	.catch(console.error);
}

var getExisting = function(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, filename), 'utf8', (err, data) => {
			if (!err)
				resolve(JSON.parse(data));
			else
				reject(err);
		});
	});
}

var getIsinFromInvesting = function(name) {
	var host = 'https://www.investing.com/equities/'
	var name = name.toLowerCase().replace(/ /g, '-').replace('berhad', 'bhd')

	return x(host + name, 'div#quotes_summary_current_data div.right div:nth-child(3) span:nth-of-type(2)')
	.then(isin => {
		if (isin) {
			return isin.trim();
		}
		else {
			name = name.replace('.', '-');
			return x(host + name, 'div#quotes_summary_current_data div.right div:nth-child(3) span:nth-of-type(2)')
			.then(isin => {
				if (isin)
					return isin.trim();
				else
					return '';
			})
		}
	})
	.catch(err => {
		console.log(err);
	});
}

var getIsinFromZonebourse = function(name) {
	var host = 'https://www.zonebourse.com/indexbasegauche.php?lien=recherche&mots=';
	var url = host + queryString.escape(name);

	return x(url, 'td#zbCenter table table:nth-of-type(1) tr:nth-of-type(2) table tr:nth-of-type(2)@html')
	.then(html => {
		if (html) {
			return x(['<div>', html, '</div>'].join(), 'td:nth-of-type(2) a@href')
			.then(url => {
				return x(url, 'td#zbCenter td.std_txtS span:nth-of-type(5)')
				.then(isin => {
					return isin.trim();
				});
			})
			.catch(console.error);
		}
		else
			return '';
	})
	.catch(console.error)
}

var getIsinFromInfrontanalytics = function(data) {
	var host = 'https://www.infrontanalytics.com/Eurofin/autocomplete?keyname=';
	var url = host + queryString.escape(data.name);

	return axios.get(url)
	.then((response) => {
		var isValid = (info) => {
			return (info.isin && info.ticker == data.id);
		}
		if (response && response.data && isValid(response.data[0])) {
			return response.data[0].isin;
		}
		else {
			url = host + queryString.escape(data.name.split(' ')[0] + ' MYL');
			return axios.get(url)
			.then((response) => {
				if (response && response.data && isValid(response.data[0])) {
					return response.data[0].isin;
				}
				else
					return '';
			})
			.catch(console.error);
		}
		console.log(response.data[0]);
	})
	.catch(console.error);
}

var saveExisting = function(json, filename) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path.join(__dirname, filename), JSON.stringify(json), function(err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

var saveToDatabase = function(isin, bursaInfo) {
	return Equity.create({
		isin: isin,
		local_identifier: bursaInfo.id,
		name: bursaInfo.name,
		short_name: bursaInfo.short_name,
	})
	.then(equity => {
		console.log(equity.name + ' isin: ' + equity.isin + ' saved.');
		return equity;
	})
	.catch(console.error);
}

var getListWithIsin = function() {
	getExisting('existing.json')
	.then(existing => {
		getList()
		.then(async (list) => {
			let count = 0;
			await (async (list) => {
				for (let i = 0; i < list.length; i++) {
					if (!(list[i].id in existing)) {
						let isin = '';
						isin = await getIsinFromInfrontanalytics(list[i]);
						/*
						isin = await getIsinFromInvesting(list[i].name);
						if (!isin) {
							isin = await getIsinFromZonebourse(list[i].name);
						}
						*/
						if (isin) {
							existing[list[i].id] = isin;
							console.log('got isin ' + isin);
						}
						else {
							console.log(list[i]);
							count++
						}
					}
				}
			})(list);
			saveExisting(existing, 'existing.json')
			.catch(console.error);
			console.log(count);
		})
		.catch(console.error);
	})
	.catch(console.error);
}

var filterNewInList = function(list, country) {
	return Equity.findAll({
		where: {
			country: country,
		},
		attributes: ['local_identifier', 'isin', 'name'],
	})
	.then(equities => {
		let i = list.length;
		while (i--) {
			let count = 0;
			for(let count = 0; count < equities.length; count++) {
				if (equities[count].local_identifier == list[i].id) {
					console.log('exist ' + list[i].id + ' ' + equities[count].isin + ' ' + equities[count].name);
					list.splice(i, 1);
					break ;
				}
			}
		}
		console.log(list.length);
		return list;
	})
	.catch(console.error);
}

var determineFinalIsin = function (isins) {
	if (isins[0] == isins[1] && isins[0])
		return isins[0];
	else if (isins[0] == isins[2] && isins[0])
		return isins[0];
	else if (isins[1] == isins[2] && isins[1])
		return isins[1];
	else if (isins[0])
		return isins[0];
	else if (isins[1])
		return isins[1];
	else if (isins[2])
		return isins[2];
	else
		return '';
}

var scan = async function(list) {
	for (let i = 0; i < list.length; i++) {
		let isin1 = await getIsinFromInvesting(list[i].name);
		let isin2 = await getIsinFromZonebourse(list[i].name);
		let isin3 = await getIsinFromInfrontanalytics(list[i]);
		let isin = determineFinalIsin([isin1, isin2, isin3]);
		if (isin)
			await saveToDatabase(isin, list[i]);
		else {
			console.log('failed to find isin ', [isin1, isin2, isin3], list[i]);
		}
	}
}

var clean = function() {
	Equity.findAll()
	.then(equities => {
		for(let i = 0; i < equities.length; i++) {
			if (equities[i].isin.indexOf(equities[i].local_identifier) == -1) {
				equities[i].destroy()
				.then(() => {
					console.log('delete ' + equities[i].isin + ' id '+ equities[i].local_identifier);

				});
			}
		}
	});
}

var updateEquity = function() {
	getListFromBursamalaysia()
	.then(list => filterNewInList(list, 'my'))
	.then(scan)
	.finally(() => {
		console.log('finish');
		process.exit();
	})
	.catch(console.error);
}



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

var scanReportPage = async function(equity, url) {
	try {
		let src = await x(url, 'div.bm_grid2 iframe@src');
		console.log(src);
		var srcHtml = await bursaRequester(src)
		.then(async response => {
			let html = await x(response.data, "body@html");
			return html.trim();
		});
		if (!srcHtml) {
			console.error("get srcHtml failed --- !srcHtml");
			process.exit();
		}
		let announce_date = await x(srcHtml, 'div.ven_announcement_info tr:nth-of-type(3) td:nth-of-type(2)');
		var announce_year = parseInt(announce_date.split(' ')[2]);
	}
	catch(error) {
		logger.error("get srcHtml failed --- catched");
		console.error(error);
		return ;
	}
	logger.info(announce_year);
	if (!announce_year) {
		console.error("get srcHtml failed --- announce_year === 0");
		process.exit();
	}
	logger.verbose("got srcHtml");
	if (announce_year >= 2003) {
		logger.info("preparing Report");
		var reportInfo = {};
		try {
			reportInfo = await prepareReportInfo(srcHtml);
		}
		catch(error) {
			logger.error("prepare report info failed");
			logger.debug(error.message);
			console.error(error);
			return ;
		}
		reportInfo.isin = equity.isin;
		reportInfo.href = url;
		await Report.create(reportInfo)
		.then(report => {
			logger.info("Report " + url + " is created");
		})
		.catch((error) => {
			console.error(error);
			logger.error("Report create failed");
			logger.debug(error.message);
		});
	}
	else {
		let temps = url.split('/');
		let ref = temps[temps.length - 1];
		await Report.create({
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
		})
		.catch((error) => {
			logger.error("Report create (too old) failed");
			console.error(error);
			logger.debug(error.message);
		});
	}
}

var scanReportListPage = async function(equity, html) {
	try {
		var hrefs = await x(html, ['tr td:nth-of-type(4) a@href'])
	}
	catch(error) {
		logger.error("failed to get hrefs");
		logger.debug(error.message);
		return ;
	}
	for (let i = 0; i < hrefs.length; i++) {
		hrefs[i] = 'http://www.bursamalaysia.com' + hrefs[i];
		await Report.findOne({
			where:{
				href: hrefs[i]
			},
			attributes:['id'],
		})
		.then(async (report) => {
			if (!report) {
				//await sleep(10000);
				logger.info("scanReportPage " + hrefs[i]);
				return scanReportPage(equity, hrefs[i]);
			}
			else {
				logger.verbose("Report " + report.id + " exists");
			}
		})
		.catch((error) => {
			console.error(error);
			logger.warn("failed to get findOne Report");
			logger.debug(error.message);
		});
	}
}

var getFinancialReportFromBursa = async function(equity) {
	var page = 1;
	var host = 'http://ws.bursamalaysia.com/market/listed-companies/company-announcements/announcements_listing_f.html?_=1532260415175&page_category=company&category=FA&sub_category=FA1&company=';
	var url = host + equity.local_identifier;
	var maxPage = 1;
	var isMaxPageValid = false;

	while (page <= maxPage) {
		let response = await axios.get(url + '&page=' + page)
		.catch(error => {
			logger.error("failed to get response on url " + url + '&page=' + page);
		});
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
				await scanReportListPage(equity, response.data.html);
			}
			catch(error) {
				logger.warn("scanReportListPage failed " + equity.local_identifier + " page=" + page);
				logger.debug(error);
			}
		}
		page++;
	}
}

var getSmallMidCapList = function() {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, 'smallmidcap.json'), 'utf8', (err, data) => {
			if (!err) {
				let list = JSON.parse(data);
				resolve(list);
			}
			else {
				logger.warn('failed to readFile ' + __dirname, 'smallmidcap.json');
				reject(err);
			}
		});
	});
}

var updateReport = function() {
	getSmallMidCapList()
	.then(async list => {
		logger.info('Small Mid Cap List length = ' + list.length);
		let i = 144;
		while (i < list.length) {
			let equity = await Equity.findOne({
				where:{
					local_identifier: list[i],
				}
			})
			.catch((error) => {
				logger.warn("failed to findOne with local_identifier = " + list[i]);
				logger.debug(error.message);
			});
			if (equity) {
				logger.info(i+1 + "/" + list.length + " <------------ getting Financial Report for [" + equity.local_identifier + "] ------------> ");
				await getFinancialReportFromBursa(equity)
				logger.info(i+1 + "/" + list.length + " <------------ Finish getting Financial Report for [" + equity.local_identifier + "] ------------> ");
				equity = null;
			}
			i++;
		}
		process.exit();
	})
	.catch((error) => {
		console.error(error);
		logger.on('close', process.exit);
	});
}

updateReport();