/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule TouchableOpacity
 * @noflow
 */
'use strict';

// Note (avik): add @flow when Flow supports spread properties in propTypes

var Animated = require('Animated');
var NativeMethodsMixin = require('NativeMethodsMixin');
var Platform = require('Platform');
var React = require('React');
var TimerMixin = require('react-timer-mixin');
var Touchable = require('Touchable');
var TouchableWithoutFeedback = require('TouchableWithoutFeedback');

var ensurePositiveDelayProps = require('ensurePositiveDelayProps');
var flattenStyle = require('flattenStyle');

type Event = Object;

var PRESS_RETENTION_OFFSET = {top: 20, left: 20, right: 20, bottom: 30};

/**
 * A wrapper for making views respond properly to touches.
 * On press down, the opacity of the wrapped view is decreased, dimming it.
 * This is done without actually changing the view hierarchy, and in general is
 * easy to add to an app without weird side-effects.
 *
 * Example:
 *
 * ```
 * renderButton: function() {
 *   return (
 *     <TouchableOpacity onPress={this._onPressButton}>
 *       <Image
 *         style={styles.button}
 *         source={require('./myButton.png')}
 *       />
 *     </TouchableOpacity>
 *   );
 * },
 * ```
 */
var TouchableOpacity = React.createClass({
  mixins: [TimerMixin, Touchable.Mixin, NativeMethodsMixin],

  propTypes: {
    ...TouchableWithoutFeedback.propTypes,
    /**
     * Determines what the opacity of the wrapped view should be when touch is
     * active. Defaults to 0.2.
     */
    activeOpacity: React.PropTypes.number,
    focusedOpacity: React.PropTypes.number,
    /**
     * Apple TV parallax effects
     */
    tvParallaxDisable: React.PropTypes.bool,
    tvParallaxShiftDistanceX: React.PropTypes.number,
    tvParallaxShiftDistanceY: React.PropTypes.number,
    tvParallaxTiltAngle: React.PropTypes.number,
    tvParallaxMagnification: React.PropTypes.number,
  },

  getDefaultProps: function() {
    return {
      activeOpacity: 0.2,
      focusedOpacity: 0.7,
    };
  },

  getInitialState: function() {
    return {
      ...this.touchableGetInitialState(),
      anim: new Animated.Value(1),
    };
  },

  componentDidMount: function() {
    ensurePositiveDelayProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    ensurePositiveDelayProps(nextProps);
  },

  /**
   * Animate the touchable to a new opacity.
   */
  setOpacityTo: function(value: number, duration: number = 150) {
    Animated.timing(
      this.state.anim,
      {toValue: value, duration: duration, useNativeDriver: true}
    ).start();
  },

  /**
   * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
   * defined on your component.
   */
  touchableHandleActivePressIn: function(e: Event) {
    this.clearTimeout(this._hideTimeout);
    this._hideTimeout = null;
    if (e.dispatchConfig.registrationName === 'onResponderGrant') {
      this._opacityActive(0);
    } else {
      this._opacityActive(150);
    }
    this.props.onPressIn && this.props.onPressIn(e);
  },

  touchableHandleActivePressOut: function(e: Event) {
    if (!this._hideTimeout) {
      this._opacityInactive();
    }
    this.props.onPressOut && this.props.onPressOut(e);
  },

  touchableHandlePress: function(e: Event) {
    this.clearTimeout(this._hideTimeout);
    this._opacityActive(150);
    this._hideTimeout = this.setTimeout(
      this._opacityInactive,
      this.props.delayPressOut || 100
    );
    this.props.onPress && this.props.onPress(e);
  },

  touchableHandleLongPress: function(e: Event) {
    this.props.onLongPress && this.props.onLongPress(e);
  },

  touchableGetPressRectOffset: function() {
    return this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
  },

  touchableGetHitSlop: function() {
    return this.props.hitSlop;
  },

  touchableGetHighlightDelayMS: function() {
    return this.props.delayPressIn || 0;
  },

  touchableGetLongPressDelayMS: function() {
    return this.props.delayLongPress === 0 ? 0 :
      this.props.delayLongPress || 500;
  },

  touchableGetPressOutDelayMS: function() {
    return this.props.delayPressOut;
  },

  _opacityActive: function(duration: number) {
    this.setOpacityTo(this.props.activeOpacity, duration);
  },

  _opacityInactive: function() {
    this.clearTimeout(this._hideTimeout);
    this._hideTimeout = null;
    var childStyle = flattenStyle(this.props.style) || {};
    this.setOpacityTo(
      childStyle.opacity === undefined ? 1 : childStyle.opacity,
      150
    );
  },

  _opacityFocused: function() {
    this.setOpacityTo(this.props.focusedOpacity);
  },

  render: function() {
    return (
      <Animated.View
        accessible={this.props.accessible !== false}
        accessibilityLabel={this.props.accessibilityLabel}
        accessibilityComponentType={this.props.accessibilityComponentType}
        accessibilityTraits={this.props.accessibilityTraits}
        style={[this.props.style, {opacity: this.state.anim}]}
        testID={this.props.testID}
        onLayout={this.props.onLayout}
        onTVSelect={this.props.onPress}
        onTVFocus={this._opacityFocused}
        onTVBlur={this._opacityInactive}
        tvParallaxDisable={this.props.tvParallaxDisable}
        tvParallaxShiftDistanceX={this.props.tvParallaxShiftDistanceX}
        tvParallaxShiftDistanceY={this.props.tvParallaxShiftDistanceY}
        tvParallaxTiltAngle={this.props.tvParallaxTiltAngle}
        tvParallaxMagnification={this.props.tvParallaxMagnification}
        hitSlop={this.props.hitSlop}
        onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}
        onResponderTerminationRequest={this.touchableHandleResponderTerminationRequest}
        onResponderGrant={this.touchableHandleResponderGrant}
        onResponderMove={this.touchableHandleResponderMove}
        onResponderRelease={this.touchableHandleResponderRelease}
        onResponderTerminate={this.touchableHandleResponderTerminate}>
        {this.props.children}
        {Touchable.renderDebugView({color: 'cyan', hitSlop: this.props.hitSlop})}
      </Animated.View>
    );
  },
});

module.exports = TouchableOpacity;
