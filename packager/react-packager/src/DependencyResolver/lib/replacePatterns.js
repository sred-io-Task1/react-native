/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

exports.IMPORT_RE = /(\bimport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
exports.EXPORT_RE = /(\bexport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
exports.REQUIRE_RE = /(\brequire\s*?\(\s*?)(['"])([^'"]+)(\2\s*?\))/g;
exports.SYSTEM_IMPORT_RE = /(\bSystem\.import\s*?\(\s*?)(['"])([^'"]+)(\2\s*?\))/g;
