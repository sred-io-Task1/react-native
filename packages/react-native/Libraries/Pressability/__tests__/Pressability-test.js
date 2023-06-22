/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall react_native
 */

import type {PressEvent} from '../../Types/CoreEventTypes';

const UIManager = require('../../ReactNative/UIManager');
const Platform = require('../../Utilities/Platform');
const HoverState = require('../HoverState');
const Pressability = require('../Pressability').default;
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const isWindows = process.platform === 'win32';
const itif = (condition: boolean) => {
  return condition ? it : it.skip;
};

// TODO: Move this util to a shared location.
function getMock<TArguments: $ReadOnlyArray<mixed>, TReturn>(
  fn: (...args: TArguments) => TReturn,
): JestMockFn<TArguments, TReturn> {
  if (!jest.isMockFunction(fn)) {
    throw new Error('Function must be mock function');
  }
  return (fn: $FlowFixMe);
}

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
const createMockPressability = overrides => {
  const config = {
    cancelable: null,
    disabled: null,
    hitSlop: null,
    pressRectOffset: null,
    delayHoverIn: null,
    delayHoverOut: null,
    delayLongPress: null,
    delayPressIn: null,
    delayPressOut: null,
    onBlur: jest.fn(),
    onFocus: jest.fn(),
    onHoverIn: jest.fn(),
    onHoverOut: jest.fn(),
    onLongPress: jest.fn(),
    onPress: jest.fn(),
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
    onLongPressShouldCancelPress_DEPRECATED: jest.fn(),
    onResponderTerminationRequest_DEPRECATED: jest.fn(() => true),
    onStartShouldSetResponder_DEPRECATED: jest.fn(() => true),
    ...overrides,
  };
  const touchable = new Pressability(config);
  const handlers = touchable.getEventHandlers();
  return {
    config,
    handlers,
    touchable,
  };
};

const mockRegion = {
  left: 0,
  top: 0,
  width: 50,
  height: 50,
  pageX: 0,
  pageY: 0,
};

const mockSlop = {
  top: 10,
  left: 10,
  bottom: 10,
  right: 10,
};

const mockUIManagerMeasure = (options?: {|delay: number|}) => {
  getMock(UIManager.measure).mockImplementation((id, fn) => {
    if (options && options.delay) {
      setTimeout(
        () =>
          fn(
            mockRegion.left,
            mockRegion.top,
            mockRegion.width,
            mockRegion.height,
            mockRegion.pageX,
            mockRegion.pageY,
          ),
        options.delay,
      );
    } else {
      fn(
        mockRegion.left,
        mockRegion.top,
        mockRegion.width,
        mockRegion.height,
        mockRegion.pageX,
        mockRegion.pageY,
      );
    }
  });
};

const createMockTargetEvent = (registrationName: string) => {
  const nativeEvent = {
    target: 42,
  };

  return {
    bubbles: null,
    cancelable: null,
    currentTarget: 42,
    defaultPrevented: null,
    dispatchConfig: {
      registrationName,
    },
    eventPhase: null,
    preventDefault: jest.fn(() => undefined),
    isDefaultPrevented: jest.fn(() => false),
    stopPropagation: jest.fn(() => undefined),
    isPropagationStopped: jest.fn(() => false),
    isTrusted: null,
    nativeEvent,
    persist: jest.fn(),
    target: null,
    timeStamp: 1075881600000,
    type: null,
  };
};

const createMockMouseEvent = (registrationName: string) => {
  const nativeEvent = {
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    timestamp: 1075881600000,
  };

  return {
    bubbles: null,
    cancelable: null,
    currentTarget: 42,
    defaultPrevented: null,
    dispatchConfig: {
      registrationName,
    },
    eventPhase: null,
    preventDefault: jest.fn(() => undefined),
    isDefaultPrevented: jest.fn(() => false),
    stopPropagation: jest.fn(() => undefined),
    isPropagationStopped: jest.fn(() => false),
    isTrusted: null,
    nativeEvent,
    persist: jest.fn(),
    target: null,
    timeStamp: 1075881600000,
    type: null,
  };
};

const createMockPressEvent = (
  nameOrOverrides:
    | string
    | $ReadOnly<{|
        registrationName: string,
        pageX: number,
        pageY: number,
      |}>,
): PressEvent => {
  let registrationName = '';
  let pageX = 0;
  let pageY = 0;

  if (typeof nameOrOverrides === 'string') {
    registrationName = nameOrOverrides;
  } else if (typeof nameOrOverrides === 'object' || nameOrOverrides != null) {
    registrationName = nameOrOverrides.registrationName;
    pageX = nameOrOverrides.pageX;
    pageY = nameOrOverrides.pageY;
  }

  const nativeEvent = {
    changedTouches: ([]: Array<PressEvent['nativeEvent']>),
    force: 1,
    identifier: 42,
    locationX: pageX,
    locationY: pageY,
    pageX,
    pageY,
    target: 42,
    timestamp: 1075881600000,
    touches: ([]: Array<PressEvent['nativeEvent']>),
  };

  nativeEvent.changedTouches.push(nativeEvent);
  nativeEvent.touches.push(nativeEvent);

  return {
    bubbles: null,
    cancelable: null,
    currentTarget: 42,
    defaultPrevented: null,
    dispatchConfig: {
      registrationName,
    },
    eventPhase: null,
    preventDefault: jest.fn(() => undefined),
    isDefaultPrevented: jest.fn(() => false),
    stopPropagation: jest.fn(() => undefined),
    isPropagationStopped: jest.fn(() => false),
    isTrusted: null,
    nativeEvent,
    persist: jest.fn(),
    target: null,
    timeStamp: 1075881600000,
    touchHistory: {
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: 1075881600000,
      numberActiveTouches: 1,
      touchBank: [],
    },
    type: null,
  };
};

describe('Pressability', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.spyOn(Date, 'now');
    jest.spyOn(HoverState, 'isHoverEnabled');
  });

  describe('onBlur', () => {
    test('is called if provided in config', () => {
      const {config, handlers} = createMockPressability();
      handlers.onBlur(createMockTargetEvent('onBlur'));
      expect(config.onBlur).toBeCalled();
    });
  });

  describe('onFocus', () => {
    test('is called if provided in config', () => {
      const {config, handlers} = createMockPressability();
      handlers.onFocus(createMockTargetEvent('onFocus'));
      expect(config.onFocus).toBeCalled();
    });
  });

  describe('onHoverIn', () => {
    let originalPlatform;

    beforeEach(() => {
      originalPlatform = Platform.OS;
      Platform.OS = 'web';
      // $FlowExpectedError[prop-missing]
      HoverState.isHoverEnabled.mockReturnValue(true);
    });

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    test('is ignored on unsupported platforms`', () => {
      Platform.OS = 'ios';
      const {handlers} = createMockPressability();
      expect(handlers.onMouseEnter).toBeUndefined();
    });

    test('is called after `onMouseEnter`', () => {
      const {config, handlers} = createMockPressability();
      invariant(
        typeof handlers.onMouseEnter === 'function',
        'Expected to find "onMouseEnter" function',
      );
      // $FlowExpectedError[not-a-function]
      handlers.onMouseEnter(createMockMouseEvent('onMouseEnter'));
      expect(config.onHoverIn).toBeCalled();
    });

    test('is called after no delay by default', () => {
      const {config, handlers} = createMockPressability({
        delayHoverIn: null,
      });
      invariant(
        typeof handlers.onMouseEnter === 'function',
        'Expected to find "onMouseEnter" function',
      );
      // $FlowExpectedError[not-a-function]
      handlers.onMouseEnter(createMockMouseEvent('onMouseEnter'));
      expect(config.onHoverIn).toBeCalled();
    });

    test('falls back to no delay if `delayHoverIn` is omitted', () => {
      const {config, handlers} = createMockPressability({
        delayHoverIn: null,
      });
      invariant(
        typeof handlers.onMouseEnter === 'function',
        'Expected to find "onMouseEnter" function',
      );
      // $FlowExpectedError[not-a-function]
      handlers.onMouseEnter(createMockMouseEvent('onMouseEnter'));
      expect(config.onHoverIn).toBeCalled();
    });

    test('is called after a configured delay', () => {
      const {config, handlers} = createMockPressability({
        delayHoverIn: 500,
      });
      invariant(
        typeof handlers.onMouseEnter === 'function',
        'Expected to find "onMouseEnter" function',
      );
      // $FlowExpectedError[not-a-function]
      handlers.onMouseEnter(createMockMouseEvent('onMouseEnter'));
      jest.advanceTimersByTime(499);
      expect(config.onHoverIn).not.toBeCalled();
      jest.advanceTimersByTime(1);
      expect(config.onHoverIn).toBeCalled();
    });

    test('is called synchronously if delay is 0ms', () => {
      const {config, handlers} = createMockPressability({
        delayHoverIn: 0,
      });
      invariant(
        typeof handlers.onMouseEnter === 'function',
        'Expected to find "onMouseEnter" function',
      );
      // $FlowExpectedError[not-a-function]
      handlers.onMouseEnter(createMockMouseEvent('onMouseEnter'));
      expect(config.onHoverIn).toBeCalled();
    });
  });

  // TODO: onHoverOut tests

  describe('onLongPress', () => {
    test('is called if pressed for 500ms', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      jest.advanceTimersByTime(499);
      expect(config.onLongPress).not.toBeCalled();
      jest.advanceTimersByTime(1);
      expect(config.onLongPress).toBeCalled();
    });

    test('is called if pressed for 500ms after press started', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: 100,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      jest.advanceTimersByTime(499);
      expect(config.onLongPress).not.toBeCalled();
      jest.advanceTimersByTime(1);
      expect(config.onLongPress).toBeCalled();
    });

    test('is not called if released before delay', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      jest.advanceTimersByTime(499);
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));
      jest.advanceTimersByTime(1);

      expect(config.onLongPress).not.toBeCalled();
    });

    test('falls back to a minimum of 10ms before calling `onLongPress`', () => {
      const {config, handlers} = createMockPressability({
        delayLongPress: 0,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      jest.advanceTimersByTime(9);
      expect(config.onLongPress).not.toBeCalled();
      jest.advanceTimersByTime(1);
      expect(config.onLongPress).toBeCalled();
    });

    test('is called if touch moves within 10dp', () => {
      mockUIManagerMeasure();
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(
        createMockPressEvent({
          registrationName: 'onResponderMove',
          pageX: 0,
          pageY: 0,
        }),
      );

      jest.advanceTimersByTime(130);
      handlers.onResponderMove(
        // NOTE: Delta from (0, 0) is ~9.9 < 10.
        createMockPressEvent({
          registrationName: 'onResponderMove',
          pageX: 7,
          pageY: 7,
        }),
      );

      jest.advanceTimersByTime(370);
      expect(config.onLongPress).toBeCalled();
    });

    test('is not called if touch moves beyond 10dp', () => {
      mockUIManagerMeasure();
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(
        createMockPressEvent({
          registrationName: 'onResponderMove',
          pageX: 0,
          pageY: 0,
        }),
      );

      jest.advanceTimersByTime(130);
      handlers.onResponderMove(
        createMockPressEvent({
          registrationName: 'onResponderMove',
          // NOTE: Delta from (0, 0) is ~10.6 > 10.
          pageX: 7,
          pageY: 8,
        }),
      );

      jest.advanceTimersByTime(370);
      expect(config.onLongPress).not.toBeCalled();
    });

    test('is called independent of preceding long touch gesture', () => {
      mockUIManagerMeasure();
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(
        createMockPressEvent({
          registrationName: 'onResponderGrant',
          pageX: 0,
          pageY: 0,
        }),
      );
      handlers.onResponderMove(
        createMockPressEvent({
          registrationName: 'onResponderMove',
          pageX: 0,
          pageY: 0,
        }),
      );

      jest.advanceTimersByTime(500);
      expect(config.onLongPress).toHaveBeenCalledTimes(1);
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      // Subsequent long touch gesture should not carry over previous state.
      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(
        createMockPressEvent({
          registrationName: 'onResponderGrant',
          pageX: 7,
          pageY: 8,
        }),
      );
      handlers.onResponderMove(
        // NOTE: Delta from (0, 0) is ~10.6 > 10, but should not matter.
        createMockPressEvent({
          registrationName: 'onResponderMove',
          pageX: 7,
          pageY: 8,
        }),
      );

      jest.advanceTimersByTime(500);
      expect(config.onLongPress).toHaveBeenCalledTimes(2);
    });
  });

  describe('onPress', () => {
    test('is called even when `measure` does not finish', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

      expect(UIManager.measure).toBeCalled();

      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();

      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      expect(config.onPress).toBeCalled();
      jest.runOnlyPendingTimers();
      expect(config.onPressOut).toBeCalled();
    });
  });

  describe('onPressIn', () => {
    test('is called after `onResponderGrant`', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();
    });

    test('is called immediately by default', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: null,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      expect(config.onPressIn).toBeCalled();
    });

    test('is called after a configured delay', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: 500,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      jest.advanceTimersByTime(499);
      expect(config.onPressIn).not.toBeCalled();
      jest.advanceTimersByTime(1);
      expect(config.onPressIn).toBeCalled();
    });

    test('is called synchronously if delay is 0ms', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: 0,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));

      expect(config.onPressIn).toBeCalled();
    });
  });

  describe('onPressOut', () => {
    test('is called after `onResponderRelease` before `delayPressIn`', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: Number.EPSILON,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      expect(config.onPressIn).not.toBeCalled();
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      expect(config.onPressOut).not.toBeCalled();
      jest.runOnlyPendingTimers();
      expect(config.onPressOut).toBeCalled();
    });

    test('is called after `onResponderRelease` after `delayPressIn`', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: Number.EPSILON,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      expect(config.onPressOut).not.toBeCalled();
      jest.runOnlyPendingTimers();
      expect(config.onPressOut).toBeCalled();
    });

    test('is not called after `onResponderTerminate` before `delayPressIn`', () => {
      const {config, handlers} = createMockPressability({
        delayPressIn: Number.EPSILON,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      handlers.onResponderTerminate(
        createMockPressEvent('onResponderTerminate'),
      );

      expect(config.onPressOut).not.toBeCalled();
      jest.runOnlyPendingTimers();
      expect(config.onPressOut).not.toBeCalled();
    });

    test('is not called after `onResponderTerminate` after `delayPressIn`', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();
      handlers.onResponderTerminate(
        createMockPressEvent('onResponderTerminate'),
      );

      expect(config.onPressOut).not.toBeCalled();
      jest.runOnlyPendingTimers();
      expect(config.onPressOut).toBeCalled();
    });

    // Timers tests are flaky on windows CI, therefore we skip them there.
    itif(!isWindows)(
      'is called after the minimum press duration by default',
      () => {
        const {config, handlers} = createMockPressability();

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
        handlers.onResponderMove(createMockPressEvent('onResponderMove'));
        jest.runOnlyPendingTimers();
        expect(config.onPressIn).toBeCalled();
        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

        jest.advanceTimersByTime(120);
        expect(config.onPressOut).not.toBeCalled();
        jest.advanceTimersByTime(10);
        expect(config.onPressOut).toBeCalled();
      },
    );

    test('is called after only after the remaining minimum press duration', () => {
      const {config, handlers} = createMockPressability();

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();

      // WORKAROUND: Jest does not advance `Date.now()`.
      expect(Date.now).toHaveBeenCalledTimes(1);
      const touchActivateTime = Date.now.mock.results[0].value;
      jest.advanceTimersByTime(120);
      Date.now.mockReturnValue(touchActivateTime + 120);
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      expect(config.onPressOut).not.toBeCalled();
      jest.advanceTimersByTime(10);
      Date.now.mockReturnValue(touchActivateTime + 130);
      expect(config.onPressOut).toBeCalled();

      Date.now.mockRestore();
    });

    test('is called synchronously if minimum press duration is 0ms', () => {
      const {config, handlers} = createMockPressability({
        minPressDuration: 0,
      });

      handlers.onStartShouldSetResponder();
      handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));
      handlers.onResponderMove(createMockPressEvent('onResponderMove'));
      jest.runOnlyPendingTimers();
      expect(config.onPressIn).toBeCalled();
      handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

      expect(config.onPressOut).toBeCalled();
    });
  });

  describe('`onPress*` with movement', () => {
    describe('within bounds of hit rect', () => {
      test('`onPress*` are called when no delay', () => {
        mockUIManagerMeasure();
        const {config, handlers} = createMockPressability({
          hitSlop: mockSlop,
        });

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

        expect(UIManager.measure).toBeCalled();

        /** ┌──────────────────┐
         *  │  ┌────────────┐  │
         *  │  │ VisualRect │  │
         *  │  └────────────┘  │
         *  │     HitRect    X │ <= Move to X and release
         *  └──────────────────┘
         */
        handlers.onResponderMove(
          createMockPressEvent({
            registrationName: 'onResponderMove',
            // $FlowFixMe[unsafe-addition]
            pageX: mockRegion.width + mockSlop.right / 2,
            // $FlowFixMe[unsafe-addition]
            pageY: mockRegion.height + mockSlop.bottom / 2,
          }),
        );
        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

        expect(config.onPressIn).toBeCalled();
        expect(config.onPress).toBeCalled();
        jest.runOnlyPendingTimers();
        expect(config.onPressOut).toBeCalled();
      });

      test('`onPress*` are called after a delay', () => {
        mockUIManagerMeasure();
        const {config, handlers} = createMockPressability({
          hitSlop: mockSlop,
          delayPressIn: 500,
        });

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

        expect(UIManager.measure).toBeCalled();

        /** ┌──────────────────┐
         *  │  ┌────────────┐  │
         *  │  │ VisualRect │  │
         *  │  └────────────┘  │
         *  │     HitRect    X │ <= Move to X and release
         *  └──────────────────┘
         */
        handlers.onResponderMove(
          createMockPressEvent({
            registrationName: 'onResponderMove',
            // $FlowFixMe[unsafe-addition]
            pageX: mockRegion.width + mockSlop.right / 2,
            // $FlowFixMe[unsafe-addition]
            pageY: mockRegion.height + mockSlop.bottom / 2,
          }),
        );
        jest.advanceTimersByTime(499);
        expect(config.onPressIn).not.toBeCalled();

        jest.advanceTimersByTime(1);
        expect(config.onPressIn).toBeCalled();
        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

        expect(config.onPress).toBeCalled();
        jest.runOnlyPendingTimers();
        expect(config.onPressOut).toBeCalled();
      });
    });

    describe('beyond bounds of hit rect', () => {
      test('`onPress` only is not called when no delay', () => {
        mockUIManagerMeasure();
        const {config, handlers} = createMockPressability({
          delayPressIn: 0,
        });

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

        expect(UIManager.measure).toBeCalled();

        handlers.onResponderMove(
          createMockPressEvent({
            registrationName: 'onResponderMove',
            pageX: mockRegion.width * 2,
            pageY: mockRegion.height * 2,
          }),
        );
        jest.runOnlyPendingTimers();
        expect(config.onPressIn).toBeCalled();

        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));
        expect(config.onPress).not.toBeCalled();
        jest.runOnlyPendingTimers();
        expect(config.onPressOut).toBeCalled();
      });

      test('`onPress*` are not called after a delay', () => {
        mockUIManagerMeasure();
        const {config, handlers} = createMockPressability({
          delayPressIn: 500,
        });

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

        expect(UIManager.measure).toBeCalled();

        handlers.onResponderMove(
          createMockPressEvent({
            registrationName: 'onResponderMove',
            pageX: mockRegion.width * 2,
            pageY: mockRegion.height * 2,
          }),
        );
        jest.runOnlyPendingTimers();
        expect(config.onPressIn).not.toBeCalled();

        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

        expect(config.onPress).not.toBeCalled();
        expect(config.onPressOut).not.toBeCalled();
      });

      test('`onPress*` are called when press is released before measure completes', () => {
        mockUIManagerMeasure({delay: 1000});
        const {config, handlers} = createMockPressability({
          delayPressIn: 500,
        });

        handlers.onStartShouldSetResponder();
        handlers.onResponderGrant(createMockPressEvent('onResponderGrant'));

        expect(UIManager.measure).toBeCalled();

        handlers.onResponderMove(
          createMockPressEvent({
            registrationName: 'onResponderMove',
            pageX: mockRegion.width * 2,
            pageY: mockRegion.height * 2,
          }),
        );
        jest.advanceTimersByTime(499);
        expect(config.onPressIn).not.toBeCalled();

        jest.advanceTimersByTime(1);
        expect(config.onPressIn).toBeCalled();

        handlers.onResponderRelease(createMockPressEvent('onResponderRelease'));

        expect(config.onPress).toBeCalled();
        jest.runOnlyPendingTimers();
        expect(config.onPressOut).toBeCalled();
      });
    });
  });

  describe('onStartShouldSetResponder', () => {
    test('if omitted the responder is set by default', () => {
      const {handlers} = createMockPressability({
        onStartShouldSetResponder_DEPRECATED: null,
      });

      expect(handlers.onStartShouldSetResponder()).toBe(true);
    });

    test('if supplied it is called', () => {
      const {config, handlers} = createMockPressability();
      const onStartShouldSetResponder_DEPRECATED = nullthrows(
        config.onStartShouldSetResponder_DEPRECATED,
      );

      // $FlowFixMe[prop-missing]
      onStartShouldSetResponder_DEPRECATED.mockReturnValue(false);
      expect(handlers.onStartShouldSetResponder()).toBe(false);

      // $FlowFixMe[prop-missing]
      onStartShouldSetResponder_DEPRECATED.mockReturnValue(true);
      expect(handlers.onStartShouldSetResponder()).toBe(true);
    });
  });
});
