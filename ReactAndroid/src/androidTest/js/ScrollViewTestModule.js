/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

var BatchedBridge = require('BatchedBridge');
var React = require('React');
var View = require('View');
var ScrollView = require('ScrollView');
var Text = require('Text');
var StyleSheet = require('StyleSheet');
var TouchableWithoutFeedback = require('TouchableWithoutFeedback');
var ScrollListener = require('NativeModules').ScrollListener;

var NUM_ITEMS = 100;

// Shared by integration tests for ScrollView and HorizontalScrollView

var scrollViewApp;

class Item extends React.Component {
  render() {
    return (
      <TouchableWithoutFeedback onPress={this.props.onPress}>
        <View style={styles.item_container}>
          <Text style={styles.item_text}>{this.props.text}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

var getInitialState = function() {
  var data = [];
  for (var i = 0; i < NUM_ITEMS; i++) {
    data[i] = {text: 'Item ' + i + '!'};
  }
  return {
    data: data,
  };
};

var onScroll = function(e) {
  ScrollListener.onScroll(
    e.nativeEvent.contentOffset.x,
    e.nativeEvent.contentOffset.y,
  );
};

var onScrollBeginDrag = function(e) {
  ScrollListener.onScrollBeginDrag(
    e.nativeEvent.contentOffset.x,
    e.nativeEvent.contentOffset.y,
  );
};

var onScrollEndDrag = function(e) {
  ScrollListener.onScrollEndDrag(
    e.nativeEvent.contentOffset.x,
    e.nativeEvent.contentOffset.y,
  );
};

var onItemPress = function(itemNumber) {
  ScrollListener.onItemPress(itemNumber);
};

class ScrollViewTestApp extends React.Component ({
  constructor() {
    super();
    this.displayName = 'ScrollViewTestApp';
    this.state = getInitialState;
    this.onScroll = onScroll;
    this.onItemPress = onItemPress;
    this.onScrollBeginDrag = onScrollBeginDrag;
    this.onScrollEndDrag = onScrollEndDrag;
  }
  

  scrollTo: function(destX, destY) {
    this.refs.scrollView.scrollTo(destY, destX);
  }

  render () {
    scrollViewApp = this;
    var children = this.state.data.map((item, index) => (
      <Item
        key={index}
        text={item.text}
        onPress={this.onItemPress.bind(this, index)}
      />
    ));
    return (
      <ScrollView
        onScroll={this.onScroll}
        onScrollBeginDrag={this.onScrollBeginDrag}
        onScrollEndDrag={this.onScrollEndDrag}
        ref="scrollView">
        {children}
      </ScrollView>
    );
  }
})

class HorizontalScrollViewTestApp extends React.Component({
  constructor() {
    super();
    displayName: 'HorizontalScrollViewTestApp';
    this.getInitialState = getInitialState;
    this.onScroll = onScroll;
    this.onItemPress = onItemPress;
    this.state = Store.getInitialState();
  }

  scrollTo: function(destX, destY) {
    this.refs.scrollView.scrollTo(destY, destX);
  }

  render() {
    scrollViewApp = this;
    var children = this.state.data.map((item, index) => (
      <Item
        key={index}
        text={item.text}
        onPress={this.onItemPress.bind(this, index)}
      />
    ));
    return (
      <ScrollView horizontal={true} onScroll={this.onScroll} ref="scrollView">
        {children}
      </ScrollView>
    );
  }
})

var styles = StyleSheet.create({
  item_container: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  item_text: {
    flex: 1,
    fontSize: 18,
    alignSelf: 'center',
  },
});

var ScrollViewTestModule = {
  ScrollViewTestApp: ScrollViewTestApp,
  HorizontalScrollViewTestApp: HorizontalScrollViewTestApp,
  scrollTo: function(destX, destY) {
    scrollViewApp.scrollTo(destX, destY);
  },
};

BatchedBridge.registerCallableModule(
  'ScrollViewTestModule',
  ScrollViewTestModule,
);

module.exports = ScrollViewTestModule;
