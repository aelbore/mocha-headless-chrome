import { clean } from 'aria-build'
import { runner, Options } from '../lib/mocha-chrome'

(async function() {
  try {
		const options: Options = {
			dir: 'demo',
			outDir: '.tmp'
		}
	
		await clean(options.outDir)	
		await runner(options)
	} catch(err) {
		console.error(err);
	}
})()