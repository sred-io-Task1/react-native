/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "RCTWebView.h"

#import <UIKit/UIKit.h>

#import "RCTAutoInsetsProtocol.h"
#import "RCTEventDispatcher.h"
#import "RCTLog.h"
#import "RCTUtils.h"
#import "RCTView.h"
#import "UIView+React.h"

// Special scheme that allow JS to notify the WebView to emit
// navigation event.
//
// JavaScript Example:
//   window.location.href = 'react-js-navigation://hello'
NSString *const RCTJSNavigationScheme = @"react-js-navigation";

@interface RCTWebView () <UIWebViewDelegate, RCTAutoInsetsProtocol>

@end

@implementation RCTWebView
{
  RCTEventDispatcher *_eventDispatcher;
  UIWebView *_webView;
  NSString *_injectedJavaScript;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
  RCTAssertParam(eventDispatcher);

  if ((self = [super initWithFrame:CGRectZero])) {
    super.backgroundColor = [UIColor clearColor];
    _automaticallyAdjustContentInsets = YES;
    _contentInset = UIEdgeInsetsZero;
    _eventDispatcher = eventDispatcher;
    _schemes = @{ @"*": @YES };
    _webView = [[UIWebView alloc] initWithFrame:self.bounds];
    _webView.delegate = self;
    [self addSubview:_webView];
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-initWithFrame:(CGRect)frame)
RCT_NOT_IMPLEMENTED(-initWithCoder:(NSCoder *)aDecoder)

- (void)goForward
{
  [_webView goForward];
}

- (void)goBack
{
  [_webView goBack];
}

- (void)reload
{
  [_webView reload];
}

- (NSURL *)URL
{
  return _webView.request.URL;
}

- (void)setCacheEnabled:(BOOL)cacheEnabled
{
  if (!cacheEnabled) {
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
  }
}

- (void)setCookiesEnabled:(BOOL)cookiesEnabled
{
  if (!cookiesEnabled) {
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in storage.cookies) {
      [storage deleteCookie:cookie];
    }
    [[NSUserDefaults standardUserDefaults] synchronize];
  }
}

- (void)setURL:(NSURL *)URL
{
  // Because of the way React works, as pages redirect, we actually end up
  // passing the redirect urls back here, so we ignore them if trying to load
  // the same url. We'll expose a call to 'reload' to allow a user to load
  // the existing page.
  if ([URL isEqual:_webView.request.URL]) {
    return;
  }
  if (!URL) {
    // Clear the webview
    [_webView loadHTMLString:@"" baseURL:nil];
    return;
  }
  [_webView loadRequest:[NSURLRequest requestWithURL:URL]];
}

- (void)setHTML:(NSString *)HTML
{
  [_webView loadHTMLString:HTML baseURL:nil];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _webView.frame = self.bounds;
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:YES];
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
  _contentInset = contentInset;
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:NO];
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  CGFloat alpha = CGColorGetAlpha(backgroundColor.CGColor);
  self.opaque = _webView.opaque = (alpha == 1.0);
  _webView.backgroundColor = backgroundColor;
}

- (UIColor *)backgroundColor
{
  return _webView.backgroundColor;
}

- (NSMutableDictionary *)baseEvent
{
  NSURL *url = _webView.request.URL;
  NSString *title = [_webView stringByEvaluatingJavaScriptFromString:@"document.title"];
  NSMutableDictionary *event = [[NSMutableDictionary alloc] initWithDictionary: @{
    @"target": self.reactTag,
    @"url": url ? [url absoluteString] : @"",
    @"loading" : @(_webView.loading),
    @"title": title,
    @"canGoBack": @([_webView canGoBack]),
    @"canGoForward" : @([_webView canGoForward]),
  }];

  return event;
}

#pragma mark - UIWebViewDelegate methods


- (BOOL)webView:(__unused UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request
 navigationType:(UIWebViewNavigationType)navigationType
{
  // We have this check to filter out iframe requests and whatnot
  BOOL isTopFrame = [request.URL isEqual:request.mainDocumentURL];
  if (isTopFrame) {
    NSMutableDictionary *event = [self baseEvent];
    [event addEntriesFromDictionary: @{
      @"url": [request.URL absoluteString],
      @"navigationType": @(navigationType)
    }];
    [_eventDispatcher sendInputEventWithName:@"topLoadingStart" body:event];
  }
  
  NSString *scheme = request.URL.scheme;
  
  NSNumber *catchAllScheme;
  if (_schemes[@"*"] == nil) {
    catchAllScheme = @YES;
  }
  else {
    catchAllScheme = _schemes[@"*"];
  }
  
  NSNumber *schemeInSchemes = _schemes[scheme];
  
  if ((schemeInSchemes != nil && ![schemeInSchemes boolValue])
      || (schemeInSchemes == nil && ![catchAllScheme boolValue])) {
    return NO;
  }

  // JS Navigation handler
  return ![scheme isEqualToString:RCTJSNavigationScheme];
}

- (void)webView:(__unused UIWebView *)webView didFailLoadWithError:(NSError *)error
{
  if ([error.domain isEqualToString:NSURLErrorDomain] && error.code == NSURLErrorCancelled) {
    // NSURLErrorCancelled is reported when a page has a redirect OR if you load
    // a new URL in the WebView before the previous one came back. We can just
    // ignore these since they aren't real errors.
    // http://stackoverflow.com/questions/1024748/how-do-i-fix-nsurlerrordomain-error-999-in-iphone-3-0-os
    return;
  }

  NSMutableDictionary *event = [self baseEvent];
  [event addEntriesFromDictionary: @{
    @"domain": error.domain,
    @"code": @(error.code),
    @"description": [error localizedDescription],
  }];
  [_eventDispatcher sendInputEventWithName:@"topLoadingError" body:event];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
  if (_injectedJavaScript != nil) {
    [webView stringByEvaluatingJavaScriptFromString:_injectedJavaScript];
  }

  // we only need the final 'finishLoad' call so only fire the event when we're actually done loading.
  if (!webView.loading && ![webView.request.URL.absoluteString isEqualToString:@"about:blank"]) {
    [_eventDispatcher sendInputEventWithName:@"topLoadingFinish" body:[self baseEvent]];
  }
}

@end
