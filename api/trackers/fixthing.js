const x = require('x-ray')();
const axios = require('axios');
const makeDriver = require('request-x-ray');
const url = "http://disclosure.bursamalaysia.com/FileAccess/viewHtml?e=566664";

var options = {
	headers: {
		Cookie: "TS0110e099=01c0211da8dd95ca33dea8c5f986683e83949b71932fa9a0e98098f756d3d891fff2b4c9d8;",
	}
};

axios.get(url, options)
.then(async response => {
	let key = response.request.res.headers["set-cookie"];
	console.log(response.request.res.headers);
	options = {headers: {Cookie: key}};
	var html = await x(response.data, "body@html");
	console.log(html);
	return html.trim();
})
.then(html => {
	axios.get(url, options)
	.then(async response => {
		let key = response.request.res.headers["set-cookie"];
		console.log(response.request.res.headers);
		options = {headers: {Cookie: key}};
		var html = await x(response.data, "body@html");
		console.log(html);
		return html.trim();
	});
})