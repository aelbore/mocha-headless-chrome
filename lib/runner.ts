import * as path from 'path'
import * as fs from 'fs'
import * as puppeteer from 'puppeteer'

import { globFiles, build, writeFile, mkdirp } from 'aria-build'
import { handleConsole, configureViewport, prepareUrl } from './utils'
import { initMocha } from './init-mocha'
import { Options, Run } from './common'

interface TranspileOptions {
	dir?: string;
	outDir?: string;
}

function createHtmlMarkup(outFiles: string[]) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Page Title</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
	<div id="mocha"></div>
	<script src="../node_modules/mocha/mocha.js"></script>
	<script src="../node_modules/mocha-teamcity-reporter/lib/teamcityBrowser.js"></script>
	<script src="../node_modules/chai/chai.js"></script>
	<script>mocha.setup('bdd');</script>	
	${ outFiles.map(outFile => `<script src='${outFile}'></script>`) }
	<script>mocha.run();</script>
</body>
</html>	
	`
}

async function transpile(opts?: TranspileOptions) {
	const dir = opts?.dir ?? 'src'
	const outDir = opts?.outDir ?? 'dist'

	const specFiles = await globFiles(`./${dir}/**/*.spec.ts`)
	const outFiles = specFiles.map(specFile => {
		const file = specFile
			.replace(path.resolve(), '.')
			.replace('.spec.ts', '.spec.js')
			.replace(`${path.sep}${dir}`, '')
		return file.replace(/\\/g, '/')			
	})

	const html = createHtmlMarkup(outFiles)
	const options = await Promise.all(specFiles.map(specFile => {
		const input = specFile.replace(path.resolve(), '.')
		return {
			input,
			external: [ 'chai' ],
			output: {
				format: 'iife',
				globals: {
					'chai': 'chai'
				},
				file: input.replace(dir, outDir).replace('.ts', '.js')
			}
		}
	}))

	mkdirp(outDir)
	await Promise.all([ build(options), writeFile(`./${outDir}/index.html`, html) ])
}

export async function runner(opts?: Options): Promise<Run> {
	const { width, height, reporter, dir, outDir } = opts

	await transpile({ dir, outDir })
	
	const file = opts?.file ? opts.file: `./${outDir}/index.html`

	if (!fs.existsSync(file)) {
		throw new Error('Test page path is required.');
	}

	const url = prepareUrl(file)

	const browser = await puppeteer.launch({ headless: true })
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