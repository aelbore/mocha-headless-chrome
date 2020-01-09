import * as Mocha from 'mocha'

export function initMocha(reporter) {
	console.log = (console => {
			const log = console.log.bind(console);
			return (...args) => args.length ? log(...args) : log('');
	})(console);

	function shimMochaInstance(m) {

		const originalReporter = m.reporter.bind(m);
		let reporterIsChanged = false;

		m.reporter = (...args) => {
				reporterIsChanged = true;
				originalReporter(...args);
		};

		const run = m.run.bind(m);

		m.run = () => {
      const all = [], pending = [], failures = [], passes = [];

      function error(err) {
        if (!err) return {};

        let res = {};
        Object.getOwnPropertyNames(err).forEach(key => res[key] = err[key]);
        return res;
      }

      function clean(test) {
        return {
          title: test.title,
          fullTitle: test.fullTitle(),
          duration: test.duration,
          err: error(test.err)
        }
      }

      function result(stats) {
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
        /// @ts-ignore
        reporter: Mocha.reporters[reporter] || Mocha.reporters.spec 
      });

      const runner = run(() => setTimeout(() => setResult.call(runner), 0))
          .on('pass', test => { passes.push(test); all.push(test); })
          .on('fail', test => { failures.push(test); all.push(test); })
          .on('pending', test => { pending.push(test); all.push(test); })
          .on('end', setResult);

      return runner;
		}
	}

	function shimMochaProcess(M) {
    !M.process && (M.process = {});
    !M.process.stdout && (M.process.stdout = {});

    M.process.stdout.write = data => console.log('stdout:', data);
    M.reporters.Base.useColors = true;
    M.reporters.none = function None(runner) {
      M.reporters.Base.call(this, runner);
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