const hook = {
	init() {
		console.log('test hook init');
		return Promise.resolve();
	},
	overrideInputData(input) {
		console.log('test hook overrideInputData');
		console.log(input);
		return Promise.resolve(input);
	},
	overrideEmitData(emitData) {
		console.log('test hook overrideEmit');
		console.log(emitData);
		return Promise.resolve(emitData);
	},
};

module.exports = hook;
