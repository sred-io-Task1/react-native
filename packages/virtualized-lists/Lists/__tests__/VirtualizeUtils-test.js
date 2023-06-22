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

import {elementsThatOverlapOffsets, newRangeCount} from '../VirtualizeUtils';

describe('newRangeCount', function () {
  test('handles subset', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 2, last: 3})).toBe(0);
  });
  test('handles forward disjoint set', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 6, last: 9})).toBe(4);
  });
  test('handles reverse disjoint set', function () {
    expect(newRangeCount({first: 6, last: 8}, {first: 1, last: 4})).toBe(4);
  });
  test('handles superset', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 0, last: 5})).toBe(2);
  });
  test('handles end extension', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 1, last: 8})).toBe(4);
  });
  test('handles front extension', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 0, last: 4})).toBe(1);
  });
  test('handles forward intersect', function () {
    expect(newRangeCount({first: 1, last: 4}, {first: 3, last: 6})).toBe(2);
  });
  test('handles reverse intersect', function () {
    expect(newRangeCount({first: 3, last: 6}, {first: 1, last: 4})).toBe(2);
  });
});

describe('elementsThatOverlapOffsets', function () {
  test('handles fixed length', function () {
    const offsets = [0, 250, 350, 450];
    function getCellMetricsApprox(index: number) {
      return {
        length: 100,
        offset: 100 * index,
      };
    }
    expect(
      elementsThatOverlapOffsets(
        offsets,
        fakeProps(100),
        {getCellMetricsApprox},
        1,
      ),
    ).toEqual([0, 2, 3, 4]);
  });
  test('handles variable length', function () {
    const offsets = [150, 250, 900];
    const frames = [
      {offset: 0, length: 50},
      {offset: 50, length: 200},
      {offset: 250, length: 600},
      {offset: 850, length: 100},
      {offset: 950, length: 150},
    ];
    expect(
      elementsThatOverlapOffsets(
        offsets,
        fakeProps(frames.length),
        {getCellMetricsApprox: ii => frames[ii]},
        1,
      ),
    ).toEqual([1, 1, 3]);
  });
  test('handles frame boundaries', function () {
    const offsets = [0, 100, 200, 300];
    function getCellMetricsApprox(index: number) {
      return {
        length: 100,
        offset: 100 * index,
      };
    }
    expect(
      elementsThatOverlapOffsets(
        offsets,
        fakeProps(100),
        {getCellMetricsApprox},
        1,
      ),
    ).toEqual([0, 0, 1, 2]);
  });
  test('handles out of bounds', function () {
    const offsets = [-100, 150, 900];
    const frames = [
      {offset: 0, length: 50},
      {offset: 50, length: 150},
      {offset: 250, length: 100},
    ];
    expect(
      elementsThatOverlapOffsets(
        offsets,
        fakeProps(frames.length),
        {getCellMetricsApprox: ii => frames[ii]},
        1,
      ),
    ).toEqual([undefined, 1]);
  });
});

function fakeProps(length) {
  return {
    data: new Array(length).fill({}),
    getItemCount: () => length,
  };
}
