/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "IntersectionObserver.h"
#include <react/debug/react_native_assert.h>
#include <react/renderer/core/LayoutMetrics.h>
#include <react/renderer/core/LayoutableShadowNode.h>
#include <react/renderer/core/ShadowNodeFamily.h>
#include <utility>

namespace facebook::react {

IntersectionObserver::IntersectionObserver(
    IntersectionObserverObserverId intersectionObserverId,
    ShadowNode::Shared observationRootShadowNode,
    ShadowNode::Shared targetShadowNode,
    std::vector<Float> thresholds)
    : intersectionObserverId_(intersectionObserverId),
      observationRootShadowNode_(std::move(observationRootShadowNode)),
      targetShadowNode_(std::move(targetShadowNode)),
      thresholds_(std::move(thresholds)) {}

static Rect getRootNodeBoundingRect(const RootShadowNode& rootShadowNode) {
  const auto layoutableRootShadowNode =
      dynamic_cast<const LayoutableShadowNode*>(&rootShadowNode);

  react_native_assert(
      layoutableRootShadowNode != nullptr &&
      "RootShadowNode instances must always inherit from LayoutableShadowNode.");

  auto layoutMetrics = layoutableRootShadowNode->getLayoutMetrics();

  if (layoutMetrics == EmptyLayoutMetrics ||
      layoutMetrics.displayType == DisplayType::None) {
    return Rect{};
  }

  // Apply the transform to translate the root view to its location in the
  // viewport.
  return layoutMetrics.frame * layoutableRootShadowNode->getTransform();
}

static Rect getTargetBoundingRect(
    const ShadowNodeFamily::AncestorList& targetAncestors) {
  auto layoutMetrics = LayoutableShadowNode::computeRelativeLayoutMetrics(
      targetAncestors,
      {/* .includeTransform = */ true,
       /* .includeViewportOffset = */ true});
  return layoutMetrics == EmptyLayoutMetrics ? Rect{} : layoutMetrics.frame;
}

static Rect getRootBoundingRect(
    const ShadowNode::Shared& observationRootShadowNode,
    const RootShadowNode& rootShadowNode,
    const ShadowNodeFamily::AncestorList& rootAncestors) {
  if (observationRootShadowNode == nullptr) {
    return getRootNodeBoundingRect(rootShadowNode);
  }

  // Absolute coordinates of the root
  auto rootBoundingRect = getTargetBoundingRect(rootAncestors);

  return rootBoundingRect;
}

static Rect getClippedBoundingRect(
    const ShadowNodeFamily::AncestorList& ancestors) {
  auto layoutMetrics = LayoutableShadowNode::computeRelativeLayoutMetrics(
      ancestors,
      {/* .includeTransform = */ true,
       /* .includeViewportOffset = */ true,
       /* .applyParentClipping = */ true});

  return layoutMetrics == EmptyLayoutMetrics ? Rect{} : layoutMetrics.frame;
}

// Partially equivalent to
// https://w3c.github.io/IntersectionObserver/#compute-the-intersection
static Rect computeIntersection(
    const Rect& rootBoundingRect,
    const ShadowNodeFamily::AncestorList& rootAncestors,
    const Rect& targetBoundingRect,
    const ShadowNodeFamily::AncestorList& targetAncestors) {
  auto absoluteIntersectionRect =
      Rect::intersect(rootBoundingRect, targetBoundingRect);

  Float absoluteIntersectionRectArea = absoluteIntersectionRect.size.width *
      absoluteIntersectionRect.size.height;

  Float targetBoundingRectArea =
      targetBoundingRect.size.width * targetBoundingRect.size.height;

  // Finish early if there is not intersection between the root and the target
  // before we do any clipping.
  if (absoluteIntersectionRectArea == 0 || targetBoundingRectArea == 0) {
    return {};
  }

  // Coordinates of the target after clipping the parts hidden by a parent
  // (e.g.: in scroll views, or in views with a parent with overflow: hidden)
  auto clippedRootBoundingRect = rootAncestors.empty()
      ? rootBoundingRect
      : getClippedBoundingRect(rootAncestors);
  auto clippedTargetBoundingRect = getClippedBoundingRect(targetAncestors);

  return Rect::intersect(clippedRootBoundingRect, clippedTargetBoundingRect);
}

// Partially equivalent to
// https://w3c.github.io/IntersectionObserver/#update-intersection-observations-algo
std::optional<IntersectionObserverEntry>
IntersectionObserver::updateIntersectionObservation(
    const RootShadowNode& rootShadowNode,
    double time) {
  auto rootAncestors = observationRootShadowNode_ == nullptr
      ? ShadowNodeFamily::AncestorList{}
      : observationRootShadowNode_->getFamily().getAncestors(rootShadowNode);

  auto targetAncestors =
      targetShadowNode_->getFamily().getAncestors(rootShadowNode);

  // Absolute coordinates of the root
  auto rootBoundingRect = getRootBoundingRect(
      observationRootShadowNode_, rootShadowNode, rootAncestors);

  // Absolute coordinates of the target
  auto targetBoundingRect = getTargetBoundingRect(targetAncestors);

  if ((observationRootShadowNode_ != nullptr && rootAncestors.empty()) ||
      targetAncestors.empty()) {
    // If observation root is not a descendant of root
    // Or target is not a descendant of observation root
    return setNotIntersectingState(rootBoundingRect, targetBoundingRect, time);
  }

  auto intersectionRect = computeIntersection(
      rootBoundingRect, rootAncestors, targetBoundingRect, targetAncestors);

  Float targetBoundingRectArea =
      targetBoundingRect.size.width * targetBoundingRect.size.height;
  auto intersectionRectArea =
      intersectionRect.size.width * intersectionRect.size.height;

  Float intersectionRatio =
      targetBoundingRectArea == 0 // prevent division by zero
      ? 0
      : intersectionRectArea / targetBoundingRectArea;

  if (intersectionRatio == 0) {
    return setNotIntersectingState(rootBoundingRect, targetBoundingRect, time);
  }

  auto highestThresholdCrossed = getHighestThresholdCrossed(intersectionRatio);
  if (highestThresholdCrossed == -1) {
    return setNotIntersectingState(rootBoundingRect, targetBoundingRect, time);
  }

  return setIntersectingState(
      rootBoundingRect,
      targetBoundingRect,
      intersectionRect,
      highestThresholdCrossed,
      time);
}

std::optional<IntersectionObserverEntry>
IntersectionObserver::updateIntersectionObservationForSurfaceUnmount(
    double time) {
  return setNotIntersectingState(Rect{}, Rect{}, time);
}

Float IntersectionObserver::getHighestThresholdCrossed(
    Float intersectionRatio) {
  Float highestThreshold = -1;
  for (auto threshold : thresholds_) {
    if (intersectionRatio >= threshold) {
      highestThreshold = threshold;
    }
  }
  return highestThreshold;
}

std::optional<IntersectionObserverEntry>
IntersectionObserver::setIntersectingState(
    const Rect& rootBoundingRect,
    const Rect& targetBoundingRect,
    const Rect& intersectionRect,
    Float threshold,
    double time) {
  auto newState = IntersectionObserverState::Intersecting(threshold);

  if (state_ != newState) {
    state_ = newState;
    IntersectionObserverEntry entry{
        intersectionObserverId_,
        targetShadowNode_,
        targetBoundingRect,
        rootBoundingRect,
        intersectionRect,
        true,
        time,
    };
    return std::optional<IntersectionObserverEntry>{std::move(entry)};
  }

  return std::nullopt;
}

std::optional<IntersectionObserverEntry>
IntersectionObserver::setNotIntersectingState(
    const Rect& rootBoundingRect,
    const Rect& targetBoundingRect,
    double time) {
  if (state_ != IntersectionObserverState::NotIntersecting()) {
    state_ = IntersectionObserverState::NotIntersecting();
    IntersectionObserverEntry entry{
        intersectionObserverId_,
        targetShadowNode_,
        targetBoundingRect,
        rootBoundingRect,
        std::nullopt,
        false,
        time,
    };
    return std::optional<IntersectionObserverEntry>(std::move(entry));
  }

  return std::nullopt;
}

} // namespace facebook::react
