////////  Ember on NodeJS ////////////
// Usage: require('./ember-headless');

// DOM
if ('undefined' === typeof window) window = global;

var Element = {};
Element.firstChild = function () { return Element; };
Element.innerHTML = function () { return Element; };

var document = { createRange: false, createElement: function() { return Element; } };
window.document = document;


// jQuery
jQuery = function() { return jQuery; };
jQuery.ready = function() { return jQuery; };
jQuery.inArray = function() { return jQuery; };
jQuery.jquery = "1.7.1";
var $ = jQuery;

require('./ember');
