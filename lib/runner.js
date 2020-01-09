
const puppeteer = require('puppeteer');
const { handleConsole, configureViewport, prepareUrl } = require('./utils')
const { initMocha } = require('./init-mocha')

exports.runner = function ({ file, reporter, timeout, width, height, args, executablePath, visible }) {
	return new Promise(resolve => {
		if (!file) {
			throw new Error('Test page path is required.');
		}

		args = [].concat(args || []).map(arg => '--' + arg);
		!timeout && (timeout = 60000);

		const url = prepareUrl(file);

		const options = {
				ignoreHTTPSErrors: true,
				headless: true,
				executablePath,
				args
		};

		const result = puppeteer
				.launch(options)
				.then(browser => browser.pages()
						.then(pages => pages.pop())            
						.then(configureViewport.bind(this, width, height))
						.then(page => {
								page.on('console', handleConsole);
								page.on('dialog', dialog => dialog.dismiss());
								page.on('pageerror', err => console.error(err));

								return page.evaluateOnNewDocument(initMocha, reporter)
										.then(() => page.goto(url))
										.then(() => page.waitForFunction(() => window.__mochaResult__, { timeout: timeout }))
										.then(() => page.evaluate(() => window.__mochaResult__))
										.then(obj => {
												browser.close();
												return obj;
										});
						}));

		resolve(result);
	});
};