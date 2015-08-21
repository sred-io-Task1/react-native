/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

jest.dontMock('../')
  .dontMock('q')
  .dontMock('../replacePatterns')
  .setMock('chalk', { dim: function(s) { return s; } });

jest.mock('path');

var Promise = require('promise');

describe('HasteDependencyResolver', function() {
  var HasteDependencyResolver;

  function createModule(o) {
    o.getPlainObject = () => Promise.resolve(o);
    return o;
  }

  beforeEach(function() {
    // For the polyfillDeps
    require('path').join.mockImpl(function(a, b) {
      return b;
    });
    HasteDependencyResolver = require('../');
  });

  describe('getDependencies', function() {
    pit('should get dependencies with polyfills', function() {
      var module = createModule({
        id: 'index',
        path: '/root/index.js', dependencies: ['a']
      });
      var deps = [module];

      var depResolver = new HasteDependencyResolver({
        projectRoot: '/root',
      });

      // Is there a better way? How can I mock the prototype instead?
      var depGraph = depResolver._depGraph;
      depGraph.getOrderedDependencies.mockImpl(function() {
        return Promise.resolve(deps);
      });
      depGraph.load.mockImpl(function() {
        return Promise.resolve();
      });

      return depResolver.getDependencies('/root/index.js', { dev: false })
        .then(function(result) {
          expect(result.mainModuleId).toEqual('index');
          expect(result.dependencies).toEqual([
            { path: 'polyfills/prelude.js',
              id: 'polyfills/prelude.js',
              isPolyfill: true,
              dependencies: []
            },
            { path: 'polyfills/require.js',
              id: 'polyfills/require.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude.js']
            },
            { path: 'polyfills/polyfills.js',
              id: 'polyfills/polyfills.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude.js', 'polyfills/require.js']
            },
            { id: 'polyfills/console.js',
              isPolyfill: true,
              path: 'polyfills/console.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js'
              ],
            },
            { id: 'polyfills/error-guard.js',
              isPolyfill: true,
              path: 'polyfills/error-guard.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js'
              ],
            },
            { id: 'polyfills/String.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/String.prototype.es6.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js'
              ],
            },
            { id: 'polyfills/Array.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/Array.prototype.es6.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js',
                'polyfills/String.prototype.es6.js',
              ],
            },
            module
          ]);
        });
    });

    pit('should get dependencies with polyfills', function() {
      var module = createModule({
        id: 'index',
        path: '/root/index.js',
        dependencies: ['a'],
      });

      var deps = [module];

      var depResolver = new HasteDependencyResolver({
        projectRoot: '/root',
      });

      // Is there a better way? How can I mock the prototype instead?
      var depGraph = depResolver._depGraph;
      depGraph.getOrderedDependencies.mockImpl(function() {
        return Promise.resolve(deps);
      });
      depGraph.load.mockImpl(function() {
        return Promise.resolve();
      });

      return depResolver.getDependencies('/root/index.js', { dev: true })
        .then(function(result) {
          expect(result.mainModuleId).toEqual('index');
          expect(result.dependencies).toEqual([
            { path: 'polyfills/prelude_dev.js',
              id: 'polyfills/prelude_dev.js',
              isPolyfill: true,
              dependencies: []
            },
            { path: 'polyfills/require.js',
              id: 'polyfills/require.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude_dev.js']
            },
            { path: 'polyfills/polyfills.js',
              id: 'polyfills/polyfills.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude_dev.js', 'polyfills/require.js']
            },
            { id: 'polyfills/console.js',
              isPolyfill: true,
              path: 'polyfills/console.js',
              dependencies: [
                'polyfills/prelude_dev.js',
                'polyfills/require.js',
                'polyfills/polyfills.js'
              ],
            },
            { id: 'polyfills/error-guard.js',
              isPolyfill: true,
              path: 'polyfills/error-guard.js',
              dependencies: [
                'polyfills/prelude_dev.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js'
              ],
            },
            { id: 'polyfills/String.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/String.prototype.es6.js',
              dependencies: [
                'polyfills/prelude_dev.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js'
              ],
            },
            { id: 'polyfills/Array.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/Array.prototype.es6.js',
              dependencies: [
                'polyfills/prelude_dev.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js',
                'polyfills/String.prototype.es6.js'
              ],
            },
            module
          ]);
        });
    });

    pit('should pass in more polyfills', function() {
      var module = createModule({
        id: 'index',
        path: '/root/index.js',
        dependencies: ['a']
      });
      var deps = [module];

      var depResolver = new HasteDependencyResolver({
        projectRoot: '/root',
        polyfillModuleNames: ['some module'],
      });

      // Is there a better way? How can I mock the prototype instead?
      var depGraph = depResolver._depGraph;
      depGraph.getOrderedDependencies.mockImpl(function() {
        return Promise.resolve(deps);
      });
      depGraph.load.mockImpl(function() {
        return Promise.resolve();
      });

      return depResolver.getDependencies('/root/index.js', { dev: false })
        .then(function(result) {
          expect(result.mainModuleId).toEqual('index');
          expect(result.dependencies).toEqual([
            { path: 'polyfills/prelude.js',
              id: 'polyfills/prelude.js',
              isPolyfill: true,
              dependencies: []
            },
            { path: 'polyfills/require.js',
              id: 'polyfills/require.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude.js']
            },
            { path: 'polyfills/polyfills.js',
              id: 'polyfills/polyfills.js',
              isPolyfill: true,
              dependencies: ['polyfills/prelude.js', 'polyfills/require.js']
            },
            { id: 'polyfills/console.js',
              isPolyfill: true,
              path: 'polyfills/console.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js'
              ],
            },
            { id: 'polyfills/error-guard.js',
              isPolyfill: true,
              path: 'polyfills/error-guard.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js'
              ],
            },
            { id: 'polyfills/String.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/String.prototype.es6.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js'
              ],
            },
            { id: 'polyfills/Array.prototype.es6.js',
              isPolyfill: true,
              path: 'polyfills/Array.prototype.es6.js',
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js',
                'polyfills/String.prototype.es6.js',
              ],
            },
            { path: 'some module',
              id: 'some module',
              isPolyfill: true,
              dependencies: [
                'polyfills/prelude.js',
                'polyfills/require.js',
                'polyfills/polyfills.js',
                'polyfills/console.js',
                'polyfills/error-guard.js',
                'polyfills/String.prototype.es6.js',
                'polyfills/Array.prototype.es6.js'
              ]
            },
            module
          ]);
        });
    });
  });

  describe('wrapModule', function() {
    pit('should resolve modules', function() {
      var depResolver = new HasteDependencyResolver({
        projectRoot: '/root',
      });

      var depGraph = depResolver._depGraph;
      var dependencies = ['x', 'y', 'z', 'a', 'b'];

      /*eslint-disable */
      var code = [
        // single line import
        "import'x';",
        "import 'x';",
        "import 'x' ;",
        "import Default from 'x';",
        "import * as All from 'x';",
        "import {} from 'x';",
        "import { } from 'x';",
        "import {Foo} from 'x';",
        "import { Foo } from 'x';",
        "import { Foo, } from 'x';",
        "import {Foo as Bar} from 'x';",
        "import { Foo as Bar } from 'x';",
        "import { Foo as Bar, } from 'x';",
        "import { Foo, Bar } from 'x';",
        "import { Foo, Bar, } from 'x';",
        "import { Foo as Bar, Baz } from 'x';",
        "import { Foo as Bar, Baz, } from 'x';",
        "import { Foo, Bar as Baz } from 'x';",
        "import { Foo, Bar as Baz, } from 'x';",
        "import { Foo as Bar, Baz as Qux } from 'x';",
        "import { Foo as Bar, Baz as Qux, } from 'x';",
        "import { Foo, Bar, Baz } from 'x';",
        "import { Foo, Bar, Baz, } from 'x';",
        "import { Foo as Bar, Baz, Qux } from 'x';",
        "import { Foo as Bar, Baz, Qux, } from 'x';",
        "import { Foo, Bar as Baz, Qux } from 'x';",
        "import { Foo, Bar as Baz, Qux, } from 'x';",
        "import { Foo, Bar, Baz as Qux } from 'x';",
        "import { Foo, Bar, Baz as Qux, } from 'x';",
        "import { Foo as Bar, Baz as Qux, Norf } from 'x';",
        "import { Foo as Bar, Baz as Qux, Norf, } from 'x';",
        "import { Foo as Bar, Baz, Qux as Norf } from 'x';",
        "import { Foo as Bar, Baz, Qux as Norf, } from 'x';",
        "import { Foo, Bar as Baz, Qux as Norf } from 'x';",
        "import { Foo, Bar as Baz, Qux as Norf, } from 'x';",
        "import { Foo as Bar, Baz as Qux, Norf as Enuf } from 'x';",
        "import { Foo as Bar, Baz as Qux, Norf as Enuf, } from 'x';",
        "import Default, * as All from 'x';",
        "import Default, { } from 'x';",
        "import Default, { Foo } from 'x';",
        "import Default, { Foo, } from 'x';",
        "import Default, { Foo as Bar } from 'x';",
        "import Default, { Foo as Bar, } from 'x';",
        "import Default, { Foo, Bar } from 'x';",
        "import Default, { Foo, Bar, } from 'x';",
        "import Default, { Foo as Bar, Baz } from 'x';",
        "import Default, { Foo as Bar, Baz, } from 'x';",
        "import Default, { Foo, Bar as Baz } from 'x';",
        "import Default, { Foo, Bar as Baz, } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux, } from 'x';",
        "import Default, { Foo, Bar, Baz } from 'x';",
        "import Default, { Foo, Bar, Baz, } from 'x';",
        "import Default, { Foo as Bar, Baz, Qux } from 'x';",
        "import Default, { Foo as Bar, Baz, Qux, } from 'x';",
        "import Default, { Foo, Bar as Baz, Qux } from 'x';",
        "import Default, { Foo, Bar as Baz, Qux, } from 'x';",
        "import Default, { Foo, Bar, Baz as Qux } from 'x';",
        "import Default, { Foo, Bar, Baz as Qux, } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux, Norf } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux, Norf, } from 'x';",
        "import Default, { Foo as Bar, Baz, Qux as Norf } from 'x';",
        "import Default, { Foo as Bar, Baz, Qux as Norf, } from 'x';",
        "import Default, { Foo, Bar as Baz, Qux as Norf } from 'x';",
        "import Default, { Foo, Bar as Baz, Qux as Norf, } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux, Norf as NoMore } from 'x';",
        "import Default, { Foo as Bar, Baz as Qux, Norf as NoMore, } from 'x';",
        "import Default , { } from 'x';",
        'import "x";',
        'import Default from "x";',
        'import * as All from "x";',
        'import { } from "x";',
        'import { Foo } from "x";',
        'import { Foo, } from "x";',
        'import { Foo as Bar } from "x";',
        'import { Foo as Bar, } from "x";',
        'import { Foo, Bar } from "x";',
        'import { Foo, Bar, } from "x";',
        'import { Foo as Bar, Baz } from "x";',
        'import { Foo as Bar, Baz, } from "x";',
        'import { Foo, Bar as Baz } from "x";',
        'import { Foo, Bar as Baz, } from "x";',
        'import { Foo as Bar, Baz as Qux } from "x";',
        'import { Foo as Bar, Baz as Qux, } from "x";',
        'import { Foo, Bar, Baz } from "x";',
        'import { Foo, Bar, Baz, } from "x";',
        'import { Foo as Bar, Baz, Qux } from "x";',
        'import { Foo as Bar, Baz, Qux, } from "x";',
        'import { Foo, Bar as Baz, Qux } from "x";',
        'import { Foo, Bar as Baz, Qux, } from "x";',
        'import { Foo, Bar, Baz as Qux } from "x";',
        'import { Foo, Bar, Baz as Qux, } from "x";',
        'import { Foo as Bar, Baz as Qux, Norf } from "x";',
        'import { Foo as Bar, Baz as Qux, Norf, } from "x";',
        'import { Foo as Bar, Baz, Qux as Norf } from "x";',
        'import { Foo as Bar, Baz, Qux as Norf, } from "x";',
        'import { Foo, Bar as Baz, Qux as Norf } from "x";',
        'import { Foo, Bar as Baz, Qux as Norf, } from "x";',
        'import { Foo as Bar, Baz as Qux, Norf as NoMore } from "x";',
        'import { Foo as Bar, Baz as Qux, Norf as NoMore, } from "x";',
        'import Default, * as All from "x";',
        'import Default, { } from "x";',
        'import Default, { Foo } from "x";',
        'import Default, { Foo, } from "x";',
        'import Default, { Foo as Bar } from "x";',
        'import Default, { Foo as Bar, } from "x";',
        'import Default, { Foo, Bar } from "x";',
        'import Default, { Foo, Bar, } from "x";',
        'import Default, { Foo as Bar, Baz } from "x";',
        'import Default, { Foo as Bar, Baz, } from "x";',
        'import Default, { Foo, Bar as Baz } from "x";',
        'import Default, { Foo, Bar as Baz, } from "x";',
        'import Default, { Foo as Bar, Baz as Qux } from "x";',
        'import Default, { Foo as Bar, Baz as Qux, } from "x";',
        'import Default, { Foo, Bar, Baz } from "x";',
        'import Default, { Foo, Bar, Baz, } from "x";',
        'import Default, { Foo as Bar, Baz, Qux } from "x";',
        'import Default, { Foo as Bar, Baz, Qux, } from "x";',
        'import Default, { Foo, Bar as Baz, Qux } from "x";',
        'import Default, { Foo, Bar as Baz, Qux, } from "x";',
        'import Default, { Foo, Bar, Baz as Qux } from "x";',
        'import Default, { Foo, Bar, Baz as Qux, } from "x";',
        'import Default, { Foo as Bar, Baz as Qux, Norf } from "x";',
        'import Default, { Foo as Bar, Baz as Qux, Norf, } from "x";',
        'import Default, { Foo as Bar, Baz, Qux as Norf } from "x";',
        'import Default, { Foo as Bar, Baz, Qux as Norf, } from "x";',
        'import Default, { Foo, Bar as Baz, Qux as Norf } from "x";',
        'import Default, { Foo, Bar as Baz, Qux as Norf, } from "x";',
        'import Default, { Foo as Bar, Baz as Qux, Norf as Enuf } from "x";',
        'import Default, { Foo as Bar, Baz as Qux, Norf as Enuf, } from "x";',
        'import Default from "y";',
        'import * as All from \'z\';',
        // import with support for new lines
        "import { Foo,\n Bar }\n from 'x';",
        "import { \nFoo,\nBar,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz\n }\n from 'x';",
        "import { \nFoo as Bar,\n Baz\n, }\n from 'x';",
        "import { Foo,\n Bar as Baz\n }\n from 'x';",
        "import { Foo,\n Bar as Baz,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux,\n }\n from 'x';",
        "import { Foo,\n Bar,\n Baz }\n from 'x';",
        "import { Foo,\n Bar,\n Baz,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz,\n Qux\n }\n from 'x';",
        "import { Foo as Bar,\n Baz,\n Qux,\n }\n from 'x';",
        "import { Foo,\n Bar as Baz,\n Qux\n }\n from 'x';",
        "import { Foo,\n Bar as Baz,\n Qux,\n }\n from 'x';",
        "import { Foo,\n Bar,\n Baz as Qux\n }\n from 'x';",
        "import { Foo,\n Bar,\n Baz as Qux,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux,\n Norf\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux,\n Norf,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz,\n Qux as Norf\n }\n from 'x';",
        "import { Foo as Bar,\n Baz,\n Qux as Norf,\n }\n from 'x';",
        "import { Foo,\n Bar as Baz,\n Qux as Norf\n }\n from 'x';",
        "import { Foo,\n Bar as Baz,\n Qux as Norf,\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux,\n Norf as Enuf\n }\n from 'x';",
        "import { Foo as Bar,\n Baz as Qux,\n Norf as Enuf,\n }\n from 'x';",
        "import Default,\n * as All from 'x';",
        "import Default,\n { } from 'x';",
        "import Default,\n { Foo\n }\n from 'x';",
        "import Default,\n { Foo,\n }\n from 'x';",
        "import Default,\n { Foo as Bar\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar\n } from\n 'x';",
        "import Default,\n { Foo,\n Bar,\n } from\n 'x';",
        "import Default,\n { Foo as Bar,\n Baz\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz,\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar as Baz\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar as Baz,\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux,\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar,\n Baz\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar,\n Baz,\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz,\n Qux\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz,\n Qux,\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar as Baz,\n Qux\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar as Baz,\n Qux,\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar,\n Baz as Qux\n }\n from 'x';",
        "import Default,\n { Foo,\n Bar,\n Baz as Qux,\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf,\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz,\n Qux as Norf }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz,\n Qux as Norf, }\n from 'x';",
        "import Default,\n { Foo, Bar as Baz,\n Qux as Norf }\n from 'x';",
        "import Default,\n { Foo, Bar as Baz,\n Qux as Norf, }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf as NoMore\n }\n from 'x';",
        "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf as NoMore,\n }\n from 'x';",
        "import Default\n , { } from 'x';",
        // require
        'require("x")',
        'require("y")',
        'require( \'z\' )',
        'require( "a")',
        'require("b" )',
      ].join('\n');
      /*eslint-disable */

      depGraph.resolveDependency.mockImpl(function(fromModule, toModuleName) {
        if (toModuleName === 'x') {
          return Promise.resolve(createModule({
            id: 'changed'
          }));
        } else if (toModuleName === 'y') {
          return Promise.resolve(createModule({ id: 'Y' }));
        }

        return Promise.resolve(null);
      });

      return depResolver.wrapModule({
        id: 'test module',
        path: '/root/test.js',
        dependencies: dependencies
      }, code).then(processedCode => {

        expect(processedCode).toEqual([
          '__d(\'test module\',["changed","Y"],function(global,' +
            ' require, requireDynamic, requireLazy, module, exports) {  ' +
            // single line import
            "import'x';",
          "import 'changed';",
          "import 'changed' ;",
          "import Default from 'changed';",
          "import * as All from 'changed';",
          "import {} from 'changed';",
          "import { } from 'changed';",
          "import {Foo} from 'changed';",
          "import { Foo } from 'changed';",
          "import { Foo, } from 'changed';",
          "import {Foo as Bar} from 'changed';",
          "import { Foo as Bar } from 'changed';",
          "import { Foo as Bar, } from 'changed';",
          "import { Foo, Bar } from 'changed';",
          "import { Foo, Bar, } from 'changed';",
          "import { Foo as Bar, Baz } from 'changed';",
          "import { Foo as Bar, Baz, } from 'changed';",
          "import { Foo, Bar as Baz } from 'changed';",
          "import { Foo, Bar as Baz, } from 'changed';",
          "import { Foo as Bar, Baz as Qux } from 'changed';",
          "import { Foo as Bar, Baz as Qux, } from 'changed';",
          "import { Foo, Bar, Baz } from 'changed';",
          "import { Foo, Bar, Baz, } from 'changed';",
          "import { Foo as Bar, Baz, Qux } from 'changed';",
          "import { Foo as Bar, Baz, Qux, } from 'changed';",
          "import { Foo, Bar as Baz, Qux } from 'changed';",
          "import { Foo, Bar as Baz, Qux, } from 'changed';",
          "import { Foo, Bar, Baz as Qux } from 'changed';",
          "import { Foo, Bar, Baz as Qux, } from 'changed';",
          "import { Foo as Bar, Baz as Qux, Norf } from 'changed';",
          "import { Foo as Bar, Baz as Qux, Norf, } from 'changed';",
          "import { Foo as Bar, Baz, Qux as Norf } from 'changed';",
          "import { Foo as Bar, Baz, Qux as Norf, } from 'changed';",
          "import { Foo, Bar as Baz, Qux as Norf } from 'changed';",
          "import { Foo, Bar as Baz, Qux as Norf, } from 'changed';",
          "import { Foo as Bar, Baz as Qux, Norf as Enuf } from 'changed';",
          "import { Foo as Bar, Baz as Qux, Norf as Enuf, } from 'changed';",
          "import Default, * as All from 'changed';",
          "import Default, { } from 'changed';",
          "import Default, { Foo } from 'changed';",
          "import Default, { Foo, } from 'changed';",
          "import Default, { Foo as Bar } from 'changed';",
          "import Default, { Foo as Bar, } from 'changed';",
          "import Default, { Foo, Bar } from 'changed';",
          "import Default, { Foo, Bar, } from 'changed';",
          "import Default, { Foo as Bar, Baz } from 'changed';",
          "import Default, { Foo as Bar, Baz, } from 'changed';",
          "import Default, { Foo, Bar as Baz } from 'changed';",
          "import Default, { Foo, Bar as Baz, } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux, } from 'changed';",
          "import Default, { Foo, Bar, Baz } from 'changed';",
          "import Default, { Foo, Bar, Baz, } from 'changed';",
          "import Default, { Foo as Bar, Baz, Qux } from 'changed';",
          "import Default, { Foo as Bar, Baz, Qux, } from 'changed';",
          "import Default, { Foo, Bar as Baz, Qux } from 'changed';",
          "import Default, { Foo, Bar as Baz, Qux, } from 'changed';",
          "import Default, { Foo, Bar, Baz as Qux } from 'changed';",
          "import Default, { Foo, Bar, Baz as Qux, } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux, Norf } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux, Norf, } from 'changed';",
          "import Default, { Foo as Bar, Baz, Qux as Norf } from 'changed';",
          "import Default, { Foo as Bar, Baz, Qux as Norf, } from 'changed';",
          "import Default, { Foo, Bar as Baz, Qux as Norf } from 'changed';",
          "import Default, { Foo, Bar as Baz, Qux as Norf, } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux, Norf as NoMore } from 'changed';",
          "import Default, { Foo as Bar, Baz as Qux, Norf as NoMore, } from 'changed';",
          "import Default , { } from 'changed';",
          'import "changed";',
          'import Default from "changed";',
          'import * as All from "changed";',
          'import { } from "changed";',
          'import { Foo } from "changed";',
          'import { Foo, } from "changed";',
          'import { Foo as Bar } from "changed";',
          'import { Foo as Bar, } from "changed";',
          'import { Foo, Bar } from "changed";',
          'import { Foo, Bar, } from "changed";',
          'import { Foo as Bar, Baz } from "changed";',
          'import { Foo as Bar, Baz, } from "changed";',
          'import { Foo, Bar as Baz } from "changed";',
          'import { Foo, Bar as Baz, } from "changed";',
          'import { Foo as Bar, Baz as Qux } from "changed";',
          'import { Foo as Bar, Baz as Qux, } from "changed";',
          'import { Foo, Bar, Baz } from "changed";',
          'import { Foo, Bar, Baz, } from "changed";',
          'import { Foo as Bar, Baz, Qux } from "changed";',
          'import { Foo as Bar, Baz, Qux, } from "changed";',
          'import { Foo, Bar as Baz, Qux } from "changed";',
          'import { Foo, Bar as Baz, Qux, } from "changed";',
          'import { Foo, Bar, Baz as Qux } from "changed";',
          'import { Foo, Bar, Baz as Qux, } from "changed";',
          'import { Foo as Bar, Baz as Qux, Norf } from "changed";',
          'import { Foo as Bar, Baz as Qux, Norf, } from "changed";',
          'import { Foo as Bar, Baz, Qux as Norf } from "changed";',
          'import { Foo as Bar, Baz, Qux as Norf, } from "changed";',
          'import { Foo, Bar as Baz, Qux as Norf } from "changed";',
          'import { Foo, Bar as Baz, Qux as Norf, } from "changed";',
          'import { Foo as Bar, Baz as Qux, Norf as NoMore } from "changed";',
          'import { Foo as Bar, Baz as Qux, Norf as NoMore, } from "changed";',
          'import Default, * as All from "changed";',
          'import Default, { } from "changed";',
          'import Default, { Foo } from "changed";',
          'import Default, { Foo, } from "changed";',
          'import Default, { Foo as Bar } from "changed";',
          'import Default, { Foo as Bar, } from "changed";',
          'import Default, { Foo, Bar } from "changed";',
          'import Default, { Foo, Bar, } from "changed";',
          'import Default, { Foo as Bar, Baz } from "changed";',
          'import Default, { Foo as Bar, Baz, } from "changed";',
          'import Default, { Foo, Bar as Baz } from "changed";',
          'import Default, { Foo, Bar as Baz, } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux, } from "changed";',
          'import Default, { Foo, Bar, Baz } from "changed";',
          'import Default, { Foo, Bar, Baz, } from "changed";',
          'import Default, { Foo as Bar, Baz, Qux } from "changed";',
          'import Default, { Foo as Bar, Baz, Qux, } from "changed";',
          'import Default, { Foo, Bar as Baz, Qux } from "changed";',
          'import Default, { Foo, Bar as Baz, Qux, } from "changed";',
          'import Default, { Foo, Bar, Baz as Qux } from "changed";',
          'import Default, { Foo, Bar, Baz as Qux, } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux, Norf } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux, Norf, } from "changed";',
          'import Default, { Foo as Bar, Baz, Qux as Norf } from "changed";',
          'import Default, { Foo as Bar, Baz, Qux as Norf, } from "changed";',
          'import Default, { Foo, Bar as Baz, Qux as Norf } from "changed";',
          'import Default, { Foo, Bar as Baz, Qux as Norf, } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux, Norf as Enuf } from "changed";',
          'import Default, { Foo as Bar, Baz as Qux, Norf as Enuf, } from "changed";',
          'import Default from "Y";',
          'import * as All from \'z\';',
          // import with support for new lines
          "import { Foo,\n Bar }\n from 'changed';",
          "import { \nFoo,\nBar,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz\n }\n from 'changed';",
          "import { \nFoo as Bar,\n Baz\n, }\n from 'changed';",
          "import { Foo,\n Bar as Baz\n }\n from 'changed';",
          "import { Foo,\n Bar as Baz,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux,\n }\n from 'changed';",
          "import { Foo,\n Bar,\n Baz }\n from 'changed';",
          "import { Foo,\n Bar,\n Baz,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz,\n Qux\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz,\n Qux,\n }\n from 'changed';",
          "import { Foo,\n Bar as Baz,\n Qux\n }\n from 'changed';",
          "import { Foo,\n Bar as Baz,\n Qux,\n }\n from 'changed';",
          "import { Foo,\n Bar,\n Baz as Qux\n }\n from 'changed';",
          "import { Foo,\n Bar,\n Baz as Qux,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux,\n Norf\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux,\n Norf,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz,\n Qux as Norf\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz,\n Qux as Norf,\n }\n from 'changed';",
          "import { Foo,\n Bar as Baz,\n Qux as Norf\n }\n from 'changed';",
          "import { Foo,\n Bar as Baz,\n Qux as Norf,\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux,\n Norf as Enuf\n }\n from 'changed';",
          "import { Foo as Bar,\n Baz as Qux,\n Norf as Enuf,\n }\n from 'changed';",
          "import Default,\n * as All from 'changed';",
          "import Default,\n { } from 'changed';",
          "import Default,\n { Foo\n }\n from 'changed';",
          "import Default,\n { Foo,\n }\n from 'changed';",
          "import Default,\n { Foo as Bar\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar\n } from\n 'changed';",
          "import Default,\n { Foo,\n Bar,\n } from\n 'changed';",
          "import Default,\n { Foo as Bar,\n Baz\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz,\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar as Baz\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar as Baz,\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux,\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar,\n Baz\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar,\n Baz,\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz,\n Qux\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz,\n Qux,\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar as Baz,\n Qux\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar as Baz,\n Qux,\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar,\n Baz as Qux\n }\n from 'changed';",
          "import Default,\n { Foo,\n Bar,\n Baz as Qux,\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf,\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz,\n Qux as Norf }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz,\n Qux as Norf, }\n from 'changed';",
          "import Default,\n { Foo, Bar as Baz,\n Qux as Norf }\n from 'changed';",
          "import Default,\n { Foo, Bar as Baz,\n Qux as Norf, }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf as NoMore\n }\n from 'changed';",
          "import Default,\n { Foo as Bar,\n Baz as Qux,\n Norf as NoMore,\n }\n from 'changed';",
          "import Default\n , { } from 'changed';",
          // require
          'require("changed")',
          'require("Y")',
          'require( \'z\' )',
          'require( "a")',
          'require("b" )',
          '});',
        ].join('\n'));
      });
    });
  });
});
