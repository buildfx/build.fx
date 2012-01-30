Build.fx
========

Build.fx is a nodejs-based framework for making lean build tools.


Functions
=========

- function concatenateToFile(sources, outfile, wrapPattern, transform)

- function ensureDir(dir)

- function hasCommandlineArg(theArg)

- function loadSettings(settingsFile)

- function readSource(sources, after)

- function watchForUpdates(sources, onUpdates)



Specs
=====

Specs are written in [Jasmine](http://pivotal.github.com/jasmine/) and can be run from the project root directory
with the command:

     jasmine-node spec/

     
