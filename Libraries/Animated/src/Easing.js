/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Easing
 * @flow
 */
'use strict';

var _bezier = require('bezier');

/**
 * This class implements common easing functions. The math is pretty obscure,
 * but this cool website has nice visual illustrations of what they represent:
 * http://xaedes.de/dev/transitions/
 */
class Easing {
  static step0(n) {
    return n > 0 ? 1 : 0;
  }

  static step1(n) {
    return n >= 1 ? 1 : 0;
  }

  static linear(t) {
    return t;
  }

  static ease(t: number): number {
    return ease(t);
  }

  static quad(t) {
    return t * t;
  }

  static cubic(t) {
    return t * t * t;
  }

  static poly(n) {
    return (t) => Math.pow(t, n);
  }

  static sin(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  }

  static circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }

  static exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }

  /**
   * A simple elastic interaction, similar to a spring.  Default bounciness
   * is 1, which overshoots a little bit once.  0 bounciness doesn't overshoot
   * at all, and bounciness of N > 1 will overshoot about N times.
   *
   * Wolfram Plots:
   *
   *   http://tiny.cc/elastic_b_1 (default bounciness = 1)
   *   http://tiny.cc/elastic_b_3 (bounciness = 3)
   */
  static elastic(bounciness: number = 1): (t: number) => number {
    var p = bounciness * Math.PI;
    return (t) => 1 - Math.pow(Math.cos(t * Math.PI / 2), 3) * Math.cos(t * p);
  }

  static back(s: number): (t: number) => number {
    if (s === undefined) {
      s = 1.70158;
    }
    return (t) => t * t * ((s + 1) * t - s);
  }

  static bounce(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }

    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }

    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }

    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  }

  static bezier(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): (t: number) => number {
    return _bezier(x1, y1, x2, y2);
  }

  static in(
    easing: (t: number) => number,
  ): (t: number) => number {
    return easing;
  }

  /**
   * Runs an easing function backwards.
   */
  static out(
    easing: (t: number) => number,
  ): (t: number) => number {
    return (t) => 1 - easing(1 - t);
  }

  /**
   * Makes any easing function symmetrical.
   */
  static inOut(
    easing: (t: number) => number,
  ): (t: number) => number {
    return (t) => {
      if (t < 0.5) {
        return easing(t * 2) / 2;
      }
      return 1 - easing((1 - t) * 2) / 2;
    };
  }
}

var ease             = Easing.bezier(0.420, 0, 1, 1);
var easeInQuad       = Easing.bezier(0.550,  0.085, 0.680, 0.530);
var easeInCubic      = Easing.bezier(0.550,  0.055, 0.675, 0.190);
var easeInQuart      = Easing.bezier(0.895,  0.030, 0.685, 0.220);
var easeInQuint      = Easing.bezier(0.755,  0.050, 0.855, 0.060);
var easeInSine       = Easing.bezier(0.470,  0.000, 0.745, 0.715);
var easeInExpo       = Easing.bezier(0.950,  0.050, 0.795, 0.035);
var easeInCirc       = Easing.bezier(0.600,  0.040, 0.980, 0.335);
var easeInBack       = Easing.bezier(0.600, -0.280, 0.735, 0.045);
var easeOutQuad      = Easing.bezier(0.250,  0.460, 0.450, 0.940);
var easeOutCubic     = Easing.bezier(0.215,  0.610, 0.355, 1.000);
var easeOutQuart     = Easing.bezier(0.165,  0.840, 0.440, 1.000);
var easeOutQuint     = Easing.bezier(0.230,  1.000, 0.320, 1.000);
var easeOutSine      = Easing.bezier(0.390,  0.575, 0.565, 1.000);
var easeOutExpo      = Easing.bezier(0.190,  1.000, 0.220, 1.000);
var easeOutCirc      = Easing.bezier(0.075,  0.820, 0.165, 1.000);
var easeOutBack      = Easing.bezier(0.175,  0.885, 0.320, 1.275);
var easeInOutQuad    = Easing.bezier(0.455,  0.030, 0.515, 0.955);
var easeInOutCubic   = Easing.bezier(0.645,  0.045, 0.355, 1.000);
var easeInOutQuart   = Easing.bezier(0.770,  0.000, 0.175, 1.000);
var easeInOutQuint   = Easing.bezier(0.860,  0.000, 0.070, 1.000);
var easeInOutSine    = Easing.bezier(0.445,  0.050, 0.550, 0.950);
var easeInOutExpo    = Easing.bezier(1.000,  0.000, 0.000, 1.000);
var easeInOutCirc    = Easing.bezier(0.785,  0.135, 0.150, 0.860);
var easeInOutBack    = Easing.bezier(0.680, -0.550, 0.265, 1.550);

module.exports = Easing;
