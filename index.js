/**
 * Eleme-Breakfast
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  Component
} from 'react';

import  {
  AppRegistry,
  NavigatorIOS,
} from 'react-native';

import Home from './pages/home';

AppRegistry.registerComponent('breakfast', () => (
  class Application extends Component {
    render() {
      return (
        <NavigatorIOS
          style={{ flex: 1 }}
          initialRoute={{
            title: '楼宇选择',
            name: 'home',
            component: Home,
          }}
        />
      )
    }
  }
));
