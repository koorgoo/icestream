MOCHA=node_modules/mocha/bin/mocha
JSHINT=node_modules/jshint/bin/jshint

mocha m:
	$(MOCHA) spec/*.spec.js

jshint j:
	$(JSHINT) lib/*.js spec/*.js demo/*.js

.PHONY: mocha jshint
