/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {TurboModule} from 'RCTExport';
import * as TurboModuleRegistry from 'TurboModuleRegistry';

import Platform from '../../Utilities/Platform';

/* 'buttonClicked' | 'dismissed' */
type DialogAction = string;
/*
  buttonPositive = -1,
  buttonNegative = -2,
  buttonNeutral = -3
*/
type DialogButtonKey = number;
export type DialogOptions = {|
  title?: string,
  message?: string,
  buttonPositive?: string,
  buttonNegative?: string,
  buttonNeutral?: string,
  items?: Array<string>,
  cancelable?: boolean,
|};

export interface Spec extends TurboModule {
  +getConstants: () => {|
    +buttonClicked: DialogAction,
    +dismissed: DialogAction,
    +buttonPositive: DialogButtonKey,
    +buttonNegative: DialogButtonKey,
    +buttonNeutral: DialogButtonKey,
  |};
  +showAlert: (
    config: DialogOptions,
    onError: (string) => void,
    onAction: (action: DialogAction, buttonKey?: DialogButtonKey) => void,
  ) => void;
}

export default (Platform.OS === 'android'
  ? TurboModuleRegistry.getEnforcing<Spec>('DialogManagerAndroid')
  : undefined);
