/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <memory>

#include <react/componentregistry/ComponentDescriptorRegistry.h>
#include <react/core/ComponentDescriptor.h>
#include <react/core/ShadowNode.h>
#include <react/core/ShadowNodeFamilyFragment.h>
#include <react/core/ShadowNodeFragment.h>

#include <react/element/Element.h>
#include <react/element/ElementFragment.h>

namespace facebook {
namespace react {

/*
 * Build `ShadowNode` trees with a given given `Element` trees.
 */
class ComponentBuilder final {
 public:
  ComponentBuilder(
      ComponentDescriptorRegistry::Shared const &componentDescriptorRegistry);

  /*
   * Copyable and movable.
   */
  ComponentBuilder(ComponentBuilder const &componentBuilder) = default;
  ComponentBuilder(ComponentBuilder &&componentBuilder) noexcept = default;
  ComponentBuilder &operator=(ComponentBuilder const &other) = default;
  ComponentBuilder &operator=(ComponentBuilder &&other) = default;

  /*
   * Builds a `ShadowNode` tree with given `Element` tree using stored
   * `ComponentDescriptorRegistry`.
   */
  template <typename ShadowNodeT>
  std::shared_ptr<ShadowNodeT> build(Element<ShadowNodeT> element) const {
    return std::static_pointer_cast<ShadowNodeT>(build(element.fragment_));
  }

 private:
  /*
   * Internal, type-erased version of `build`.
   */
  ShadowNode::Unshared build(ElementFragment const &elementFragment) const;

  ComponentDescriptorRegistry::Shared componentDescriptorRegistry_;
};

} // namespace react
} // namespace facebook
