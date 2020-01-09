import * as util from 'util'
import * as path from 'path'
import * as puppeteer from 'puppeteer'

export function configureViewport(width: number, height: number, page: puppeteer.Page) {
	if (!width && !height) return page;

	const viewport = page.viewport();
	width && (viewport.width = width);
	height && (viewport.height = height);

	return page.setViewport(viewport).then(() => page);
}

export async function handleConsole(msg: any) {
	const args: any = msg._args;

	await Promise.all(args.map(a => a.jsonValue()))
		.then((args: any) => {
			
			const isStdout = args[0] === 'stdout:'
			isStdout && (args = args.slice(1))
      
      /// @ts-ignore
			msg = util.format(...args)
			!isStdout && (msg += '\n')
			process.stdout.write(msg)
		});
}

export function prepareUrl(filePath) {
	if (/^[a-zA-Z]+:\/\//.test(filePath)) {
		return filePath
	}
	const resolvedPath = path.resolve(filePath)
	return `file://${resolvedPath}`
}