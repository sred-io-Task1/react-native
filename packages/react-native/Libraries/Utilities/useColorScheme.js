/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {ColorSchemeName} from './NativeAppearance';

import Appearance from './Appearance';
import {useCallback, useSyncExternalStore} from 'react';

export default function useColorScheme(): ?ColorSchemeName {
  const subscribe = useCallback(callback => {
    const appearanceSubscription = Appearance.addChangeListener(callback);
    return appearanceSubscription.remove;
  }, []);

  return useSyncExternalStore(subscribe, Appearance.getColorScheme);
}
