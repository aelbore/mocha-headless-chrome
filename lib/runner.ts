import * as path from 'path'
import * as fs from 'fs'
import * as puppeteer from 'puppeteer'

import { OutputChunk } from 'rollup'
import { globFiles, readFile, writeFile, mkdirp, rollup, createTSRollupConfig, TSRollupConfig } from 'aria-build'
import { handleConsole, configureViewport, prepareUrl } from './utils'
import { initMocha } from './init-mocha'
import { Options, Run } from './common'

interface TranspileOptions {
	dir?: string;
	outDir?: string;
}

async function rollupGenerate({ inputOptions, outputOptions }) {
	const bundle = await rollup(inputOptions)
	const { output } = await bundle.generate(outputOptions)
	return output
}

async function buildOutput(options: TSRollupConfig) {
	return rollupGenerate(createTSRollupConfig(options))
}

async function createHtmlMarkup(codes?: string[]) {
	const [ mocha, chai ] = await Promise.all([
		readFile('./node_modules/mocha/mocha.js', 'utf-8'),
		readFile('./node_modules/chai/chai.js', 'utf-8')
	]) 
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
	<script>${mocha}</script>
	<script>${chai}</script>
	<script>mocha.setup('bdd');</script>	
	<script>
		${codes.map(code => code).join('\n')}
	</script>
	<script>mocha.run();</script>
</body>
</html>	
	`
}

async function transpile(opts?: TranspileOptions) {
	const dir = opts?.dir ?? 'src'
	const outDir = opts?.outDir ?? 'dist'

	const specFiles = await globFiles(`./${dir}/**/*.spec.ts`)
	const inputs = specFiles.map(specFile => specFile.replace(path.resolve(), '.'))

	const outputs = await buildOutput({
		input: inputs,
		external: [ 'chai' ],
		output: {
			format: 'iife',
			globals: {
				'chai': 'chai'
			}
		}
	})

	const codes = outputs.map(output => {
		const { code } = output as OutputChunk
		return code
	})

	mkdirp(outDir)

	const contents = await createHtmlMarkup(codes)
	await writeFile(`./${outDir}/index.html`, contents) 
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