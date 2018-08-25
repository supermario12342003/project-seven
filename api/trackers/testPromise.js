//testPromise.js

function fct() {
	return new Promise((resolve, reject) => {
		console.log("new promise");
		resolve(1);
	})
}


fct()
.then(number => {
	console.log("then " + number);
	return (number + 1);
})
.then(number => {
	console.log("then " + number);
	return (number + 1);
})
.then(number => {
	console.log("then " + number);
	throw number + "'s error";
	return (number + 1);
})
.catch(error => {
	console.log("catch " + error);
	throw error + " again";
})
.catch(error => {
	console.log("catch " + error);
	return "after catch's then";
})
.then(number => {
	console.log(number);
})