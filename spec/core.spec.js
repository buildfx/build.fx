var fs = require('fs');
var buildfx = require('../core');

describe('core', function() {
  var file1 = 'spec/assets/file1.txt';
  var file2 = 'spec/assets/file2.txt';
  var file3 = 'spec/assets/file3.txt';
  var file1Data;
  var file2Data;
  var file3Data;

  describe('concatenateToFile', function() {
    var outfile = 'spec/assets/concatenated.txt';
    var outfileDoesExist = function() {
      var outfileExists = false;
      try {
        outfileExists = fs.statSync(outfile).isFile();          
      } catch(e) {
        outfileExists = false;
      }
      
      return outfileExists;
    };
    
    beforeEach(function() {
      var outfileStat;

      file1Data = fs.readFileSync(file1).toString();
      file2Data = fs.readFileSync(file2).toString();
      file3Data = fs.readFileSync(file3).toString();
      
      try {
        fs.unlinkSync(outfile);
      } catch(e) {}

      try {
        outfileStat = fs.statSync(outfile);
      } catch(e) {
      } finally {
        expect(outfileStat).toBeFalsy();
      }      
    });

    it('concatenates a list of source files into an output file', function() {
      runs(function() {
        buildfx.readSource([file1, file2, file3], function(sources) {
          buildfx.concatenateToFile(sources, outfile);
        });
      });

      waitsFor(outfileDoesExist, 1000);

      runs(function() {
        var data = fs.readFileSync(outfile).toString();

        expect(data.indexOf(file1Data)).toBeGreaterThan(-1);
        expect(data.indexOf(file2Data)).toBeGreaterThan(-1);
        expect(data.indexOf(file3Data)).toBeGreaterThan(-1);        
      });
    });

    it('can wrap the contents of each source file in a wrapPattern', function() {
      var wrapPattern = 'File: %@ Source:%@';

      runs(function() {
        buildfx.readSource([file1, file2, file3], function(sources) {
          buildfx.concatenateToFile(sources, outfile, wrapPattern);
        });
      });

      waitsFor(outfileDoesExist, 1000);

      runs(function() {
        var data = fs.readFileSync(outfile).toString();
        var file1WrappedContent = wrapPattern.fmt(file1, file1Data);
        var file2WrappedContent = wrapPattern.fmt(file2, file2Data);
        var file3WrappedContent = wrapPattern.fmt(file3, file3Data);

        expect(data.indexOf(file1WrappedContent)).toBeGreaterThan(-1);
        expect(data.indexOf(file2WrappedContent)).toBeGreaterThan(-1);
        expect(data.indexOf(file3WrappedContent)).toBeGreaterThan(-1);

      });      
    });

    it('can apply a transform to the sources', function() {
      var transform = function(text) {
        return text.replace('{count}', '{number}');
      };

      runs(function() {
        buildfx.readSource([file1, file2, file3], function(sources) {
          buildfx.concatenateToFile(sources, outfile, null, transform);
        });
      });

      waitsFor(outfileDoesExist, 1000);

      runs(function() {
        var data = fs.readFileSync(outfile).toString();
        expect(data.indexOf('{number}')).toBeGreaterThan(-1);
        expect(data.indexOf('{count}')).toBe(-1);
      });
      
    });

  });

  describe('ensureDir', function() {
    var dir1 = 'spec/assets/dir1';
    var dir2 = 'spec/assets/dir1/dir2';
    var dir3 = 'spec/assets/dir1/dir2/dir3';
    var dir3Stat;

    beforeEach(function() {
      [dir3, dir2, dir1].forEach(function(dir) {
        try {
          fs.rmdirSync(dir);
        } catch (e) {}        
      });

      try {
        dir3Stat = fs.statSync(dir3);
      } catch(e) {
      } finally {
        expect(dir3Stat).toBeFalsy();
      }
    });

    
    it('ensures a directory exists, creating it (and intermediates) where necessary', function() {
      buildfx.ensureDir(dir3);
      dir3Stat = fs.statSync(dir3);
      expect(dir3Stat.isDirectory).toBeTruthy();
    });
  });

  describe('hasCommandlineArg', function() {
     /* No test */
  });

  describe('loadSettings', function() {
    it('loads settings from a file that contains JSON', function() {
      var keys = ['app_name', 'version', 'language'];
      var settings = buildfx.loadSettings('spec/assets/settings.json');
      var hasValues = keys.every(function(k) {
        return settings[k] && settings[k].length > 0;
      });

      expect(hasValues).toBeTruthy();
    });
  });

  describe('readSource', function() {
    it('returns an array of {file:..., data:...} objects from an array of filenames', function() {
      var filenames = [file1, file2, file3];
      var files;

      runs(function() {
        buildfx.readSource(filenames, function(theFiles) {
          files = theFiles;
        });
      });

      waitsFor(function() {
        return files && files.length > 0;
      }, 1000);

      runs(function() {
        files.forEach(function(f) {
          expect(f.file).toBeTruthy();
          expect(f.data.toString().length).toBeGreaterThan(5);
        });
      });
    });
  });

  describe('watchForUpdates', function() {

    it('invokes a callback when any of the files it watches changes', function() {
      var files = [file1, file2];
      var watchers;
      var didUpdate = false;
      var onUpdate = function(message, file) {
        didUpdate = true;
      };
      
      runs(function() {
        var newData = new String(Math.random());
        watchers = buildfx.watchForUpdates(files, onUpdate);
        fs.writeFile('spec/assets/file2.txt', newData);
      });

      waits(1500);

      runs(function() {
        watchers.forEach(function(w) {
          w.close();
        });
        expect(didUpdate).toBeTruthy();
      });
    });
  });
  
});
