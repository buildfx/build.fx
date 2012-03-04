Build.fx
========

Build.fx is a nodejs-based framework for making lean build tools.


Functions
=========

- concatenateToFile(sources, outfile, wrapPattern, transform)

- ensureDir(dir)

- hasCommandlineArg(theArg)

- loadSettings(settingsFile)

- readSource(sources, after)

- watchForUpdates(sources, onUpdates)

- valueForCommandlineArg(theArg)



Specs
=====

Specs are written in [Jasmine](http://pivotal.github.com/jasmine/) and can be run from the project root directory
with the command:

     jasmine-node spec/

     
