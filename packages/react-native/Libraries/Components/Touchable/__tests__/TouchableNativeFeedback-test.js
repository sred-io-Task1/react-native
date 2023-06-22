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

import Text from '../../../Text/Text';
import View from '../../View/View';
import TouchableNativeFeedback from '../TouchableNativeFeedback';
import * as React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const render = require('../../../../jest/renderer');

describe('TouchableWithoutFeedback', () => {
  test('renders correctly', () => {
    const instance = render.create(
      <TouchableNativeFeedback style={{}}>
        <Text>Touchable</Text>
      </TouchableNativeFeedback>,
    );

    expect(instance.toJSON()).toMatchSnapshot();
  });

  test('has displayName', () => {
    expect(TouchableNativeFeedback.displayName).toEqual(
      'TouchableNativeFeedback',
    );
  });
});

describe('<TouchableNativeFeedback />', () => {
  test('should render as expected', () => {
    const instance = ReactTestRenderer.create(
      <TouchableNativeFeedback>
        <View />
      </TouchableNativeFeedback>,
    );

    expect(instance.toJSON()).toMatchSnapshot();
  });
});

describe('<TouchableNativeFeedback disabled={true}>', () => {
  test('should be disabled when disabled is true', () => {
    expect(
      ReactTestRenderer.create(
        <TouchableNativeFeedback disabled={true}>
          <View />
        </TouchableNativeFeedback>,
      ),
    ).toMatchSnapshot();
  });
});

describe('<TouchableNativeFeedback disabled={true} accessibilityState={{}}>', () => {
  test('should be disabled when disabled is true and accessibilityState is empty', () => {
    expect(
      ReactTestRenderer.create(
        <TouchableNativeFeedback disabled={true} accessibilityState={{}}>
          <View />
        </TouchableNativeFeedback>,
      ),
    ).toMatchSnapshot();
  });
});

describe('<TouchableNativeFeedback disabled={true} accessibilityState={{checked: true}}>', () => {
  test('should keep accessibilityState when disabled is true', () => {
    expect(
      ReactTestRenderer.create(
        <TouchableNativeFeedback
          disabled={true}
          accessibilityState={{checked: true}}>
          <View />
        </TouchableNativeFeedback>,
      ),
    ).toMatchSnapshot();
  });
});

describe('<TouchableNativeFeedback disabled={true} accessibilityState={{disabled:false}}>', () => {
  test('should overwrite accessibilityState with value of disabled prop', () => {
    expect(
      ReactTestRenderer.create(
        <TouchableNativeFeedback
          disabled={true}
          accessibilityState={{disabled: false}}>
          <View />
        </TouchableNativeFeedback>,
      ),
    ).toMatchSnapshot();
  });
});

describe('<TouchableNativeFeedback disabled={false} accessibilityState={{disabled:true}}>', () => {
  test('should overwrite accessibilityState with value of disabled prop', () => {
    expect(
      ReactTestRenderer.create(
        <TouchableNativeFeedback
          disabled={false}
          accessibilityState={{disabled: true}}>
          <View />
        </TouchableNativeFeedback>,
      ),
    ).toMatchSnapshot();
  });
});
