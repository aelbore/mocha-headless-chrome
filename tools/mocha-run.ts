import { clean } from 'aria-build'
import { runner, Options } from '../lib/mocha-chrome'

(async function() {
  try {
		const options: Options = {
			dir: 'demo',
			file: `./dist/index.html`
		}
	
		await clean('dist')	
		await runner(options)
	} catch(err) {
		console.error(err);
	}
})()