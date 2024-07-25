const hook = {
	init(rootDir) {
		console.log('test hook init', rootDir);
		return Promise.resolve();
	},
	overrideInputData(rootDir, input) {
		console.log('test hook overrideInputData', rootDir);
		console.log(input);
		return Promise.resolve(input);
	},
	overrideEmitData(rootDir, emitData) {
		console.log('test hook overrideEmit', rootDir);
		console.log(emitData);
		return Promise.resolve(emitData);
	},
};

module.exports = hook;
