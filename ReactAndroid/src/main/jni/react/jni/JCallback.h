/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <memory>

#include <butter/function.h>
#include <fbjni/fbjni.h>
#include <folly/dynamic.h>

#include "NativeArray.h"

namespace facebook {
namespace react {

class Instance;

struct JCallback : public jni::JavaClass<JCallback> {
  constexpr static auto kJavaDescriptor =
      "Lcom/facebook/react/bridge/Callback;";
};

class JCxxCallbackImpl : public jni::HybridClass<JCxxCallbackImpl, JCallback> {
 public:
  constexpr static auto kJavaDescriptor =
      "Lcom/facebook/react/bridge/CxxCallbackImpl;";

  static void registerNatives() {
#if __clang__
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wgnu-zero-variadic-macro-arguments"
#endif
    javaClassStatic()->registerNatives({
        makeNativeMethod("nativeInvoke", JCxxCallbackImpl::invoke),
    });
#if __clang__
#pragma clang diagnostic pop
#endif
  }

 private:
  friend HybridBase;

  using Callback = butter::function<void(folly::dynamic)>;
  JCxxCallbackImpl(Callback callback) : callback_(std::move(callback)) {}

  void invoke(NativeArray *arguments) {
    callback_(arguments->consume());
  }

  Callback callback_;
};

} // namespace react
} // namespace facebook
