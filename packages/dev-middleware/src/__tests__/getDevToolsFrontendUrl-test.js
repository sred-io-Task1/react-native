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

import getDevToolsFrontendUrl from '../utils/getDevToolsFrontendUrl';

describe('getDevToolsFrontendUrl', () => {
  const webSocketDebuggerUrl =
    'ws://localhost:8081/inspector/debug?device=1a9372c&page=-1';

  describe('given an absolute devServerUrl', () => {
    const devServerUrl = 'http://localhost:8081';

    it('should return a valid url for all experiments off', async () => {
      const experiments = {
        enableNetworkInspector: false,
        enableNewDebugger: false,
        enableOpenDebuggerRedirect: false,
      };
      const actual = getDevToolsFrontendUrl(
        experiments,
        webSocketDebuggerUrl,
        devServerUrl,
      );
      const url = new URL(actual);
      expect(url.searchParams.get('ws')).toBe(
        'localhost:8081/inspector/debug?device=1a9372c&page=-1',
      );
    });

    it('should return a valid url for enableNetworkInspector experiment on', async () => {
      const experiments = {
        enableNetworkInspector: true,
        enableNewDebugger: true,
        enableOpenDebuggerRedirect: false,
      };
      const actual = getDevToolsFrontendUrl(
        experiments,
        webSocketDebuggerUrl,
        devServerUrl,
      );
      const url = new URL(actual);
      expect(url.searchParams.get('unstable_enableNetworkPanel')).toBe('true');
      expect(url.searchParams.get('ws')).toBe(
        'localhost:8081/inspector/debug?device=1a9372c&page=-1',
      );
    });
  });

  describe('given a relative devServerUrl', () => {
    const devServerUrl = '';

    it('should return a valid url for all experiments off', async () => {
      const experiments = {
        enableNetworkInspector: false,
        enableNewDebugger: false,
        enableOpenDebuggerRedirect: false,
      };
      const actual = getDevToolsFrontendUrl(
        experiments,
        webSocketDebuggerUrl,
        devServerUrl,
      );
      const [base, paramsStr] = actual.split('?');
      expect(base).toBe('/debugger-frontend/rn_inspector.html');
      const params = new URLSearchParams(paramsStr);
      expect(params.get('ws')).toBe(
        'localhost:8081/inspector/debug?device=1a9372c&page=-1',
      );
    });

    it('should return a valid url for enableNetworkInspector experiment on', async () => {
      const experiments = {
        enableNetworkInspector: true,
        enableNewDebugger: true,
        enableOpenDebuggerRedirect: false,
      };
      const actual = getDevToolsFrontendUrl(
        experiments,
        webSocketDebuggerUrl,
        devServerUrl,
      );
      const [base, paramsStr] = actual.split('?');
      expect(base).toBe('/debugger-frontend/rn_inspector.html');
      const params = new URLSearchParams(paramsStr);
      expect(params.get('unstable_enableNetworkPanel')).toBe('true');
      expect(params.get('ws')).toBe(
        'localhost:8081/inspector/debug?device=1a9372c&page=-1',
      );
    });
  });
});
