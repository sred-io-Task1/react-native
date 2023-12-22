/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {SchemaType} from '../../CodegenSchema';

const {
  generateSupportedApplePlatformsMacro,
} = require('./ComponentsProviderUtils');

// File path -> contents
type FilesOutput = Map<string, string>;

const FileTemplate = ({lookupMap}: {lookupMap: string}) => `
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * ${'@'}generated by GenerateRCTThirdPartyFabricComponentsProviderCpp
 */

// OSS-compatibility layer

#import "RCTThirdPartyFabricComponentsProvider.h"

#import <string>
#import <unordered_map>

Class<RCTComponentViewProtocol> RCTThirdPartyFabricComponentsProvider(const char *name) {
  static std::unordered_map<std::string, Class (*)(void)> sFabricComponentsClassMap = {
    #ifndef RCT_DYNAMIC_FRAMEWORKS
${lookupMap}
    #endif
  };

  auto p = sFabricComponentsClassMap.find(name);
  if (p != sFabricComponentsClassMap.end()) {
    auto classFunc = p->second;
    return classFunc();
  }
  return nil;
}
`;

const LookupMapTemplate = ({
  className,
  libraryName,
}: {
  className: string,
  libraryName: string,
}) => `
    {"${className}", ${className}Cls}, // ${libraryName}`;

module.exports = {
  generate(
    schemas: {[string]: SchemaType},
    supportedApplePlatforms?: {[string]: {[string]: boolean}},
  ): FilesOutput {
    const fileName = 'RCTThirdPartyFabricComponentsProvider.mm';

    const lookupMap = Object.keys(schemas)
      .map(libraryName => {
        const schema = schemas[libraryName];
        const librarySupportedApplePlatforms =
          supportedApplePlatforms?.[libraryName];

        const generatedLookup = Object.keys(schema.modules)
          .map(moduleName => {
            const module = schema.modules[moduleName];
            if (module.type !== 'Component') {
              return;
            }

            const {components} = module;
            // No components in this module
            if (components == null) {
              return null;
            }

            const componentTemplates = Object.keys(components)
              .filter(componentName => {
                const component = components[componentName];
                return !(
                  component.excludedPlatforms &&
                  component.excludedPlatforms.includes('iOS')
                );
              })
              .map(componentName => {
                const replacedTemplate = LookupMapTemplate({
                  className: componentName,
                  libraryName,
                });

                return replacedTemplate;
              });

            return componentTemplates.length > 0 ? componentTemplates : null;
          })
          .filter(Boolean)
          .join('\n');

        return generateSupportedApplePlatformsMacro(
          generatedLookup,
          librarySupportedApplePlatforms,
        );
      })
      .join('\n');

    const replacedTemplate = FileTemplate({lookupMap});

    return new Map([[fileName, replacedTemplate]]);
  },
};
