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

const {
  findAndPublishAllBumpedPackages,
} = require('../find-and-publish-all-bumped-packages');

const getPackagesMock = jest.fn();
const execSync = jest.fn();
const execMock = jest.fn();
const fetchMock = jest.fn();

jest.mock('child_process', () => ({execSync}));
jest.mock('shelljs', () => ({exec: execMock}));
jest.mock('../../releases/utils/monorepo', () => ({
  getPackages: getPackagesMock,
}));
// $FlowIgnore[cannot-write]
global.fetch = fetchMock;

const BUMP_COMMIT_MESSAGE =
  'bumped packages versions\n\n#publish-packages-to-npm';

describe('findAndPublishAllBumpedPackages', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.resetAllMocks();
  });

  test('should exit with error if not in a Git repo', async () => {
    execSync.mockImplementation((command: string) => {
      switch (command) {
        case 'git log -1 --pretty=%B':
          throw new Error();
      }
    });
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await findAndPublishAllBumpedPackages();

    expect(consoleError.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Failed to read Git commit message, exiting.",
        ],
      ]
    `);
  });

  test("should exit when commit message does not include '#publish-packages-to-npm'", async () => {
    execSync.mockImplementation((command: string) => {
      switch (command) {
        case 'git log -1 --pretty=%B':
          return 'A non-bumping commit';
      }
    });
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    await findAndPublishAllBumpedPackages();

    expect(consoleLog.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Current commit does not include #publish-packages-to-npm keyword, skipping.",
        ],
      ]
    `);
  });

  test('should throw an error if updated version is not 0.x.x', async () => {
    execSync.mockImplementation((command: string) => {
      switch (command) {
        case 'git log -1 --pretty=%B':
          return BUMP_COMMIT_MESSAGE;
      }
    });
    const mockedPackageNewVersion = '1.0.0';
    getPackagesMock.mockResolvedValue({
      '@react-native/package-a': {
        path: 'absolute/path/to/package-a',
        packageJson: {
          version: mockedPackageNewVersion,
        },
      },
    });

    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({versions: {}}),
    });

    await expect(findAndPublishAllBumpedPackages()).rejects.toThrow(
      `Package version expected to be 0.x.x, but received ${mockedPackageNewVersion}`,
    );
  });

  test('should publish all updated packages', async () => {
    execSync.mockImplementation((command: string) => {
      switch (command) {
        case 'git log -1 --pretty=%B':
          return BUMP_COMMIT_MESSAGE;
      }
    });
    getPackagesMock.mockResolvedValue({
      '@react-native/package-a': {
        name: '@react-native/package-a',
        path: 'absolute/path/to/package-a',
        packageJson: {
          version: '0.72.1',
        },
      },
      '@react-native/package-b': {
        name: '@react-native/package-b',
        path: 'absolute/path/to/package-b',
        packageJson: {
          version: '0.72.1',
        },
      },
      '@react-native/package-c': {
        name: '@react-native/package-c',
        path: 'absolute/path/to/package-c',
        packageJson: {
          version: '0.72.0',
        },
      },
    });
    fetchMock.mockResolvedValue({
      json: () =>
        Promise.resolve({
          versions: {'0.72.0': {}},
        }),
    });
    execMock.mockImplementation(() => ({code: 0}));

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    await findAndPublishAllBumpedPackages();

    expect(consoleLog.mock.calls.flat().join('\n')).toMatchInlineSnapshot(`
      "Discovering updated packages
      - Skipping @react-native/package-c (0.72.0 already present on npm)
      Done ✅
      Publishing updated packages to npm
      - Publishing @react-native/package-a (0.72.1)
      - Publishing @react-native/package-b (0.72.1)
      Done ✅"
    `);
    expect(execMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "npm publish",
          Object {
            "cwd": "absolute/path/to/package-a",
          },
        ],
        Array [
          "npm publish",
          Object {
            "cwd": "absolute/path/to/package-b",
          },
        ],
      ]
    `);
  });
});
