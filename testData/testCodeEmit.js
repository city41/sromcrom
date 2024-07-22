module.exports = function testCodeEmit(codeEmitData) {
	console.log('testCodeEmit');

	return new Promise((resolve) => {
		console.log('waiting 5 seconds...');
		setTimeout(() => {
			resolve(codeEmitData);
		}, 5000);
	});
};
