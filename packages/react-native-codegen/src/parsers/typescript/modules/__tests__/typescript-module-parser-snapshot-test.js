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

'use strict';

const {TypeScriptParser} = require('../../parser');

const fixtures = require('../__test_fixtures__/fixtures.js');
const failureFixtures = require('../__test_fixtures__/failures.js');

const typeScriptParser = new TypeScriptParser();

jest.mock('fs', () => ({
  readFileSync: filename => {
    // Jest in the OSS does not allow to capture variables in closures.
    // Therefore, we have to bring the variables inside the closure.
    // see: https://github.com/facebook/jest/issues/2567
    const readFileFixtures = require('../__test_fixtures__/fixtures.js');
    const readFileFailureFixtures = require('../__test_fixtures__/failures.js');
    return readFileFixtures[filename] || readFileFailureFixtures[filename];
  },
}));

describe('RN Codegen TypeScript Parser', () => {
  Object.keys(fixtures)
    .sort()
    .forEach(fixtureName => {
      test(`can generate fixture ${fixtureName}`, () => {
        const schema = typeScriptParser.parseModuleFixture(fixtureName);
        const serializedSchema = JSON.stringify(schema, null, 2).replace(
          /"/g,
          "'",
        );

        expect(serializedSchema).toMatchSnapshot();
      });
    });

  Object.keys(failureFixtures)
    .sort()
    .forEach(fixtureName => {
      test(`Fails with error message ${fixtureName}`, () => {
        expect(() => {
          typeScriptParser.parseModuleFixture(fixtureName);
        }).toThrowErrorMatchingSnapshot();
      });
    });
});
