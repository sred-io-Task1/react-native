/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b39abca7a1fcce7ae124565cfc619d04>>
 */

/**
 * IMPORTANT: Do NOT modify this file directly.
 *
 * To change the definition of the flags, edit
 *   packages/react-native/scripts/featureflags/ReactNativeFeatureFlags.json.
 *
 * To regenerate this code, run the following script from the repo root:
 *   yarn featureflags-update
 */

#pragma once

#include <react/featureflags/ReactNativeFeatureFlagsProvider.h>

namespace facebook::react {

class ReactNativeFeatureFlagsDefaults : public ReactNativeFeatureFlagsProvider {
 public:
  ReactNativeFeatureFlagsDefaults() = default;

  bool commonTestFlag() override {
    return false;
  }

  bool useModernRuntimeScheduler() override {
    return false;
  }

  bool enableMicrotasks() override {
    return false;
  }

  bool batchRenderingUpdatesInEventLoop() override {
    return false;
  }

  bool enableSpannableBuildingUnification() override {
    return false;
  }

  bool enableCustomDrawOrderFabric() override {
    return false;
  }

  bool enableFixForClippedSubviewsCrash() override {
    return false;
  }
};

} // namespace facebook::react
