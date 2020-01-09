import * as puppeteer from 'puppeteer'
import { handleConsole, configureViewport, prepareUrl } from './utils'
import { initMocha } from './init-mocha'

export type TestError = Error | {};

export interface Options {
	args?: string[];
	executablePath?: string;
	file: string;
	height?: number;
	reporter?: string;
	width?: number;
	timeout?: number;
	visible?: boolean;
}

export interface TestDescription {
	duration: number;
	err: TestError;
	fullTitle: string;
	title: string;
}

export interface ResultStats {
	duration: number;
	end: string;
	failures: number;
	passes: number;
	pending: number;
	start: string;
	tests: number;
}

export interface Result {
	failures: TestDescription[];
	passed: TestDescription[];
	pending: TestDescription[];
	stats: ResultStats;
	tests: TestDescription[];
}

export interface Run {
	coverage: object | undefined;
	result: Result;
}

export async function runner(opts?: Options): Promise<Run> {
	let { file, reporter, width, height, args, executablePath } = opts

	const url = prepareUrl(file)

	const options = {
		ignoreHTTPSErrors: true,
		headless: true,
		executablePath,
		args
	}

	if (!file) {
		throw new Error('Test page path is required.');
	}

	const browser = await puppeteer.launch(options)
	const result = await browser.pages()
		.then(pages => pages.pop())            
		.then(configureViewport.bind(this, width, height))
		.then(async page => {
				page.on('console', handleConsole);
				page.on('dialog', dialog => dialog.dismiss());
				page.on('pageerror', err => console.error(err));

				const result = await page.evaluateOnNewDocument(initMocha, reporter)
						.then(() => page.goto(url))
						 /// @ts-ignore
						.then(() => page.waitForFunction(() => window.__mochaResult__, { timeout: 60000 }))
						/// @ts-ignore
						.then(() => page.evaluate(() => window.__mochaResult__))

				browser.close()
				return result
		})

	return result
}