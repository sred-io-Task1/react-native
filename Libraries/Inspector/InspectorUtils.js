/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule InspectorUtils
 */
'use strict';

var ReactNativeComponentTree = require('ReactNativeComponentTree');

function traverseOwnerTreeUp(hierarchy, instance) {
  if (instance) {
    hierarchy.unshift(instance);
    const owner = typeof instance.tag === 'number' ? instance._debugOwner : instance._currentElement._owner;
    traverseOwnerTreeUp(hierarchy, owner);
  }
}

function findInstanceByNativeTag(nativeTag) {
  // TODO: this is breaking encapsulation
  return ReactNativeComponentTree.getInstanceFromNode(nativeTag);
}

function getOwnerHierarchy(instance) {
  var hierarchy = [];
  traverseOwnerTreeUp(hierarchy, instance);
  return hierarchy;
}

function lastNotNativeInstance(hierarchy) {
  for (let i = hierarchy.length - 1; i > 1; i--) {
    const instance = hierarchy[i];
    if (!instance.viewConfig) {
      return instance;
    }
  }
  return hierarchy[0];
}

module.exports = {findInstanceByNativeTag, getOwnerHierarchy, lastNotNativeInstance};
