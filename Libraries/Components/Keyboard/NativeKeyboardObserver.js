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

import type {TurboModule} from 'RCTExport';
import * as TurboModuleRegistry from 'TurboModuleRegistry';
import {Platform} from 'react-native';

export interface Spec extends TurboModule {
  +addListener: (eventName: string) => void;
  +removeListeners: (count: number) => void;
}

export default (Platform.OS === 'ios'
  ? TurboModuleRegistry.getEnforcing<Spec>('KeyboardObserver')
  : null);
