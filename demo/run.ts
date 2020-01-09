import * as mockfs from 'mock-fs'
import { build, readFile } from 'aria-build'
import { runner } from '../lib/cli-run';

(async function() { 
	const options = {
		file: './demo/index.html',
		visible: true
	}

	

	try {
		const result = await runner(options)
		result.result.failures.forEach(test => {
			console.log(`${test.fullTitle} (${test.duration}ms)\n${test.err}`);
		})
	} catch(err) {
		console.error(err);
	}
})()