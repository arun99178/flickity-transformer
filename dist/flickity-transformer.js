'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var polylinearScale = _interopDefault(require('polylinear-scale'));

/**
 * Module name
 *
 * @type {String}
 */
var name = 'FlickityTransformer';

/**
 * Set default units
 *
 * @type {Object}
 */
var units = {
  perspective: 'px',
  rotate: 'deg',
  rotateX: 'deg',
  rotateY: 'deg',
  rotateZ: 'deg',
  skew: 'deg',
  skewX: 'deg',
  skewY: 'deg',
  translateX: 'px',
  translateY: 'px',
  translateZ: 'px'
};

/**
 * The Flickity instance
 *
 * @type {Object}
 */
var flickity = {};

/**
 * Transforms to apply
 *
 * @type {Array}
 */
var transforms = [];

/**
 * Array of Flickity cell elements
 *
 * @type {Array}
 */
var cellElements = [];

/**
 * Constructor
 *
 * @param {Object} flkty The Flickity instance
 * @param {Array} txs Transforms array
 */
var FlickityTransformer = function FlickityTransformer(flkty, txs) {
  flickity = flkty;
  transforms = txs;
  cellElements = flickity.getCellElements();

  init();
};

/**
 * Initialize
 *
 * @return {null}
 */
function init() {
  createScaleFunctions();

  // Apply initial transforms
  flickity.slides.forEach(applyTransforms);

  // Apply again on scroll
  flickity.on('scroll', function () {
    flickity.slides.forEach(applyTransforms);
  });

  // Require a version of Flickity supporting `scroll` event
  if (flickity._events.scroll === undefined) {
    throw new Error(name + ' requires the first parameter to be a instance of Flickity that supports the `scroll` event (version 2+)');
  }

  // Apply again on resize
  // TODO: debounce this?
  window.addEventListener('resize', function () {
    flickity.slides.forEach(applyTransforms);
  });
}

/**
 * Create scale functions for each transform
 *
 * @return {null}
 */
function createScaleFunctions() {
  transforms.forEach(function (transform) {
    var domain = [];
    var range = [];

    transform.stops.forEach(function (stop) {
      domain.push(stop[0]);
      range.push(stop[1]);
    });

    // Create unique scale function
    transform.scale = function (value) {
      return polylinearScale(domain, range, true)(value);
    };
  });
}

/**
 * Apply transforms to an element
 *
 * @param  {Object} el Flickity element
 * @param  {Integer} i  Element index
 *
 * @return {null}
 */
function applyTransforms(slide, i) {
  var el = cellElements[i];
  var txs = [];
  var xPos = void 0;

  // Get proximity to carousel home
  xPos = slide.parent.x < 0 ? slide.target - Math.abs(slide.parent.x) : slide.target + slide.parent.x;

  // Make transforms
  transforms.forEach(function (transform) {
    txs.push(makeTransform(transform, xPos));
  });

  // Apply transforms
  el.style.transform = txs.join(' ');
}

/**
 * Make an individual transform rule
 *
 * @param  {Object} transform The transform declaration
 * @param  {Number} xPos Element's proximity to carousel home
 * @return {String}
 */
function makeTransform(transform, xPos) {
  var name = transform.name;
  // const unit = units[name] || ''
  var unit = transform.unit || units[name] || '';
  var tx = transform.scale(xPos);

  return name + '(' + tx + unit + ')';
}

module.exports = FlickityTransformer;