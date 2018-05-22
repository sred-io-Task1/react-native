/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <fabric/core/Props.h>
#include <fabric/core/ShadowNode.h>

namespace facebook {
namespace react {

/*
 * Base templace class for all `ShadowNode`s which connects exact `ShadowNode`
 * type with exact `Props` type.
 * `ConcreteShadowNode` is a default implementation of `ShadowNode` interface
 * with many handy features.
 */
template <typename PropsT>
class ConcreteShadowNode: public ShadowNode {
  static_assert(std::is_base_of<Props, PropsT>::value, "PropsT must be a descendant of Props");

public:
  using ConcreteProps = PropsT;
  using SharedConcreteProps = std::shared_ptr<const PropsT>;
  using SharedConcreteShadowNode = std::shared_ptr<const ConcreteShadowNode>;

  static SharedConcreteProps Props(const RawProps &rawProps, const SharedProps &baseProps = nullptr) {
    return std::make_shared<const PropsT>(baseProps ? *std::static_pointer_cast<const PropsT>(baseProps) : PropsT(), rawProps);
  }

  static SharedConcreteProps defaultSharedProps() {
    static const SharedConcreteProps defaultSharedProps = std::make_shared<const PropsT>();
    return defaultSharedProps;
  }

  ConcreteShadowNode(
    const Tag &tag,
    const Tag &rootTag,
    const InstanceHandle &instanceHandle,
    const SharedConcreteProps &props,
    const SharedShadowNodeSharedList &children,
    const ShadowNodeCloneFunction &cloneFunction
  ):
    ShadowNode(
      tag,
      rootTag,
      instanceHandle,
      (SharedProps)props,
      children,
      cloneFunction
    ) {};

  ConcreteShadowNode(
    const SharedConcreteShadowNode &shadowNode,
    const SharedProps &props,
    const SharedShadowNodeSharedList &children
  ):
    ShadowNode(
      shadowNode,
      (SharedProps)props,
      children
    ) {}

  virtual ComponentHandle getComponentHandle() const {
    return typeid(*this).hash_code();
  }

  const SharedConcreteProps getProps() const {
    assert(std::dynamic_pointer_cast<const PropsT>(props_));
    return std::static_pointer_cast<const PropsT>(props_);
  }
};

} // namespace react
} // namespace facebook
