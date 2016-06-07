import {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  Image,
  TouchableHighlight,
  ScrollView,
  View
} from 'react-native';

import React, {
  Component,
} from 'react';

import SearchBar from 'react-native-search-bar';

import Menu from './menu';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      buildings: new ListView.DataSource({
        rowHasChanged: (a, b) => a.id ? a.id !== b.id : a !== b
      })
    };
  }
  
  render() {
    return (
      <View style={{marginTop: 64, flex: 1}}>
        <SearchBar
          ref="searchBar"
          placeholder="搜索"
          onChangeText={this.onSearchBuildings.bind(this)}
        />
        <ListView
          style={{marginTop: -64}}
          dataSource={this.state.buildings}
          renderRow={building => (
            <TouchableHighlight
              key={building.id}
              onPress={()=> this.gotoMenu(building)}
              style={{padding: 8}}>
              <Text>{building.name}</Text>
            </TouchableHighlight>
          )}
          renderSeparator={() => <View style={{height: 1, backgroundColor: '#ccc'}} />}
        />
      </View>
    )
  }
  
  gotoMenu(building) {
    this.props.navigator.push({
      title: building.name,
      name: 'menu',
      component: Menu,
      passProps: {
        building
      }
    })
  }

  componentDidMount() {
    this.refs.searchBar.focus();

  }

  onSearchBuildings(name) {
    fetch(`http://zaocan.ele.me/api/building/search?cityId=${1}&name=${encodeURIComponent(name)}`, {
      header: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => this.setState({
      buildings: this.state.buildings.cloneWithRows(result.data)
    }));
  }
}

export default Home;
