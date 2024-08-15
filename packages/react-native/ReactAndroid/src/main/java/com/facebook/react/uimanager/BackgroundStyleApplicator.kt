/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.uimanager

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.Drawable
import android.os.Build
import android.view.View
import androidx.annotation.ColorInt
import androidx.annotation.RequiresApi
import com.facebook.common.logging.FLog
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.annotations.UnstableReactNativeAPI
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.modules.i18nmanager.I18nUtil
import com.facebook.react.uimanager.drawable.CSSBackgroundDrawable
import com.facebook.react.uimanager.drawable.CompositeBackgroundDrawable
import com.facebook.react.uimanager.drawable.InsetBoxShadowDrawable
import com.facebook.react.uimanager.drawable.OutsetBoxShadowDrawable
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.uimanager.style.BorderRadiusStyle
import com.facebook.react.uimanager.style.BorderStyle
import com.facebook.react.uimanager.style.BoxShadow
import com.facebook.react.uimanager.style.LogicalEdge

/**
 * BackgroundStyleApplicator is responsible for applying backgrounds, borders, and related effects,
 * to an Android view
 */
@OptIn(UnstableReactNativeAPI::class)
public object BackgroundStyleApplicator {

  @JvmStatic
  public fun setBackgroundColor(view: View, @ColorInt color: Int?): Unit {
    // No color to set, and no color already set
    if ((color == null || color == Color.TRANSPARENT) &&
        view.background !is CompositeBackgroundDrawable) {
      return
    }

    ensureCSSBackground(view).color = color ?: Color.TRANSPARENT
  }

  @JvmStatic
  @ColorInt
  public fun getBackgroundColor(view: View): Int? = getCSSBackground(view)?.color

  @JvmStatic
  public fun setBorderWidth(view: View, edge: LogicalEdge, width: Float?): Unit =
      ensureCSSBackground(view)
          .setBorderWidth(edge.toSpacingType(), PixelUtil.toPixelFromDIP(width ?: Float.NaN))

  @JvmStatic
  public fun getBorderWidth(view: View, edge: LogicalEdge): Float? {
    val width = getCSSBackground(view)?.getBorderWidth(edge.toSpacingType())
    return if (width == null || width.isNaN()) null else PixelUtil.toDIPFromPixel((width))
  }

  @JvmStatic
  public fun setBorderColor(view: View, edge: LogicalEdge, @ColorInt color: Int?): Unit =
      ensureCSSBackground(view).setBorderColor(edge.toSpacingType(), color)

  @JvmStatic
  @ColorInt
  public fun getBorderColor(view: View, edge: LogicalEdge): Int? =
      getCSSBackground(view)?.getBorderColor(edge.toSpacingType())

  @JvmStatic
  public fun setBorderRadius(
      view: View,
      corner: BorderRadiusProp,
      radius: LengthPercentage?
  ): Unit {
    ensureCSSBackground(view).setBorderRadius(corner, radius)

    if (Build.VERSION.SDK_INT >= 31) {
      getCompositeBackgroundDrawable(view)?.outerShadows?.forEach { shadow ->
        val outsetShadow = shadow as OutsetBoxShadowDrawable
        outsetShadow.borderRadius = outsetShadow.borderRadius ?: BorderRadiusStyle()
        outsetShadow.borderRadius?.set(corner, radius)
      }
    }
  }

  @JvmStatic
  public fun getBorderRadius(view: View, corner: BorderRadiusProp): LengthPercentage? =
      getCSSBackground(view)?.borderRadius?.get(corner)

  @JvmStatic
  public fun setBorderStyle(view: View, borderStyle: BorderStyle?): Unit {
    ensureCSSBackground(view).borderStyle = borderStyle
  }

  @JvmStatic
  public fun getBorderStyle(view: View): BorderStyle? = getCSSBackground(view)?.borderStyle

  @JvmStatic
  @RequiresApi(31)
  public fun setBoxShadow(view: View, shadows: List<BoxShadow>): Unit {
    val outerShadows = mutableListOf<OutsetBoxShadowDrawable>()
    val innerShadows = mutableListOf<InsetBoxShadowDrawable>()

    for (boxShadow in shadows) {
      val offsetX = boxShadow.offsetX
      val offsetY = boxShadow.offsetY
      val color = boxShadow.color ?: Color.BLACK
      val blurRadius = boxShadow.blurRadius ?: 0f
      val spreadDistance = boxShadow.spreadDistance ?: 0f
      val inset = boxShadow.inset ?: false

      if (inset) {
        innerShadows.add(
            InsetBoxShadowDrawable(
                context = view.context,
                background = ensureCSSBackground(view),
                shadowColor = color,
                offsetX = offsetX,
                offsetY = offsetY,
                blurRadius = blurRadius,
                spread = spreadDistance))
      } else {
        outerShadows.add(
            OutsetBoxShadowDrawable(
                context = view.context,
                borderRadius = ensureCSSBackground(view).borderRadius,
                shadowColor = color,
                offsetX = offsetX,
                offsetY = offsetY,
                blurRadius = blurRadius,
                spread = spreadDistance))
      }
    }

    view.background =
        ensureCompositeBackgroundDrawable(view)
            .withNewShadows(outerShadows = outerShadows, innerShadows = innerShadows)
  }

  @JvmStatic
  public fun setBoxShadow(view: View, shadows: ReadableArray?): Unit {
    if (Build.VERSION.SDK_INT < 31) {
      FLog.w("BackgroundStyleApplicator", "\"boxShadow\" requires Android 12 or later")
      return
    }

    if (shadows == null) {
      BackgroundStyleApplicator.setBoxShadow(view, emptyList())
      return
    }

    val shadowStyles = mutableListOf<BoxShadow>()
    for (i in 0..<shadows.size()) {
      shadowStyles.add(checkNotNull(BoxShadow.parse(shadows.getMap(i))))
    }
    BackgroundStyleApplicator.setBoxShadow(view, shadowStyles)
  }

  @JvmStatic
  public fun setFeedbackUnderlay(view: View, drawable: Drawable?): Unit {
    view.background = ensureCompositeBackgroundDrawable(view).withNewFeedbackUnderlay(drawable)
  }

  @JvmStatic
  public fun clipToPaddingBox(view: View, canvas: Canvas): Unit {
    // The canvas may be scrolled, so we need to offset
    val drawingRect = Rect()
    view.getDrawingRect(drawingRect)

    val cssBackground = getCSSBackground(view)
    if (cssBackground == null) {
      canvas.clipRect(drawingRect)
      return
    }

    val paddingBoxPath = cssBackground.paddingBoxPath
    if (paddingBoxPath != null) {
      paddingBoxPath.offset(drawingRect.left.toFloat(), drawingRect.top.toFloat())
      canvas.clipPath(paddingBoxPath)
    } else {
      val paddingBoxRect = cssBackground.paddingBoxRect
      paddingBoxRect.offset(drawingRect.left.toFloat(), drawingRect.top.toFloat())
      canvas.clipRect(paddingBoxRect)
    }
  }

  @JvmStatic
  public fun reset(view: View): Unit {
    if (view.background is CompositeBackgroundDrawable) {
      view.background = (view.background as CompositeBackgroundDrawable).originalBackground
    }
  }

  private fun ensureCompositeBackgroundDrawable(view: View): CompositeBackgroundDrawable {
    if (view.background is CompositeBackgroundDrawable) {
      return view.background as CompositeBackgroundDrawable
    }

    val compositeDrawable = CompositeBackgroundDrawable(originalBackground = view.background)

    // Propagate the global layout direction if it is not being correctly set on the view and its
    // drawables
    if (!ReactNativeFeatureFlags.setAndroidLayoutDirection()) {
      compositeDrawable.layoutDirection =
          if (I18nUtil.instance.isRTL(view.context)) View.LAYOUT_DIRECTION_RTL
          else View.LAYOUT_DIRECTION_LTR
    }

    view.background = compositeDrawable
    return compositeDrawable
  }

  private fun getCompositeBackgroundDrawable(view: View): CompositeBackgroundDrawable? =
      view.background as? CompositeBackgroundDrawable

  private fun ensureCSSBackground(view: View): CSSBackgroundDrawable {
    val compositeBackgroundDrawable = ensureCompositeBackgroundDrawable(view)
    if (compositeBackgroundDrawable.cssBackground != null) {
      return compositeBackgroundDrawable.cssBackground
    } else {
      val cssBackground = CSSBackgroundDrawable(view.context)
      view.background = compositeBackgroundDrawable.withNewCssBackground(cssBackground)
      return cssBackground
    }
  }

  private fun getCSSBackground(view: View): CSSBackgroundDrawable? =
      getCompositeBackgroundDrawable(view)?.cssBackground
}
