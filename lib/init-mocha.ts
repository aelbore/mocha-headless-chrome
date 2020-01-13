
export function initMocha(reporter: any) {
	console.log = (console => {
    const log = console.log.bind(console)
    return (...args: any[]) => args.length ? log(...args) : log('')
	})(console)

	function shimMochaInstance(m: any) {
		const originalReporter = m.reporter.bind(m)
    const run = m.run.bind(m)

    let reporterIsChanged = false;

		m.reporter = (...args: any[]) => {
      reporterIsChanged = true
      return originalReporter(...args)
		}

		m.run = () => {
      const all = [], pending = [], failures = [], passes = []

      function error(err: any) {
        if (!err) return {};

        const res = {}
        Object
          .getOwnPropertyNames(err)
          .forEach(key => res[key] = err[key]);
        
        return res
      }

      function clean(test: any) {
        return {
          title: test.title,
          fullTitle: test.fullTitle(),
          duration: test.duration,
          err: error(test.err)
        }
      }

      function result(stats: any) {
        return {
          result: {
            stats: {
              tests: all.length,
              passes: passes.length,
              pending: pending.length,
              failures: failures.length,
              start: stats.start.toISOString(),
              end: stats.end.toISOString(),
              duration: stats.duration
            },
            tests: all.map(clean),
            pending: pending.map(clean),
            failures: failures.map(clean),
            passes: passes.map(clean)
          },
          /// @ts-ignore
          coverage: window.__coverage__
        }
      }

      function setResult() {
        /// @ts-ignore
        !window.__mochaResult__ && (window.__mochaResult__ = result(this.stats));
      }

      !reporterIsChanged && m.setup({ 
        reporter: Mocha.reporters[reporter] || Mocha.reporters.spec 
      })

      const runner = run(() => setTimeout(() => setResult.call(runner), 0))
          .on('pass', (test: any) => { passes.push(test); all.push(test) })
          .on('fail', (test: any) => { failures.push(test); all.push(test) })
          .on('pending', (test: any) => { pending.push(test); all.push(test) })
          .on('end', setResult)

      return runner;
		}
	}

	function shimMochaProcess(M: any) {
    !M.process && (M.process = {})
    !M.process.stdout && (M.process.stdout = {})

    M.process.stdout.write = (data: any) => console.log('stdout:', data)
    M.reporters.Base.useColors = true
    M.reporters.none = function None(runner: any) {
      M.reporters.Base.call(this, runner)
    }
	}

	Object.defineProperty(window, 'mocha', {
    get: function() { return undefined },
    set: function(m) {
        shimMochaInstance(m);
        /// @ts-ignore
        delete window.mocha;
        /// @ts-ignore
        window.mocha = m
    },
    configurable: true
	})

	Object.defineProperty(window, 'Mocha', {
    get: function() { return undefined },
    set: function(m) {
        shimMochaProcess(m);
        /// @ts-ignore
        delete window.Mocha;
        /// @ts-ignore
        window.Mocha = m;
    },
    configurable: true
	})
}