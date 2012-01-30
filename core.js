var fs = require('fs');
var util = require('util');
var path = require('path');

require('./ember-headless');
require('./penumerable');

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

function loadSettings(settingsFile, hasWatchCommandlineArg) {
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

function readSource(sources, after) {
  console.log('Reading source files...');
  sources.pmap(fs.readFile, function(err, data, filename) {
    return {'file': filename,
	    'data': data};
  }, after);
 }


function watchForUpdates(sources, onUpdates) {
  function watchingMessage() { console.log('\nWatching for updates...'); };
  watchingMessage();
  sources.forEach(function(d) {
    fs.watch(d, function(event, filename) {
      console.log();
      util.log('Changed: ' + d);
      onUpdates(watchingMessage);
    });
  });
}



/** EXPORTS **/

exports.version = '0.0.1';

exports.concatenateToFile = concatenateToFile;
exports.hasCommandlineArg = hasCommandlineArg;
exports.loadSettings = loadSettings;
exports.readSource = readSource;
exports.watchForUpdates = watchForUpdates;
