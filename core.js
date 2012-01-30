var fs = require('fs');
var util = require('util');
var path = require('path');

require('./ember-headless');
require('./penumerable');


/**
   @param {Array} sources List of {file:..., data:...} structures
   @param {String} outfile Path to output file
   @param {String} wrapPattern Pattern in which the filename and file data are wrapped
   @param {Function} transform A function that takes one String and returns another. transform is applied to each source                  
 */
function concatenateToFile(sources, outfile, wrapPattern, transform) {
  var stream;
  var outDir = path.dirname(path.resolve(process.cwd(), outfile));

  ensureDir(outDir);
  wrapPattern = wrapPattern || '/** Source: %@ **/\n %@';
  transform = transform ? transform : function(text) { return text; };
  
  console.log('Concatenating to: ', outfile);
  
  stream = fs.createWriteStream(outfile);
  sources.forEach(function(s) {
    var text =  transform(wrapPattern.fmt(s.file, s.data.toString()));
    stream.write(new Buffer(text));
  });

  stream.end();
}


/**
   @param {String} dir Path to directory that must be exist
*/   
function ensureDir(dir) {
  var depth;
  var path;
  var parts = dir.split('/');
  var numberOfParts = parts.length;
  var makeSubpath = function(parts, depth) {
    return parts.slice(0, depth).reduce(function(a, i) {
      return a + '/' + i;
    });
  };
    
  for (depth=2; depth <= numberOfParts; depth++) {
    path = makeSubpath(parts, depth);
    try {
      fs.statSync(path);
    } catch(e) {
      fs.mkdirSync(makeSubpath(parts, depth));
    }
  }
}

function hasCommandlineArg(theArg) {
  theArg = '--' + theArg;
  return process.argv.filter(function(i) { return i === theArg; }).length > 0;
}


/**
   @param {String} settingsFile Name of a JSON-formatted settings file
*/
function loadSettings(settingsFile) {
  var data;
  var settings;
  console.log('Loading settings from: ', settingsFile);

  try {
    fs.statSync(settingsFile);
  } catch (e) {
    console.error('Missing file: ', settingsFile);
    process.exit(1);
  }

  data = fs.readFileSync(settingsFile, 'utf8');
  settings = JSON.parse(data);
  return settings;
}


/**
   @param {Array} sources List of source filenames
   @param {Function} after The function to call after all the source files have been loaded   
*/
function readSource(sources, after) {
  console.log('Reading source files...');
  sources.pmap(fs.readFile, function(err, data, filename) {
    return {'file': filename,
	    'data': data};
  }, after);
 }


/**
   @param {Array} sources List of source filenames
   @param {Function} onUpdates The function to invoke when any of the source files change.
   The function takes two arguments: watchingMessage, and the filename of the file that changed   
*/
function watchForUpdates(sources, onUpdates) {
  var watchers = [];
  function watchingMessage() { console.log('\nWatching for updates...'); };
  watchingMessage();

  watchers = sources.map(function(d) {
    return fs.watch(d, function(event, filename) {
      console.log();
      util.log('Changed: ' + d);
      onUpdates(watchingMessage, d);
    });
  });

  return watchers;
  
  sources.forEach(function(d) {
  });
}



/** EXPORTS **/

exports.version = '0.0.2';

exports.concatenateToFile = concatenateToFile;
exports.ensureDir = ensureDir;
exports.hasCommandlineArg = hasCommandlineArg;
exports.loadSettings = loadSettings;
exports.readSource = readSource;
exports.watchForUpdates = watchForUpdates;
