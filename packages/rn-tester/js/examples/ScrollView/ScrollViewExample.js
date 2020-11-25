/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('react');

const {
  Platform,
  ScrollView,
  Picker,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
} = require('react-native');

const nullthrows = require('nullthrows');

import {useState, useCallback} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

exports.displayName = 'ScrollViewExample';
exports.title = 'ScrollView';
exports.documentationURL = 'https://reactnative.dev/docs/scrollview';
exports.category = 'Basic';
exports.description =
  'Component that enables scrolling through child components';
exports.examples = [
  {
    title: '<ScrollView>\n',
    description:
      'To make content scrollable, wrap it within a <ScrollView> component',
    render: function(): React.Node {
      let _scrollView: ?React.ElementRef<typeof ScrollView>;
      return (
        <View>
          <ScrollView
            ref={scrollView => {
              _scrollView = scrollView;
            }}
            automaticallyAdjustContentInsets={false}
            onScroll={() => {
              console.log('onScroll!');
            }}
            scrollEventThrottle={200}
            style={styles.scrollView}>
            {ITEMS.map(createItemRow)}
          </ScrollView>
          <Button
            label="Scroll to top"
            onPress={() => {
              nullthrows(_scrollView).scrollTo({y: 0});
            }}
          />
          <Button
            label="Scroll to bottom"
            onPress={() => {
              nullthrows(_scrollView).scrollToEnd({animated: true});
            }}
          />
          <Button
            label="Flash scroll indicators"
            onPress={() => {
              nullthrows(_scrollView).flashScrollIndicators();
            }}
          />
        </View>
      );
    },
  },
  {
    title: '<ScrollView> (horizontal = true)\n',
    description:
      "You can display <ScrollView>'s child components horizontally rather than vertically",
    render: function(): React.Node {
      function renderScrollView(
        title: string,
        additionalStyles: ViewStyleProp,
      ) {
        let _scrollView: ?React.ElementRef<typeof ScrollView>;
        return (
          <View style={additionalStyles}>
            <Text style={styles.text}>{title}</Text>
            <ScrollView
              ref={scrollView => {
                _scrollView = scrollView;
              }}
              automaticallyAdjustContentInsets={false}
              horizontal={true}
              style={[styles.scrollView, styles.horizontalScrollView]}>
              {ITEMS.map(createItemRow)}
            </ScrollView>
            <Button
              label="Scroll to start"
              onPress={() => {
                nullthrows(_scrollView).scrollTo({x: 0});
              }}
            />
            <Button
              label="Scroll to end"
              onPress={() => {
                nullthrows(_scrollView).scrollToEnd({animated: true});
              }}
            />
            <Button
              label="Flash scroll indicators"
              onPress={() => {
                nullthrows(_scrollView).flashScrollIndicators();
              }}
            />
          </View>
        );
      }

      return (
        <View>
          {renderScrollView('LTR layout', {direction: 'ltr'})}
          {renderScrollView('RTL layout', {direction: 'rtl'})}
        </View>
      );
    },
  },
  {
    title: '<ScrollView> enable & disable\n',
    description: 'ScrollView scrolling behaviour can be disabled and enabled',
    render: function(): React.Node {
      class EnableDisableList extends React.Component<{...}, *> {
        state = {
          scrollEnabled: true,
        };
        render() {
          return (
            <View>
              <ScrollView
                automaticallyAdjustContentInsets={false}
                style={styles.scrollView}
                scrollEnabled={this.state.scrollEnabled}>
                {ITEMS.map(createItemRow)}
              </ScrollView>
              <Text>
                {'Scrolling enabled = ' + this.state.scrollEnabled.toString()}
              </Text>
              <Button
                label="Disable Scrolling"
                onPress={() => {
                  this.setState({scrollEnabled: false});
                }}
              />
              <Button
                label="Enable Scrolling"
                onPress={() => {
                  this.setState({scrollEnabled: true});
                }}
              />
            </View>
          );
        }
      }
      return <EnableDisableList />;
    },
  },
  {
    title: '<ScrollView> Content\n',
    description: 'Adjust properties of content inside ScrollView.',
    render: function(): React.Node {
      return <ContentExample />;
    },
  },
  {
    title: '<ScrollView> Deceleration Rate\n',
    description:
      'Determines how quickly the scroll view decelerates after the user lifts their finger.',
    render: function(): React.Node {
      return <DecelerationRateExample />;
    },
  },
  {
    title: '<ScrollView> Enable & Disable Scrolling Behavior\n',
    description:
      'DirectionalLockEnabled (iOS), disableIntervalMomentum, disableScrollViewPanResponder can be enabled or disabled.',
    render: function(): React.Node {
      return <DisableEnable />;
    },
  },
  {
    title: '<ScrollView> Invert Sticky Headers\n',
    description:
      'If sticky headers should stick at the bottom instead of the top of the ScrollView. This is usually used with inverted ScrollViews.',
    render: function(): React.Node {
      return <InvertStickyHeaders />;
    },
  },
  {
    title: '<ScrollView> Keyboard Options\n',
    description:
      'Toggle the keyboard using the search bar and determine keyboard behavior in response to drag and tap.',
    render: function(): React.Node {
      return <KeyboardExample />;
    },
  },
  {
    title: '<ScrollView> OnContentSizeChange\n',
    description:
      'The text below will change when scrollable content view of the ScrollView changes.',
    render: function(): React.Node {
      return <OnContentSizeChange />;
    },
  },
  {
    title: '<ScrollView> OnMomentumScroll\n',
    description:
      'An alert will be called when the momentum scroll starts or ends.',
    render: function(): React.Node {
      return <OnMomentumScroll />;
    },
  },
  {
    title: '<ScrollView> OnScroll Options\n',
    description:
      'Change the behavior of onScroll using these options: onScrollBeginDrag, onScrollEndDrag, onScrollToTop (iOS), and overScrollMode (Android).',
    render: function(): React.Node {
      return <OnScrollOptions />;
    },
  },
  {
    title: '<ScrollView> RefreshControl\n',
    description: 'Pull down to see RefreshControl indicator.',
    render: function(): React.Node {
      return <RefreshControlExample />;
    },
  },
  {
    title: '<ScrollView> Remove Clipped Subviews\n',
    description:
      'When true, offscreen child views (whose overflow value is hidden) are removed from their native backing superview when offscreen.',
    render: function(): React.Node {
      return <RemoveClippedSubviews />;
    },
  },
  {
    title: '<ScrollView> Scroll Indicator\n',
    description: 'Adjust properties of the scroll indicator.',
    render: function(): React.Node {
      return <ScrollIndicatorExample />;
    },
  },
  {
    title: '<ScrollView> SnapTo Options\n',
    description: 'Adjust properties of snapping to the scroll view.',
    render: function(): React.Node {
      return <SnapToOptions />;
    },
  },
];
if (Platform.OS === 'ios') {
  exports.examples.push({
    title: '<ScrollView> smooth bi-directional content loading\n',
    description:
      'The `maintainVisibleContentPosition` prop allows insertions to either end of the content ' +
      'without causing the visible content to jump. Re-ordering is not supported.',
    render: function() {
      let itemCount = 6;
      class AppendingList extends React.Component<{...}, *> {
        state = {
          /* $FlowFixMe(>=0.85.0 site=react_native_fb) This comment suppresses
           * an error found when Flow v0.85 was deployed. To see the error,
           * delete this comment and run Flow. */
          items: [...Array(itemCount)].map((_, ii) => (
            <Item msg={`Item ${ii}`} />
          )),
        };
        render() {
          return (
            <View>
              <ScrollView
                automaticallyAdjustContentInsets={false}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 1,
                  autoscrollToTopThreshold: 10,
                }}
                style={styles.scrollView}>
                {this.state.items.map(item =>
                  React.cloneElement(item, {key: item.props.msg}),
                )}
              </ScrollView>
              <ScrollView
                horizontal={true}
                automaticallyAdjustContentInsets={false}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 1,
                  autoscrollToTopThreshold: 10,
                }}
                style={[styles.scrollView, styles.horizontalScrollView]}>
                {this.state.items.map(item =>
                  React.cloneElement(item, {key: item.props.msg, style: null}),
                )}
              </ScrollView>
              <View style={styles.row}>
                <Button
                  label="Add to top"
                  onPress={() => {
                    this.setState(state => {
                      const idx = itemCount++;
                      return {
                        items: [
                          <Item
                            style={{paddingTop: idx * 5}}
                            msg={`Item ${idx}`}
                          />,
                        ].concat(state.items),
                      };
                    });
                  }}
                />
                <Button
                  label="Remove top"
                  onPress={() => {
                    this.setState(state => ({
                      items: state.items.slice(1),
                    }));
                  }}
                />
                <Button
                  label="Change height top"
                  onPress={() => {
                    this.setState(state => ({
                      items: [
                        React.cloneElement(state.items[0], {
                          style: {paddingBottom: Math.random() * 40},
                        }),
                      ].concat(state.items.slice(1)),
                    }));
                  }}
                />
              </View>
              <View style={styles.row}>
                <Button
                  label="Add to end"
                  onPress={() => {
                    this.setState(state => ({
                      items: state.items.concat(
                        <Item msg={`Item ${itemCount++}`} />,
                      ),
                    }));
                  }}
                />
                <Button
                  label="Remove end"
                  onPress={() => {
                    this.setState(state => ({
                      items: state.items.slice(0, -1),
                    }));
                  }}
                />
                <Button
                  label="Change height end"
                  onPress={() => {
                    this.setState(state => ({
                      items: state.items.slice(0, -1).concat(
                        React.cloneElement(
                          state.items[state.items.length - 1],
                          {
                            style: {paddingBottom: Math.random() * 40},
                          },
                        ),
                      ),
                    }));
                  }}
                />
              </View>
            </View>
          );
        }
      }
      return <AppendingList />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> (centerContent = true)\n',
    description:
      'ScrollView puts its content in the center if the content is smaller than scroll view',
    render: function(): React.Node {
      function CenterContentList(): React.Node {
        return (
          <ScrollView style={styles.scrollView} centerContent={true}>
            <Text>This should be in center.</Text>
          </ScrollView>
        );
      }
      return <CenterContentList />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> (contentOffset = {x: 100, y: 0})\n',
    description: 'Initial contentOffset can be set on ScrollView.',
    render: function(): React.Node {
      function CenterContentList(): React.Node {
        return (
          <ScrollView
            style={[styles.scrollView, {height: 100}]}
            horizontal={true}
            contentOffset={{x: 100, y: 0}}>
            {ITEMS.map(createItemRow)}
          </ScrollView>
        );
      }
      return <CenterContentList />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> Always Bounces\n',
    description: 'Always bounce vertically or horizontally.',
    render: function(): React.Node {
      return (
        <>
          <Text style={styles.text}>Vertical</Text>
          <BouncesExampleVertical />
          <Text style={styles.text}>Horizontal</Text>
          <BouncesExampleHorizontal />
        </>
      );
    },
  });
  exports.examples.push({
    title: '<ScrollView> Bounces & Bounces Zoom\n',
    description: 'There are different options for bouncing behavior.',
    render: function(): React.Node {
      return <BouncesExample />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> Indicator Style\n',
    description: 'There are different options for indicator style colors.',
    render: function(): React.Node {
      return <IndicatorStyle />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> Maximum & Minimum Zoom Scale\n',
    description: 'Set the maximum and minimum allowed zoom scale.',
    render: function(): React.Node {
      return <MaxMinZoomScale />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> Maximum & Minimum Zoom Scale\n',
    description: 'Set the maximum and minimum allowed zoom scale.',
    render: function(): React.Node {
      return <MaxMinZoomScale />;
    },
  });
  exports.examples.push({
    title: '<ScrollView> ScrollTo Options\n',
    description:
      'Toggle scrollToOverflowEnabled and scrollsToTop. When scrollToOverflowEnabled is true, the scroll view can be programmatically scrolled beyond its content size. When scrollsToTop is true, the scroll view scrolls to top when the status bar is tapped.',
    render: function(): React.Node {
      return <ScrollToOptions />;
    },
  });
} else {
  exports.examples.push({
    title: '<ScrollView> EndFillColor & FadingEdgeLength\n',
    description: 'Toggle to set endFillColor and fadingEdgeLength.',
    render: function(): React.Node {
      return <EndFillColorFadingEdgeLen />;
    },
  });
}

const AndroidScrollBarOptions = () => {
  const [persistentScrollBar, setPersistentScrollBar] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        persistentScrollbar={persistentScrollBar}>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        label={'persistentScrollBar: ' + persistentScrollBar.toString()}
        onPress={() => setPersistentScrollBar(!persistentScrollBar)}
      />
    </View>
  );
};

const EndFillColorFadingEdgeLen = () => {
  const [endFillColor, setEndFillColor] = useState('');
  const [fadingEdgeLen, setFadingEdgeLen] = useState(0);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        endFillColor={endFillColor}
        fadingEdgeLength={fadingEdgeLen}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        label={endFillColor === '' ? 'setEndFillColor' : 'resetEndFillColor'}
        onPress={() =>
          endFillColor === '' ? setEndFillColor('#A9DFD0') : setEndFillColor('')
        }
      />
      <Button
        label={fadingEdgeLen === 0 ? 'setFadingEdgeLen' : 'resetFadingEdgeLen'}
        onPress={() =>
          fadingEdgeLen === 0 ? setFadingEdgeLen(300) : setFadingEdgeLen(0)
        }
      />
    </View>
  );
};

const SnapToOptions = () => {
  const [snapToAlignment, setSnapToAlignment] = useState("start");
  const snapToAlignmentModes = ["start", "center", "end"];
  const [snapToEnd, setSnapToEnd] = useState(true);
  const [snapToInterval, setSnapToInterval] = useState(0);
  const [snapToOffsets, setSnapToOffsets] = useState([]);
  const [snapToStart, setSnapToStart] = useState(true);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        snapToAlignment={snapToAlignment}
        snapToEnd={snapToEnd}
        snapToInterval={snapToInterval}
        snapToOffsets={snapToOffsets}
        snapToStart={snapToStart}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      {Platform.OS === 'ios' ? (
        <>
          <Text style={styles.rowTitle}>Snap to Alignment Mode</Text>
          <Picker
            selectedValue={snapToAlignment}
            onValueChange={value => setSnapToAlignment(value)}
            itemStyle={styles.pickerItem}>
            {snapToAlignmentModes.map(label => {
              return <Picker.Item label={label} value={label} key={label} />;
            })}
          </Picker>
        </>
      ) : null}
      <Button
        label={'snapToEnd: ' + snapToEnd.toString()}
        onPress={() => setSnapToEnd(!snapToEnd)}
      />
      <Button
        label={'snapToStart: ' + snapToStart.toString()}
        onPress={() => setSnapToStart(!snapToStart)}
      />
      <Button
        label={
          snapToInterval === 0 ? 'setSnapToInterval' : 'reset snapToInterval'
        }
        onPress={() =>
          snapToInterval === 0 ? setSnapToInterval(2) : setSnapToInterval(0)
        }
      />
      <Button
        label={
          snapToOffsets === [] ? 'setSnapToOffsets' : 'reset snapToOffsets'
        }
        onPress={() =>
          snapToOffsets === []
            ? setSnapToOffsets([2, 4, 6, 8, 10])
            : setSnapToOffsets([])
        }
      />
    </View>
  );
};

const ScrollToOptions = () => {
  const [scrollToOverflowEnabled, setScrollToOverflowEnabled] = useState(false);
  const [scrollsToTop, setScrollsToTop] = useState(true);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        scrollToOverflowEnabled={scrollToOverflowEnabled}
        scrollsToTop={scrollsToTop}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        label={'scrollToOverflowEnabled: ' + scrollToOverflowEnabled.toString()}
        onPress={() => setScrollToOverflowEnabled(!scrollToOverflowEnabled)}
      />
      <Button
        label={'scrollsToTop: ' + scrollsToTop.toString()}
        onPress={() => setScrollsToTop(!scrollsToTop)}
      />
    </View>
  );
};

const ScrollIndicatorExample = () => {
  const [scrollIndicatorInsets, setScrollIndicatorInsets] = useState(null);
  const [showsHorizontalScrollIndic, setShowsHorizontalScrollIndic] = useState(
    true,
  );
  const [showsVerticallScrollIndic, setShowsVerticalScrollIndic] = useState(
    true,
  );
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        contentInset={{top: 10, bottom: 10, left: 10, right: 10}}
        scrollIndicatorInsets={scrollIndicatorInsets}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndic}
        showsVerticalScrollIndicator={showsVerticallScrollIndic}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        label={
          scrollIndicatorInsets == null
            ? 'setScrollIndicatorInsets'
            : 'Reset scrollIndicatorInsets'
        }
        onPress={() =>
          scrollIndicatorInsets == null
            ? setScrollIndicatorInsets({
                top: 10,
                left: 10,
                bottom: 10,
                right: 10,
              })
            : setScrollIndicatorInsets(null)
        }
      />
      <Button
        label={'showsHorizontalScrollIndicator: ' + showsHorizontalScrollIndic.toString()}
        onPress={() =>
          setShowsHorizontalScrollIndic(!showsHorizontalScrollIndic)
        }
      />
      <Button
        label={'showsVerticalScrollIndicator: ' + showsVerticallScrollIndic.toString()}
        onPress={() => setShowsVerticalScrollIndic(!showsVerticallScrollIndic)}
      />
    </View>
  );
};

const RemoveClippedSubviews = () => {
  const [removeClippedSubviews, setRemoveClippedSubviews] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        removeClippedSubviews={setRemoveClippedSubviews}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        label={'removeClippedSubviews: ' + removeClippedSubviews.toString()}
        onPress={() => setRemoveClippedSubviews(!removeClippedSubviews)}
      />
    </View>
  );
};

const RefreshControlExample = () => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  };

  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
    </View>
  );
};

const OnScrollOptions = () => {
  const [onScrollDrag, setOnScrollDrag] = useState('none');
  const [overScrollMode, setOverScrollMode] = useState('auto');
  const overScrollModeOptions = ['auto', 'always', 'never'];
  return (
    <View>
      <Text>onScroll: {onScrollDrag}</Text>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        onScrollBeginDrag={() => setOnScrollDrag('onScrollBeginDrag')}
        onScrollEndDrag={() => setOnScrollDrag('onScrollEndDrag')}
        onScrollToTop={() => setOnScrollDrag('onScrollToTop')}
        overScrollMode={overScrollMode}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      {Platform.OS === 'android' ?
        <>
          <Text style={styles.rowTitle}>Over Scroll Mode</Text>
          <Picker
            selectedValue={overScrollMode}
            onValueChange={value => setOverScrollMode(value)}
            itemStyle={styles.pickerItem}>
            {overScrollModeOptions.map(label => {
              return <Picker.Item label={label} value={label} key={label} />;
            })}
          </Picker>
        </>
      : null}
    </View>
  );
};

const OnMomentumScroll = () => {
  const [scroll, setScroll] = useState('none');
  return (
    <View>
      <Text>Scroll State: {scroll}</Text>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        onMomentumScrollBegin={() => setScroll('onMomentumScrollBegin')}
        onMomentumScrollEnd={() => setScroll('onMomentumScrollEnd')}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
    </View>
  );
};

const OnContentSizeChange = () => {
  const [items, setItems] = useState(ITEMS);
  const [contentSizeChanged, setContentSizeChanged] = useState('original');
  return (
    <View>
      <Text>Content Size Changed: {contentSizeChanged}</Text>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        onContentSizeChange={() =>
          contentSizeChanged === 'original'
            ? setContentSizeChanged('changed')
            : setContentSizeChanged('original')
        }
        nestedScrollEnabled>
        {items.map(createItemRow)}
      </ScrollView>
      <Button
        label="Change Content Size"
        onPress={() =>
          items === ITEMS ? setItems([1, 2, 3, 4, 5]) : setItems(ITEMS)
        }
      />
    </View>
  );
};

const MaxMinZoomScale = () => {
  const [maxZoomScale, setMaxZoomScale] = useState('1.0');
  const [minZoomScale, setMinZoomScale] = useState('1.0');
  const [zoomScale, setZoomScale] = useState('1.0');
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        pinchGestureEnabled
        maximumZoomScale={maxZoomScale !== '' ? parseFloat(maxZoomScale) : 0.0}
        minimumZoomScale={minZoomScale !== '' ? parseFloat(minZoomScale) : 0.0}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Text style={styles.rowTitle}>Set Maximum Zoom Scale</Text>
      <TextInput
        style={styles.textInput}
        value={maxZoomScale}
        onChangeText={val => setMaxZoomScale(val)}
        keyboardType="decimal-pad"
      />
      <Text style={styles.rowTitle}>Set Minimum Zoom Scale</Text>
      <TextInput
        style={styles.textInput}
        value={minZoomScale.toString()}
        onChangeText={val => setMinZoomScale(val)}
        keyboardType="decimal-pad"
      />
      {Platform.OS === 'ios' ? (
        <>
          <Text style={styles.rowTitle}>Set Zoom Scale</Text>
          <TextInput
            style={styles.textInput}
            value={zoomScale.toString()}
            onChangeText={val => setZoomScale(val)}
            keyboardType="decimal-pad"
          />
        </>
      ) : null}
    </View>
  );
};

const KeyboardExample = () => {
  const [keyboardDismissMode, setKeyboardDismissMode] = useState("none");
  const [keyboardShouldPersistTaps, setKeyboardShouldPersistTaps] = useState(
    "never",
  );
  const dismissOptions =
    Platform.OS === 'ios'
      ? ["none", "on-drag", "interactive"]
      : ["none", "on-drag"];
  const persistOptions = ["never", "always", "handled"];
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Text style={styles.rowTitle}>Keyboard Dismiss Mode</Text>
      <Picker
        selectedValue={keyboardDismissMode}
        onValueChange={value => setKeyboardDismissMode(value)}
        itemStyle={styles.pickerItem}>
        {dismissOptions.map(label => {
          return <Picker.Item label={label} value={label} key={label} />;
        })}
      </Picker>
      <Text style={styles.rowTitle}>Keyboard Should Persist taps</Text>
      <Picker
        selectedValue={keyboardShouldPersistTaps}
        onValueChange={value => setKeyboardShouldPersistTaps(value)}
        itemStyle={styles.pickerItem}>
        {persistOptions.map(label => {
          return <Picker.Item label={label} value={label} key={label} />;
        })}
      </Picker>
    </View>
  );
};

const InvertStickyHeaders = () => {
  const [invertStickyHeaders, setInvertStickyHeaders] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        stickyHeaderIndices={[0]}
        invertStickyHeaders={invertStickyHeaders}
        nestedScrollEnabled>
        {<Text>STICKY HEADER</Text>}
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() => setInvertStickyHeaders(!invertStickyHeaders)}
        label={'invertStickyHeaders: ' + invertStickyHeaders.toString()}
      />
    </View>
  );
};

const IndicatorStyle = () => {
  const [indicatorStyle, setIndicatorStyle] = useState('default');
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        indicatorStyle={indicatorStyle}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() =>
          indicatorStyle === 'default'
            ? setIndicatorStyle('white')
            : setIndicatorStyle('default')
        }
        label={'Indicator Style: ' + indicatorStyle}
      />
    </View>
  );
};

const DisableEnable = () => {
  const [directionalLockEnabled, setDirectionalLockEnabled] = useState(false);
  const [disableIntervalMomentum, setDisableIntervalMomentum] = useState(false);
  const [
    disableScrollViewPanResponder,
    setDisableScrollViewPanResponder,
  ] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        contentInset={{top: 10, bottom: 10, left: 10, right: 10}}
        snapToInterval={0}
        directionalLockEnabled={directionalLockEnabled}
        disableIntervalMomentum={disableIntervalMomentum}
        disableScrollViewPanResponder={disableScrollViewPanResponder}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      {Platform.OS === 'ios' ?
        <Button
          onPress={() => setDirectionalLockEnabled(!directionalLockEnabled)}
          label={'directionalLockEnabled: ' + directionalLockEnabled.toString()}
        />
       : null}
      <Button
        onPress={() => setDisableIntervalMomentum(!disableIntervalMomentum)}
        label={'setDisableIntervalMomentum: ' + disableIntervalMomentum.toString()}
      />
      <Button
        onPress={() =>
          setDisableScrollViewPanResponder(!disableScrollViewPanResponder)
        }
        label={'setDisableScrollViewPanResponder: ' + disableScrollViewPanResponder.toString()}
      />
    </View>
  );
};

const DecelerationRateExample = () => {
  const [decelRate, setDecelRate] = useState('normal');
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        decelerationRate={decelRate}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() =>
          decelRate === 'normal' ? setDecelRate('fast') : setDecelRate('normal')
        }
        label={'Deceleration Rate: ' + decelRate}
      />
    </View>
  );
};

const ContentExample = () => {
  const [canCancelContentTouches, setCanCancelContentTouches] = useState(false);
  const [contentInset, setContentInset] = useState(null);
  const [contentContainerStyle, setContentContainerStyle] = useState(null);
  const [
    contentInsetAdjustmentBehavior,
    setContentInsetAdjustmentBehavior,
  ] = useState('never');
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        canCancelContentTouches={canCancelContentTouches}
        contentOffset={{x: 100, y: 0}}
        contentContainerStyle={contentContainerStyle}
        contentInset={contentInset}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      {Platform.OS === 'ios' ?
        <>
          <Button
            onPress={() => setCanCancelContentTouches(!canCancelContentTouches)}
            label={'canCancelContentTouches: ' + canCancelContentTouches}
          />
          <Button
            onPress={() =>
              contentInsetAdjustmentBehavior === 'never'
                ? setContentInsetAdjustmentBehavior('always')
                : setContentInsetAdjustmentBehavior('never')
            }
            label={
              contentInsetAdjustmentBehavior === 'never'
                ? "setContentInsetAdjustmentBehavior to 'always'"
                : 'reset content inset adjustment behavior'
            }
          />
        </>
      : null
      }
      <Button
        onPress={() =>
          contentContainerStyle === null
            ? setContentContainerStyle(styles.containerStyle)
            : setContentContainerStyle(null)
        }
        label={
          contentContainerStyle === null
            ? 'setContentContainerStyle'
            : 'reset content container style'
        }
      />
      <Button
        onPress={() =>
          contentInset === null
            ? setContentInset({top: 10, bottom: 10, left: 10, right: 10})
            : setContentInset(null)
        }
        label={
          contentInset === null ? 'setContentInset' : 'reset content inset'
        }
      />
    </View>
  );
};

const BouncesExample = () => {
  const [bounces, setBounces] = useState(false);
  const [bouncesZoom, setBouncesZoom] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        bounces={bounces}
        bouncesZoom={bouncesZoom}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() => setBounces(!bounces)}
        label={'Bounces: ' + bounces}
      />
      <Button
        onPress={() => setBouncesZoom(!bouncesZoom)}
        label={'Bounces Zoom: ' + bouncesZoom}
      />
    </View>
  );
};

const BouncesExampleHorizontal = () => {
  const [bounce, setBounce] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        horizontal={true}
        alwaysBounceHorizontal={bounce}
        contentOffset={{x: 100, y: 0}}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() => setBounce(!bounce)}
        label={'Always Bounce Horizontal: ' + bounce}
      />
    </View>
  );
};

const BouncesExampleVertical = () => {
  const [bounce, setBounce] = useState(false);
  return (
    <View>
      <ScrollView
        style={[styles.scrollView, {height: 200}]}
        alwaysBounceVertical={bounce}
        contentOffset={{x: 100, y: 0}}
        nestedScrollEnabled>
        {ITEMS.map(createItemRow)}
      </ScrollView>
      <Button
        onPress={() => setBounce(!bounce)}
        label={'Always Bounce Vertical: ' + bounce}
      />
    </View>
  );
};

class Item extends React.PureComponent<{|
  msg?: string,
  style?: ViewStyleProp,
|}> {
  render() {
    return (
      <View style={[styles.item, this.props.style]}>
        <Text>{this.props.msg}</Text>
      </View>
    );
  }
}

let ITEMS = [...Array(12)].map((_, i) => `Item ${i}`);

const createItemRow = (msg, index) => <Item key={index} msg={msg} />;

const Button = ({label, onPress}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#eeeeee',
    height: 300,
  },
  horizontalScrollView: {
    height: 106,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 5,
  },
  button: {
    margin: 5,
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#cccccc',
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    margin: 5,
    padding: 5,
    backgroundColor: '#cccccc',
    borderRadius: 3,
    minWidth: 96,
  },
  containerStyle: {
    backgroundColor: '#aae3b6',
  },
  pickerItem: {
    fontSize: 16,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
});
