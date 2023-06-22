/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall react_native
 */

'use strict';

const StatusBar = require('../StatusBar');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');

describe('StatusBar', () => {
  test('renders the statusbar', () => {
    const component = ReactTestRenderer.create(<StatusBar />);
    expect(component).not.toBeNull();
  });
  test('renders the statusbar animated enabled', () => {
    const component = ReactTestRenderer.create(<StatusBar animated={true} />);
    expect(component.toTree().props.animated).toBe(true);
  });
  test('renders the statusbar with fade transition on hide', () => {
    const component = ReactTestRenderer.create(<StatusBar hidden={true} />);
    expect(component.toTree().props.hidden).toBe(true);
  });
  test('renders the statusbar with a background color', () => {
    const component = ReactTestRenderer.create(
      <StatusBar backgroundColor={'#fff'} />,
    );
    expect(component.toTree().props.backgroundColor).toBe('#fff');
    expect(component.toTree().type._defaultProps.backgroundColor.animated).toBe(
      false,
    );
  });
  test('renders the statusbar with default barStyle', () => {
    const component = ReactTestRenderer.create(<StatusBar />);
    StatusBar.setBarStyle('default');
    expect(component.toTree().type._defaultProps.barStyle.value).toBe(
      'default',
    );
    expect(component.toTree().type._defaultProps.barStyle.animated).toBe(false);
  });
  test('renders the statusbar but should not be visible', () => {
    const component = ReactTestRenderer.create(<StatusBar hidden={true} />);
    expect(component.toTree().props.hidden).toBe(true);
    expect(component.toTree().type._defaultProps.hidden.animated).toBe(false);
    expect(component.toTree().type._defaultProps.hidden.transition).toBe(
      'fade',
    );
  });
  test('renders the statusbar with networkActivityIndicatorVisible true', () => {
    const component = ReactTestRenderer.create(
      <StatusBar networkActivityIndicatorVisible={true} />,
    );
    expect(component.toTree().props.networkActivityIndicatorVisible).toBe(true);
  });
});
