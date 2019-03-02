/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
'use strict';

const Animated = require('Animated');
const DeprecatedViewPropTypes = require('DeprecatedViewPropTypes');
const DeprecatedEdgeInsetsPropType = require('DeprecatedEdgeInsetsPropType');
const NativeMethodsMixin = require('NativeMethodsMixin');
const Platform = require('Platform');
const PropTypes = require('prop-types');
const React = require('React');
const Touchable = require('Touchable');
const TouchableWithoutFeedback = require('TouchableWithoutFeedback');

const reactMixin = require('@ericlewis/react-mixin');

import type {EdgeInsetsProp} from 'EdgeInsetsPropType';
import type {ViewStyleProp} from 'StyleSheet';
import type {Props as TouchableWithoutFeedbackProps} from 'TouchableWithoutFeedback';
import type {PressEvent} from 'CoreEventTypes';

type State = {
  animationID: ?number,
  scale: Animated.Value,
};

const PRESS_RETENTION_OFFSET = {top: 20, left: 20, right: 20, bottom: 30};

type Props = $ReadOnly<{|
  ...TouchableWithoutFeedbackProps,

  onPressWithCompletion?: ?(fn: () => void) => void,
  onPressAnimationComplete?: ?() => void,
  pressRetentionOffset?: ?EdgeInsetsProp,
  releaseVelocity?: ?number,
  releaseBounciness?: ?number,
  style?: ?ViewStyleProp,
|}>;

/**
 * Example of using the `TouchableMixin` to play well with other responder
 * locking views including `ScrollView`. `TouchableMixin` provides touchable
 * hooks (`this.touchableHandle*`) that we forward events to. In turn,
 * `TouchableMixin` expects us to implement some abstract methods to handle
 * interesting interactions such as `handleTouchablePress`.
 */

class TouchableBounce extends React.Component<Props, State> {
  static defaultProps = {
    releaseBounciness: 10,
    releaseVelocity: 10,
  };

  constructor(props: Props) {
    super(props);

    Object.keys(Touchable.Mixin.withoutDefaultFocusAndBlur).forEach(name => {
      if ((this: any)[name] && (this: any)[name].bind) {
        (this: any)[name] = (this: any)[name].bind(this);
      }
    });

    this.state = {
      ...this.touchableGetInitialState(),
      scale: new Animated.Value(1),
    };
  }

  bounceTo = (
    value: number,
    velocity: number,
    bounciness: number,
    callback?: ?() => void,
  ) => {
    Animated.spring(this.state.scale, {
      toValue: value,
      velocity,
      bounciness,
      useNativeDriver: true,
    }).start(callback);
  };

  /**
   * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
   * defined on your component.
   */
  touchableHandleActivePressIn = (e: PressEvent) => {
    this.bounceTo(0.93, 0.1, 0);
    this.props.onPressIn && this.props.onPressIn(e);
  };

  touchableHandleActivePressOut = (e: PressEvent) => {
    this.bounceTo(1, 0.4, 0);
    this.props.onPressOut && this.props.onPressOut(e);
  };

  touchableHandleFocus = (e: Event) => {
    if (Platform.isTV) {
      this.bounceTo(0.93, 0.1, 0);
    }
    this.props.onFocus && this.props.onFocus(e);
  };

  touchableHandleBlur = (e: Event) => {
    if (Platform.isTV) {
      this.bounceTo(1, 0.4, 0);
    }
    this.props.onBlur && this.props.onBlur(e);
  };

  touchableHandlePress = (e: PressEvent) => {
    const onPressWithCompletion = this.props.onPressWithCompletion;
    if (onPressWithCompletion) {
      onPressWithCompletion(() => {
        this.state.scale.setValue(0.93);
        this.bounceTo(
          1,
          this.props.releaseVelocity,
          this.props.releaseBounciness,
          this.props.onPressAnimationComplete,
        );
      });
      return;
    }

    this.bounceTo(
      1,
      this.props.releaseVelocity,
      this.props.releaseBounciness,
      this.props.onPressAnimationComplete,
    );
    this.props.onPress && this.props.onPress(e);
  };

  touchableGetPressRectOffset = (): typeof PRESS_RETENTION_OFFSET => {
    return this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
  };

  touchableGetHitSlop = (): ?EdgeInsetsProp => {
    return this.props.hitSlop;
  };

  touchableGetHighlightDelayMS = (): number => {
    return 0;
  };

  render(): React.Element<any> {
    return (
      <Animated.View
        style={[{transform: [{scale: this.state.scale}]}, this.props.style]}
        accessible={this.props.accessible !== false}
        accessibilityLabel={this.props.accessibilityLabel}
        accessibilityHint={this.props.accessibilityHint}
        accessibilityRole={this.props.accessibilityRole}
        accessibilityStates={this.props.accessibilityStates}
        nativeID={this.props.nativeID}
        testID={this.props.testID}
        hitSlop={this.props.hitSlop}
        onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}
        onResponderTerminationRequest={
          this.touchableHandleResponderTerminationRequest
        }
        onResponderGrant={this.touchableHandleResponderGrant}
        onResponderMove={this.touchableHandleResponderMove}
        onResponderRelease={this.touchableHandleResponderRelease}
        onResponderTerminate={this.touchableHandleResponderTerminate}>
        {this.props.children}
        {Touchable.renderDebugView({
          color: 'orange',
          hitSlop: this.props.hitSlop,
        })}
      </Animated.View>
    );
  }
}

TouchableBounce.displayName = 'TouchableBounce';

TouchableBounce.propTypes = {
  /* $FlowFixMe(>=0.89.0 site=react_native_fb) This comment suppresses an
     * error found when Flow v0.89 was deployed. To see the error, delete this
     * comment and run Flow. */
  ...TouchableWithoutFeedback.propTypes,
  // The function passed takes a callback to start the animation which should
  // be run after this onPress handler is done. You can use this (for example)
  // to update UI before starting the animation.
  onPressWithCompletion: PropTypes.func,
  // the function passed is called after the animation is complete
  onPressAnimationComplete: PropTypes.func,
  /**
   * When the scroll view is disabled, this defines how far your touch may
   * move off of the button, before deactivating the button. Once deactivated,
   * try moving it back and you'll see that the button is once again
   * reactivated! Move it back and forth several times while the scroll view
   * is disabled. Ensure you pass in a constant to reduce memory allocations.
   */
  pressRetentionOffset: DeprecatedEdgeInsetsPropType,
  releaseVelocity: PropTypes.number.isRequired,
  releaseBounciness: PropTypes.number.isRequired,
  /**
   * Style to apply to the container/underlay. Most commonly used to make sure
   * rounded corners match the wrapped component.
   */
  style: DeprecatedViewPropTypes.style,
};

reactMixin.onClass(TouchableBounce, NativeMethodsMixin);
reactMixin.onClass(TouchableBounce, Touchable.Mixin.withoutDefaultFocusAndBlur);

module.exports = TouchableBounce;
