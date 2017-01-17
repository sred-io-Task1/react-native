/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

package com.facebook.react.views.scroll;

import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.views.view.ReactViewGroup;

import java.util.ArrayList;

/**
 * Helper class that deals with emitting Scroll Events.
 */

public class ReactScrollViewHelper {

  public static final long MOMENTUM_DELAY = 20;
  public static final String OVER_SCROLL_ALWAYS = "always";
  public static final String AUTO = "auto";
  public static final String OVER_SCROLL_NEVER = "never";

  private static ArrayList<ChildFrame> mCachedChildFrames = new ArrayList<>();

  public static ArrayList<ChildFrame> calculateChildFrames(ReactViewGroup contentView) {
    ArrayList<ChildFrame> updatedChildFrames = new ArrayList<>();
    int childCount = contentView.getAllChildrenCount();

    for (int i = 0; i < childCount; i++) {
      View child = contentView.getChildAtWithSubviewClippingEnabled(i);

      boolean isChanged = false;
      ChildFrame childFrame = new ChildFrame();
      childFrame.index = i;
      childFrame.x = child.getLeft();
      childFrame.y = child.getTop();
      childFrame.height = child.getHeight();
      childFrame.width = child.getWidth();


      // new
      if (mCachedChildFrames.size() <= i) {
        isChanged = true;
        mCachedChildFrames.add(childFrame);
      }


      if (mCachedChildFrames.size() > i) {
        ChildFrame cachedChildFrame = mCachedChildFrames.get(i);

        // changed
        if (cachedChildFrame.height != childFrame.height ||
                cachedChildFrame.width != childFrame.width ||
                cachedChildFrame.x != childFrame.x ||
                cachedChildFrame.y != childFrame.y) {
          isChanged = true;
          mCachedChildFrames.set(i, childFrame);
        }
      }

      if (isChanged) {
        updatedChildFrames.add(childFrame);

      }
    }

    return updatedChildFrames;
  }
  
  /**
   * Shared by {@link ReactScrollView} and {@link ReactHorizontalScrollView}.
   */
  public static void emitScrollEvent(ViewGroup scrollView) {
    View contentView = scrollView.getChildAt(0);

    if (contentView == null) {
      return;
    }

    ArrayList<ChildFrame> childFrames = calculateChildFrames((ReactViewGroup)contentView);

    ReactContext reactContext = (ReactContext) scrollView.getContext();
    reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher().dispatchEvent(
            ScrollEvent.obtain(
                    scrollView.getId(),
                    ScrollEventType.SCROLL,
                    scrollView.getScrollX(),
                    scrollView.getScrollY(),
                    contentView.getWidth(),
                    contentView.getHeight(),
                    scrollView.getWidth(),
                    scrollView.getHeight(),
                    childFrames
            )
    );
  }

  public static void emitScrollBeginDragEvent(ViewGroup scrollView) {
    emitScrollEvent(scrollView, ScrollEventType.BEGIN_DRAG);
  }

  public static void emitScrollEndDragEvent(ViewGroup scrollView) {
    emitScrollEvent(scrollView, ScrollEventType.END_DRAG);
  }

  public static void emitScrollMomentumBeginEvent(ViewGroup scrollView) {
    emitScrollEvent(scrollView, ScrollEventType.MOMENTUM_BEGIN);
  }

  public static void emitScrollMomentumEndEvent(ViewGroup scrollView) {
    emitScrollEvent(scrollView, ScrollEventType.MOMENTUM_END);
  }

  private static void emitScrollEvent(ViewGroup scrollView, ScrollEventType scrollEventType) {
    View contentView = scrollView.getChildAt(0);

    if (contentView == null) {
      return;
    }

    ReactContext reactContext = (ReactContext) scrollView.getContext();
    reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher().dispatchEvent(
        ScrollEvent.obtain(
            scrollView.getId(),
            scrollEventType,
            scrollView.getScrollX(),
            scrollView.getScrollY(),
            contentView.getWidth(),
            contentView.getHeight(),
            scrollView.getWidth(),
            scrollView.getHeight()));
  }

  public static int parseOverScrollMode(String jsOverScrollMode) {
    if (jsOverScrollMode == null || jsOverScrollMode.equals(AUTO)) {
      return View.OVER_SCROLL_IF_CONTENT_SCROLLS;
    } else if (jsOverScrollMode.equals(OVER_SCROLL_ALWAYS)) {
      return View.OVER_SCROLL_ALWAYS;
    } else if (jsOverScrollMode.equals(OVER_SCROLL_NEVER)) {
      return View.OVER_SCROLL_NEVER;
    } else {
      throw new JSApplicationIllegalArgumentException("wrong overScrollMode: " + jsOverScrollMode);
    }
  }
}
