/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall react_native
 */

jest
  .clearAllMocks()
  .mock('../../BatchedBridge/NativeModules', () => ({
    NativeAnimatedModule: {},
    PlatformConstants: {
      getConstants() {
        return {};
      },
    },
  }))
  .mock('../NativeAnimatedModule')
  .mock('../../EventEmitter/NativeEventEmitter')
  // findNodeHandle is imported from RendererProxy so mock that whole module.
  .setMock('../../ReactNative/RendererProxy', {findNodeHandle: () => 1});

import * as React from 'react';
import TestRenderer from 'react-test-renderer';

const Animated = require('../Animated').default;
const NativeAnimatedHelper = require('../NativeAnimatedHelper').default;

describe('Native Animated', () => {
  const NativeAnimatedModule = require('../NativeAnimatedModule').default;

  beforeEach(() => {
    Object.assign(NativeAnimatedModule, {
      getValue: jest.fn(),
      addAnimatedEventToView: jest.fn(),
      connectAnimatedNodes: jest.fn(),
      connectAnimatedNodeToView: jest.fn(),
      createAnimatedNode: jest.fn(),
      disconnectAnimatedNodeFromView: jest.fn(),
      disconnectAnimatedNodes: jest.fn(),
      dropAnimatedNode: jest.fn(),
      extractAnimatedNodeOffset: jest.fn(),
      flattenAnimatedNodeOffset: jest.fn(),
      removeAnimatedEventFromView: jest.fn(),
      restoreDefaultValues: jest.fn(),
      setAnimatedNodeOffset: jest.fn(),
      setAnimatedNodeValue: jest.fn(),
      startAnimatingNode: jest.fn(),
      startListeningToAnimatedNodeValue: jest.fn(),
      stopAnimation: jest.fn(),
      stopListeningToAnimatedNodeValue: jest.fn(),
    });
  });

  describe('Animated Value', () => {
    test('proxies `setValue` correctly', () => {
      const opacity = new Animated.Value(0);
      const ref = React.createRef(null);

      Animated.timing(opacity, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      TestRenderer.create(<Animated.View ref={ref} style={{opacity}} />);

      expect(ref.current).not.toBeNull();
      jest.spyOn(ref.current, 'setNativeProps');

      opacity.setValue(0.5);

      expect(NativeAnimatedModule.setAnimatedNodeValue).toBeCalledWith(
        expect.any(Number),
        0.5,
      );
      expect(ref.current.setNativeProps).not.toHaveBeenCalled();
    });

    test('should set offset', () => {
      const opacity = new Animated.Value(0);
      opacity.setOffset(10);
      opacity.__makeNative();

      TestRenderer.create(<Animated.View style={{opacity}} />);

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'value', value: 0, offset: 10},
      );
      opacity.setOffset(20);
      expect(NativeAnimatedModule.setAnimatedNodeOffset).toBeCalledWith(
        expect.any(Number),
        20,
      );
    });

    test('should flatten offset', () => {
      const opacity = new Animated.Value(0);
      opacity.__makeNative();

      TestRenderer.create(<Animated.View style={{opacity}} />);

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'value', value: 0, offset: 0},
      );
      opacity.flattenOffset();
      expect(NativeAnimatedModule.flattenAnimatedNodeOffset).toBeCalledWith(
        expect.any(Number),
      );
    });

    test('should save value on unmount', () => {
      NativeAnimatedModule.getValue = jest.fn((tag, saveCallback) => {
        saveCallback(1);
      });
      const opacity = new Animated.Value(0);

      opacity.__makeNative();

      const root = TestRenderer.create(<Animated.View style={{opacity}} />);
      const tag = opacity.__getNativeTag();

      root.unmount();

      expect(NativeAnimatedModule.getValue).toBeCalledWith(
        tag,
        expect.any(Function),
      );
      expect(opacity.__getValue()).toBe(1);
    });

    test('should deduct offset when saving value on unmount', () => {
      NativeAnimatedModule.getValue = jest.fn((tag, saveCallback) => {
        // Assume current raw value of value node is 0.5, the NativeAnimated
        // getValue API returns the sum of raw value and offset, so return 1.
        saveCallback(1);
      });
      const opacity = new Animated.Value(0);
      opacity.setOffset(0.5);
      opacity.__makeNative();

      const root = TestRenderer.create(<Animated.View style={{opacity}} />);
      const tag = opacity.__getNativeTag();

      root.unmount();

      expect(NativeAnimatedModule.getValue).toBeCalledWith(
        tag,
        expect.any(Function),
      );
      expect(opacity.__getValue()).toBe(1);
    });

    test('should extract offset', () => {
      const opacity = new Animated.Value(0);
      opacity.__makeNative();

      TestRenderer.create(<Animated.View style={{opacity}} />);

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'value', value: 0, offset: 0},
      );
      opacity.extractOffset();
      expect(NativeAnimatedModule.extractAnimatedNodeOffset).toBeCalledWith(
        expect.any(Number),
      );
    });
  });

  describe('Animated Listeners', () => {
    test('should get updates', () => {
      const value1 = new Animated.Value(0);
      value1.__makeNative();
      const listener = jest.fn();
      const id = value1.addListener(listener);
      expect(
        NativeAnimatedModule.startListeningToAnimatedNodeValue,
      ).toHaveBeenCalledWith(value1.__getNativeTag());

      NativeAnimatedHelper.nativeEventEmitter.emit('onAnimatedValueUpdate', {
        value: 42,
        tag: value1.__getNativeTag(),
      });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith({value: 42});
      expect(value1.__getValue()).toBe(42);

      NativeAnimatedHelper.nativeEventEmitter.emit('onAnimatedValueUpdate', {
        value: 7,
        tag: value1.__getNativeTag(),
      });
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toBeCalledWith({value: 7});
      expect(value1.__getValue()).toBe(7);

      value1.removeListener(id);
      expect(
        NativeAnimatedModule.stopListeningToAnimatedNodeValue,
      ).toHaveBeenCalledWith(value1.__getNativeTag());

      NativeAnimatedHelper.nativeEventEmitter.emit('onAnimatedValueUpdate', {
        value: 1492,
        tag: value1.__getNativeTag(),
      });
      expect(listener).toHaveBeenCalledTimes(2);
      expect(value1.__getValue()).toBe(7);
    });

    test('should removeAll', () => {
      const value1 = new Animated.Value(0);
      value1.__makeNative();
      const listener = jest.fn();
      [1, 2, 3, 4].forEach(() => value1.addListener(listener));
      expect(
        NativeAnimatedModule.startListeningToAnimatedNodeValue,
      ).toHaveBeenCalledWith(value1.__getNativeTag());

      NativeAnimatedHelper.nativeEventEmitter.emit('onAnimatedValueUpdate', {
        value: 42,
        tag: value1.__getNativeTag(),
      });
      expect(listener).toHaveBeenCalledTimes(4);
      expect(listener).toBeCalledWith({value: 42});

      value1.removeAllListeners();
      expect(
        NativeAnimatedModule.stopListeningToAnimatedNodeValue,
      ).toHaveBeenCalledWith(value1.__getNativeTag());

      NativeAnimatedHelper.nativeEventEmitter.emit('onAnimatedValueUpdate', {
        value: 7,
        tag: value1.__getNativeTag(),
      });
      expect(listener).toHaveBeenCalledTimes(4);
    });
  });

  describe('Animated Events', () => {
    test('should map events', () => {
      const value = new Animated.Value(0);
      value.__makeNative();
      const event = Animated.event([{nativeEvent: {state: {foo: value}}}], {
        useNativeDriver: true,
      });

      const root = TestRenderer.create(<Animated.View onTouchMove={event} />);
      expect(NativeAnimatedModule.addAnimatedEventToView).toBeCalledWith(
        expect.any(Number),
        'onTouchMove',
        {
          nativeEventPath: ['state', 'foo'],
          animatedValueTag: value.__getNativeTag(),
        },
      );

      expect(
        NativeAnimatedModule.removeAnimatedEventFromView,
      ).not.toHaveBeenCalled();
      root.unmount();
      expect(NativeAnimatedModule.removeAnimatedEventFromView).toBeCalledWith(
        expect.any(Number),
        'onTouchMove',
        value.__getNativeTag(),
      );
    });

    test('should map AnimatedValueXY', () => {
      const value = new Animated.ValueXY({x: 0, y: 0});
      value.__makeNative();
      const event = Animated.event([{nativeEvent: {state: value}}], {
        useNativeDriver: true,
      });

      TestRenderer.create(<Animated.View onTouchMove={event} />);
      ['x', 'y'].forEach((key, idx) =>
        expect(
          NativeAnimatedModule.addAnimatedEventToView,
        ).toHaveBeenNthCalledWith(idx + 1, expect.any(Number), 'onTouchMove', {
          nativeEventPath: ['state', key],
          animatedValueTag: value[key].__getNativeTag(),
        }),
      );
    });

    test('should throw on invalid event path', () => {
      const value = new Animated.Value(0);
      value.__makeNative();
      const event = Animated.event([{notNativeEvent: {foo: value}}], {
        useNativeDriver: true,
      });

      jest.spyOn(console, 'error').mockImplementationOnce((...args) => {
        if (args[0].startsWith('The above error occurred in the')) {
          return;
        }
        console.errorDebug(...args);
      });

      expect(() => {
        TestRenderer.create(<Animated.View onTouchMove={event} />);
      }).toThrowError(/nativeEvent/);
      expect(NativeAnimatedModule.addAnimatedEventToView).not.toBeCalled();

      console.error.mockRestore();
    });

    test('should call listeners', () => {
      const value = new Animated.Value(0);
      value.__makeNative();
      const listener = jest.fn();
      const event = Animated.event([{nativeEvent: {foo: value}}], {
        useNativeDriver: true,
        listener,
      });
      const handler = event.__getHandler();
      handler({nativeEvent: {foo: 42}});
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith({nativeEvent: {foo: 42}});
    });
  });

  describe('Animated Graph', () => {
    test('creates and detaches nodes', () => {
      const opacity = new Animated.Value(0);
      const root = TestRenderer.create(<Animated.View style={{opacity}} />);

      Animated.timing(opacity, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      expect(NativeAnimatedModule.createAnimatedNode).toHaveBeenCalledTimes(3);
      expect(NativeAnimatedModule.connectAnimatedNodes).toHaveBeenCalledTimes(
        2,
      );

      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'frames',
          frames: expect.any(Array),
          toValue: expect.any(Number),
          iterations: 1,
        },
        expect.any(Function),
      );

      expect(
        NativeAnimatedModule.disconnectAnimatedNodes,
      ).not.toHaveBeenCalled();
      expect(NativeAnimatedModule.dropAnimatedNode).not.toHaveBeenCalled();

      root.unmount();

      expect(
        NativeAnimatedModule.disconnectAnimatedNodes,
      ).toHaveBeenCalledTimes(2);
      expect(NativeAnimatedModule.dropAnimatedNode).toHaveBeenCalledTimes(3);
    });

    test('sends a valid description for value, style and props nodes', () => {
      const opacity = new Animated.Value(0);
      TestRenderer.create(<Animated.View style={{opacity}} />);

      Animated.timing(opacity, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'value', value: 0, offset: 0},
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'style', style: {opacity: expect.any(Number)}},
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'props', props: {style: expect.any(Number)}},
      );
    });

    test('sends a valid graph description for Animated.add nodes', () => {
      const first = new Animated.Value(1);
      const second = new Animated.Value(2);
      first.__makeNative();
      second.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.add(first, second)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'addition', input: expect.any(Array)},
      );
      const additionCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'addition',
        );
      expect(additionCalls.length).toBe(1);
      const additionCall = additionCalls[0];
      const additionNodeTag = additionCall[0];
      const additionConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === additionNodeTag,
        );
      expect(additionConnectionCalls.length).toBe(2);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        additionCall[1].input[0],
        {
          type: 'value',
          value: 1,
          offset: 0,
        },
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        additionCall[1].input[1],
        {
          type: 'value',
          value: 2,
          offset: 0,
        },
      );
    });

    test('sends a valid graph description for Animated.subtract nodes', () => {
      const first = new Animated.Value(2);
      const second = new Animated.Value(1);
      first.__makeNative();
      second.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.subtract(first, second)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'subtraction', input: expect.any(Array)},
      );
      const subtractionCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'subtraction',
        );
      expect(subtractionCalls.length).toBe(1);
      const subtractionCall = subtractionCalls[0];
      const subtractionNodeTag = subtractionCall[0];
      const subtractionConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === subtractionNodeTag,
        );
      expect(subtractionConnectionCalls.length).toBe(2);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        subtractionCall[1].input[0],
        {
          type: 'value',
          value: 2,
          offset: 0,
        },
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        subtractionCall[1].input[1],
        {
          type: 'value',
          value: 1,
          offset: 0,
        },
      );
    });

    test('sends a valid graph description for Animated.multiply nodes', () => {
      const first = new Animated.Value(2);
      const second = new Animated.Value(1);
      first.__makeNative();
      second.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.multiply(first, second)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'multiplication', input: expect.any(Array)},
      );
      const multiplicationCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'multiplication',
        );
      expect(multiplicationCalls.length).toBe(1);
      const multiplicationCall = multiplicationCalls[0];
      const multiplicationNodeTag = multiplicationCall[0];
      const multiplicationConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === multiplicationNodeTag,
        );
      expect(multiplicationConnectionCalls.length).toBe(2);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        multiplicationCall[1].input[0],
        {
          type: 'value',
          value: 2,
          offset: 0,
        },
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        multiplicationCall[1].input[1],
        {
          type: 'value',
          value: 1,
          offset: 0,
        },
      );
    });

    test('sends a valid graph description for Animated.divide nodes', () => {
      const first = new Animated.Value(4);
      const second = new Animated.Value(2);
      first.__makeNative();
      second.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.divide(first, second)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'division', input: expect.any(Array)},
      );
      const divisionCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'division',
        );
      expect(divisionCalls.length).toBe(1);
      const divisionCall = divisionCalls[0];
      const divisionNodeTag = divisionCall[0];
      const divisionConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === divisionNodeTag,
        );
      expect(divisionConnectionCalls.length).toBe(2);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        divisionCall[1].input[0],
        {
          type: 'value',
          value: 4,
          offset: 0,
        },
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        divisionCall[1].input[1],
        {
          type: 'value',
          value: 2,
          offset: 0,
        },
      );
    });

    test('sends a valid graph description for Animated.modulo nodes', () => {
      const value = new Animated.Value(4);
      value.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.modulo(value, 4)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'modulus', modulus: 4, input: expect.any(Number)},
      );
      const moduloCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'modulus',
        );
      expect(moduloCalls.length).toBe(1);
      const moduloCall = moduloCalls[0];
      const moduloNodeTag = moduloCall[0];
      const moduloConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === moduloNodeTag,
        );
      expect(moduloConnectionCalls.length).toBe(1);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        moduloCall[1].input,
        {
          type: 'value',
          value: 4,
          offset: 0,
        },
      );
    });

    test('sends a valid graph description for interpolate() nodes', () => {
      const value = new Animated.Value(10);
      value.__makeNative();

      TestRenderer.create(
        <Animated.View
          style={{
            opacity: value.interpolate({
              inputRange: [10, 20],
              outputRange: [0, 1],
            }),
          }}
        />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'value', value: 10, offset: 0},
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {
          type: 'interpolation',
          inputRange: [10, 20],
          outputRange: [0, 1],
          outputType: null,
          extrapolateLeft: 'extend',
          extrapolateRight: 'extend',
        },
      );
      const interpolationNodeTag =
        NativeAnimatedModule.createAnimatedNode.mock.calls.find(
          call => call[1].type === 'interpolation',
        )[0];
      const valueNodeTag =
        NativeAnimatedModule.createAnimatedNode.mock.calls.find(
          call => call[1].type === 'value',
        )[0];
      expect(NativeAnimatedModule.connectAnimatedNodes).toBeCalledWith(
        valueNodeTag,
        interpolationNodeTag,
      );
    });

    test('sends a valid graph description for transform nodes', () => {
      const translateX = new Animated.Value(0);
      translateX.__makeNative();

      TestRenderer.create(
        <Animated.View style={{transform: [{translateX}, {scale: 2}]}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {
          type: 'transform',
          transforms: [
            {
              nodeTag: expect.any(Number),
              property: 'translateX',
              type: 'animated',
            },
            {
              value: 2,
              property: 'scale',
              type: 'static',
            },
          ],
        },
      );
    });

    test('sends create operations before connect operations for multiple animated style props', () => {
      const opacity = new Animated.Value(0);
      const borderRadius = new Animated.Value(0);
      TestRenderer.create(<Animated.View style={{borderRadius, opacity}} />);

      Animated.timing(opacity, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const createCalls = NativeAnimatedModule.createAnimatedNode.mock.calls;
      const createCallOrder =
        NativeAnimatedModule.createAnimatedNode.mock.invocationCallOrder;
      const connectCalls = NativeAnimatedModule.connectAnimatedNodes.mock.calls;
      const connectCallOrder =
        NativeAnimatedModule.connectAnimatedNodes.mock.invocationCallOrder;

      // First value node and style node should both be created before they are connected
      const valueNodeCreateCallIndices = createCalls.reduce(
        (acc, call, index) => {
          call[1].type === 'value' && acc.push(index);
          return acc;
        },
        [],
      );
      const value1NodeCreateCall = createCalls[valueNodeCreateCallIndices[0]];
      const value1NodeTag = value1NodeCreateCall[0];
      const value1NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[0]];

      const styleNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'style',
      );
      const styleNodeCreateCall = createCalls[styleNodeCreateCallIndex];
      const styleNodeTag = styleNodeCreateCall[0];
      const styleNodeCreateInvocationOrder =
        createCallOrder[styleNodeCreateCallIndex];

      const value1StyleConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value1NodeTag && call[1] === styleNodeTag,
      );
      const value1StyleConnectInvocationOrder =
        connectCallOrder[value1StyleConnectCallIndex];

      expect(value1NodeCreateInvocationOrder).toBeLessThan(
        value1StyleConnectInvocationOrder,
      );
      expect(styleNodeCreateInvocationOrder).toBeLessThan(
        value1StyleConnectInvocationOrder,
      );

      // Second value node and style node should both be created before they are connected
      const value2NodeCreateCall = createCalls[valueNodeCreateCallIndices[1]];
      const value2NodeTag = value2NodeCreateCall[0];
      const value2NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[1]];

      const value2StyleConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value2NodeTag && call[1] === styleNodeTag,
      );
      const value2StyleConnectInvocationOrder =
        connectCallOrder[value2StyleConnectCallIndex];

      expect(value2NodeCreateInvocationOrder).toBeLessThan(
        value2StyleConnectInvocationOrder,
      );
      expect(styleNodeCreateInvocationOrder).toBeLessThan(
        value2StyleConnectInvocationOrder,
      );

      // Style node and props node should both be created before they are connected
      const propsNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'props',
      );
      const propsNodeCreateCall = createCalls[propsNodeCreateCallIndex];
      const propsNodeTag = propsNodeCreateCall[0];
      const propsNodeCreateInvocationOrder =
        createCallOrder[propsNodeCreateCallIndex];

      const stylePropsConnectCallIndex = connectCalls.findIndex(
        call => call[0] === styleNodeTag && call[1] === propsNodeTag,
      );
      const stylePropsConnectInvocationOrder =
        connectCallOrder[stylePropsConnectCallIndex];

      expect(styleNodeCreateInvocationOrder).toBeLessThan(
        stylePropsConnectInvocationOrder,
      );
      expect(propsNodeCreateInvocationOrder).toBeLessThan(
        stylePropsConnectInvocationOrder,
      );
    });

    test('sends create operations before connect operations for multiple animated transform props', () => {
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      TestRenderer.create(
        <Animated.View
          style={{
            transform: [{translateX: translateX}, {translateY: translateY}],
          }}
        />,
      );

      Animated.timing(translateX, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const createCalls = NativeAnimatedModule.createAnimatedNode.mock.calls;
      const createCallOrder =
        NativeAnimatedModule.createAnimatedNode.mock.invocationCallOrder;
      const connectCalls = NativeAnimatedModule.connectAnimatedNodes.mock.calls;
      const connectCallOrder =
        NativeAnimatedModule.connectAnimatedNodes.mock.invocationCallOrder;

      // First value node and transform node should both be created before they are connected
      const valueNodeCreateCallIndices = createCalls.reduce(
        (acc, call, index) => {
          call[1].type === 'value' && acc.push(index);
          return acc;
        },
        [],
      );
      const value1NodeCreateCall = createCalls[valueNodeCreateCallIndices[0]];
      const value1NodeTag = value1NodeCreateCall[0];
      const value1NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[0]];

      const transformNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'transform',
      );
      const transformNodeCreateCall = createCalls[transformNodeCreateCallIndex];
      const transformNodeTag = transformNodeCreateCall[0];
      const transformNodeCreateInvocationOrder =
        createCallOrder[transformNodeCreateCallIndex];

      const value1TransformConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value1NodeTag && call[1] === transformNodeTag,
      );
      const value1TransformConnectInvocationOrder =
        connectCallOrder[value1TransformConnectCallIndex];

      expect(value1NodeCreateInvocationOrder).toBeLessThan(
        value1TransformConnectInvocationOrder,
      );
      expect(transformNodeCreateInvocationOrder).toBeLessThan(
        value1TransformConnectInvocationOrder,
      );

      // Second value node and transform node should both be created before they are connected
      const value2NodeCreateCall = createCalls[valueNodeCreateCallIndices[1]];
      const value2NodeTag = value2NodeCreateCall[0];
      const value2NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[1]];

      const value2TransformConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value2NodeTag && call[1] === transformNodeTag,
      );
      const value2TransformConnectInvocationOrder =
        connectCallOrder[value2TransformConnectCallIndex];

      expect(value2NodeCreateInvocationOrder).toBeLessThan(
        value2TransformConnectInvocationOrder,
      );
      expect(transformNodeCreateInvocationOrder).toBeLessThan(
        value2TransformConnectInvocationOrder,
      );

      // Transform node and style node should both be created before they are connected
      const styleNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'style',
      );
      const styleNodeCreateCall = createCalls[styleNodeCreateCallIndex];
      const styleNodeTag = styleNodeCreateCall[0];
      const styleNodeCreateInvocationOrder =
        createCallOrder[styleNodeCreateCallIndex];

      const transformStyleConnectCallIndex = connectCalls.findIndex(
        call => call[0] === transformNodeTag && call[1] === styleNodeTag,
      );
      const transformStyleConnectInvocationOrder =
        connectCallOrder[transformStyleConnectCallIndex];

      expect(transformNodeCreateInvocationOrder).toBeLessThan(
        transformStyleConnectInvocationOrder,
      );
      expect(styleNodeCreateInvocationOrder).toBeLessThan(
        transformStyleConnectInvocationOrder,
      );

      // Style node and props node should both be created before they are connected
      const propsNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'props',
      );
      const propsNodeCreateCall = createCalls[propsNodeCreateCallIndex];
      const propsNodeTag = propsNodeCreateCall[0];
      const propsNodeCreateInvocationOrder =
        createCallOrder[propsNodeCreateCallIndex];

      const stylePropsConnectCallIndex = connectCalls.findIndex(
        call => call[0] === styleNodeTag && call[1] === propsNodeTag,
      );
      const stylePropsConnectInvocationOrder =
        connectCallOrder[stylePropsConnectCallIndex];

      expect(styleNodeCreateInvocationOrder).toBeLessThan(
        stylePropsConnectInvocationOrder,
      );
      expect(propsNodeCreateInvocationOrder).toBeLessThan(
        stylePropsConnectInvocationOrder,
      );
    });

    test('sends create operations before connect operations for multiple animated props', () => {
      const propA = new Animated.Value(0);
      const propB = new Animated.Value(0);
      TestRenderer.create(<Animated.View propA={propA} propB={propB} />);

      Animated.timing(propA, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const createCalls = NativeAnimatedModule.createAnimatedNode.mock.calls;
      const createCallOrder =
        NativeAnimatedModule.createAnimatedNode.mock.invocationCallOrder;
      const connectCalls = NativeAnimatedModule.connectAnimatedNodes.mock.calls;
      const connectCallOrder =
        NativeAnimatedModule.connectAnimatedNodes.mock.invocationCallOrder;

      // First value node and props node should both be created before they are connected
      const valueNodeCreateCallIndices = createCalls.reduce(
        (acc, call, index) => {
          call[1].type === 'value' && acc.push(index);
          return acc;
        },
        [],
      );
      const value1NodeCreateCall = createCalls[valueNodeCreateCallIndices[0]];
      const value1NodeTag = value1NodeCreateCall[0];
      const value1NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[0]];

      const propsNodeCreateCallIndex = createCalls.findIndex(
        call => call[1].type === 'props',
      );
      const propsNodeCreateCall = createCalls[propsNodeCreateCallIndex];
      const propsNodeTag = propsNodeCreateCall[0];
      const propsNodeCreateInvocationOrder =
        createCallOrder[propsNodeCreateCallIndex];

      const value1PropsConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value1NodeTag && call[1] === propsNodeTag,
      );
      const value1PropsConnectInvocationOrder =
        connectCallOrder[value1PropsConnectCallIndex];

      expect(value1NodeCreateInvocationOrder).toBeLessThan(
        value1PropsConnectInvocationOrder,
      );
      expect(propsNodeCreateInvocationOrder).toBeLessThan(
        value1PropsConnectInvocationOrder,
      );

      // Second value node and props node should both be created before they are connected
      const value2NodeCreateCall = createCalls[valueNodeCreateCallIndices[1]];
      const value2NodeTag = value2NodeCreateCall[0];
      const value2NodeCreateInvocationOrder =
        createCallOrder[valueNodeCreateCallIndices[1]];

      const value2PropsConnectCallIndex = connectCalls.findIndex(
        call => call[0] === value2NodeTag && call[1] === propsNodeTag,
      );
      const value2PropsConnectInvocationOrder =
        connectCallOrder[value2PropsConnectCallIndex];

      expect(value2NodeCreateInvocationOrder).toBeLessThan(
        value2PropsConnectInvocationOrder,
      );
      expect(propsNodeCreateInvocationOrder).toBeLessThan(
        value2PropsConnectInvocationOrder,
      );
    });

    test('sends a valid graph description for Animated.diffClamp nodes', () => {
      const value = new Animated.Value(2);
      value.__makeNative();

      TestRenderer.create(
        <Animated.View style={{opacity: Animated.diffClamp(value, 0, 20)}} />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'diffclamp', input: expect.any(Number), max: 20, min: 0},
      );
      const diffClampCalls =
        NativeAnimatedModule.createAnimatedNode.mock.calls.filter(
          call => call[1].type === 'diffclamp',
        );
      expect(diffClampCalls.length).toBe(1);
      const diffClampCall = diffClampCalls[0];
      const diffClampNodeTag = diffClampCall[0];
      const diffClampConnectionCalls =
        NativeAnimatedModule.connectAnimatedNodes.mock.calls.filter(
          call => call[1] === diffClampNodeTag,
        );
      expect(diffClampConnectionCalls.length).toBe(1);
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        diffClampCall[1].input,
        {
          type: 'value',
          value: 2,
          offset: 0,
        },
      );
    });

    test("doesn't call into native API if useNativeDriver is set to false", () => {
      const opacity = new Animated.Value(0);

      const root = TestRenderer.create(<Animated.View style={{opacity}} />);

      Animated.timing(opacity, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      root.unmount();

      expect(NativeAnimatedModule.createAnimatedNode).not.toBeCalled();
    });

    test('fails when trying to run non-native animation on native node', () => {
      const opacity = new Animated.Value(0);
      const ref = React.createRef(null);

      TestRenderer.create(<Animated.View ref={ref} style={{opacity}} />);

      // Necessary to simulate the native animation.
      expect(ref.current).not.toBeNull();
      ref.current.setNativeProps = jest.fn();

      Animated.timing(opacity, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }).start();
      jest.runAllTimers();

      expect(
        Animated.timing(opacity, {
          toValue: 4,
          duration: 500,
          useNativeDriver: false,
        }).start,
      ).toThrow(
        'Attempting to run JS driven animation on animated node that has ' +
          'been moved to "native" earlier by starting an animation with ' +
          '`useNativeDriver: true`',
      );
    });

    test('fails for unsupported styles', () => {
      const left = new Animated.Value(0);

      TestRenderer.create(<Animated.View style={{left}} />);

      const animation = Animated.timing(left, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      });
      expect(animation.start).toThrowError(/left/);
    });

    test('works for any `static` props and styles', () => {
      // Passing "unsupported" props should work just fine as long as they are not animated
      const opacity = new Animated.Value(0);
      opacity.__makeNative();

      TestRenderer.create(
        <Animated.View
          removeClippedSubviews={true}
          style={{left: 10, opacity, top: 20}}
        />,
      );

      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'style', style: {opacity: expect.any(Number)}},
      );
      expect(NativeAnimatedModule.createAnimatedNode).toBeCalledWith(
        expect.any(Number),
        {type: 'props', props: {style: expect.any(Number)}},
      );
    });
  });

  describe('Animations', () => {
    test('sends a valid timing animation description', () => {
      const anim = new Animated.Value(0);
      Animated.timing(anim, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'frames',
          frames: expect.any(Array),
          toValue: expect.any(Number),
          iterations: 1,
        },
        expect.any(Function),
      );
    });

    test('sends a valid spring animation description', () => {
      const anim = new Animated.Value(0);
      Animated.spring(anim, {
        toValue: 10,
        friction: 5,
        tension: 164,
        useNativeDriver: true,
      }).start();
      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'spring',
          stiffness: 679.08,
          damping: 16,
          mass: 1,
          initialVelocity: 0,
          overshootClamping: false,
          restDisplacementThreshold: 0.001,
          restSpeedThreshold: 0.001,
          toValue: 10,
          iterations: 1,
        },
        expect.any(Function),
      );

      Animated.spring(anim, {
        toValue: 10,
        stiffness: 1000,
        damping: 500,
        mass: 3,
        useNativeDriver: true,
      }).start();
      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'spring',
          stiffness: 1000,
          damping: 500,
          mass: 3,
          initialVelocity: 0,
          overshootClamping: false,
          restDisplacementThreshold: 0.001,
          restSpeedThreshold: 0.001,
          toValue: 10,
          iterations: 1,
        },
        expect.any(Function),
      );

      Animated.spring(anim, {
        toValue: 10,
        bounciness: 8,
        speed: 10,
        useNativeDriver: true,
      }).start();
      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'spring',
          damping: 23.05223140901191,
          initialVelocity: 0,
          overshootClamping: false,
          restDisplacementThreshold: 0.001,
          restSpeedThreshold: 0.001,
          stiffness: 299.61882352941177,
          mass: 1,
          toValue: 10,
          iterations: 1,
        },
        expect.any(Function),
      );
    });

    test('sends a valid decay animation description', () => {
      const anim = new Animated.Value(0);
      Animated.decay(anim, {
        velocity: 10,
        deceleration: 0.1,
        useNativeDriver: true,
      }).start();

      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {type: 'decay', deceleration: 0.1, velocity: 10, iterations: 1},
        expect.any(Function),
      );
    });

    test('works with Animated.loop', () => {
      const anim = new Animated.Value(0);
      Animated.loop(
        Animated.decay(anim, {
          velocity: 10,
          deceleration: 0.1,
          useNativeDriver: true,
        }),
        {iterations: 10},
      ).start();

      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {type: 'decay', deceleration: 0.1, velocity: 10, iterations: 10},
        expect.any(Function),
      );
    });

    test('sends stopAnimation command to native', () => {
      const value = new Animated.Value(0);
      const animation = Animated.timing(value, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      });

      animation.start();
      expect(NativeAnimatedModule.startAnimatingNode).toBeCalledWith(
        expect.any(Number),
        expect.any(Number),
        {
          type: 'frames',
          frames: expect.any(Array),
          toValue: expect.any(Number),
          iterations: 1,
        },
        expect.any(Function),
      );
      const animationId =
        NativeAnimatedModule.startAnimatingNode.mock.calls[0][0];

      animation.stop();
      expect(NativeAnimatedModule.stopAnimation).toBeCalledWith(animationId);
    });

    test('calls stopAnimation callback with native value', () => {
      NativeAnimatedModule.getValue = jest.fn((tag, saveCallback) => {
        saveCallback(1);
      });

      const anim = new Animated.Value(0);
      Animated.timing(anim, {
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const tag = anim.__getNativeTag();

      let currentValue = 0;
      anim.stopAnimation(value => (currentValue = value));

      expect(NativeAnimatedModule.getValue).toBeCalledWith(
        tag,
        expect.any(Function),
      );

      expect(currentValue).toEqual(1);
    });
  });

  describe('Animated Components', () => {
    test('Should restore default values on prop updates only', () => {
      const opacity = new Animated.Value(0);
      opacity.__makeNative();

      const root = TestRenderer.create(<Animated.View style={{opacity}} />);
      expect(NativeAnimatedModule.restoreDefaultValues).not.toHaveBeenCalled();

      root.update(<Animated.View style={{opacity}} />);
      expect(NativeAnimatedModule.restoreDefaultValues).toHaveBeenCalledWith(
        expect.any(Number),
      );

      root.unmount();
      // Make sure it doesn't get called on unmount.
      expect(NativeAnimatedModule.restoreDefaultValues).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
