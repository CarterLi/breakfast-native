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

import dateFormat from 'dateformat';

function notEqual(a, b) {
  return a.id ? a.id !== b.id : a !== b;
}

function isSameWeek(date1, date2) {
  date1 = new Date(date1);
  date2 = new Date(date2);

  date1.setHours(-(date1.getDay() || 7) * 24, 0, 0, 0);
  date2.setHours(-(date2.getDay() || 7) * 24, 0, 0, 0);

  return +date1 === +date2;
}

function isSameDate(date1, date2) {
  date1 = new Date(date1);
  date2 = new Date(date2);

  return date1.getYear() === date2.getYear()
      && date1.getMonth() === date2.getMonth()
      && date1.getDate() === date2.getDate();
}

const styles = StyleSheet.create({
  textCenter: {
    textAlign: 'center'
  },
  welcome: {
    fontSize: 20,
    margin: 10,
  },
  listViewLeft: {
    flex: 0,
    width: 75
  },
  listView: {
    top: 44 + 20,
    flexDirection: 'column',
    flex: 1,
  },
  mainView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5FCFF',
  }
});

class Breakfast extends Component {
  constructor() {
    super();
    this.state = {
      menus: new ListView.DataSource({
        rowHasChanged: notEqual,
        sectionHeaderHasChanged: notEqual,
        getSectionHeaderData: (menus, sectionId) => !Number(sectionId) ? '本周' : '下周'
      }),
      menuLists: new ListView.DataSource({
        rowHasChanged: notEqual,
        sectionHeaderHasChanged: notEqual,
        getSectionHeaderData: (menus, sectionId) => menus[sectionId],
        getRowData: (menus, sectionId, rowId) => menus[sectionId].options[rowId]
      }),
      row: 0
    };
    this.initData();
  }

  render() {
    return (
      <View style={styles.mainView}>
        <ListView
          ref='leftScroller'
          dataSource={this.state.menus}
          renderRow={this.renderMenuDay.bind(this)}
          renderSectionHeader={x => (
            <Text style={{
              textAlign: 'center',
              padding: 5
            }}>
              {x}
            </Text>
          )}
          style={styles.listViewLeft} />
        <ListView
          ref='rightScroller'
          dataSource={this.state.menuLists}
          renderRow={this.renderMenuListOption.bind(this)}
          renderSectionHeader={this.renderMenuListHeader.bind(this)}
          renderSeparator={()=> <View style={{height: 1, backgroundColor: '#ccc'}}></View>}
          onChangeVisibleRows={this.onChangeVisibleRows.bind(this)}
          style={styles.listView} />
      </View>
    );
  }

  initData() {
    fetch('http://zaocan.ele.me/api/dishNew', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({buildingId: this.props.building.id, userId: 26002922})
    })
      .then(response => response.json())
      .then(result => {
        if (result.status !== 'SUCCESS') throw result.message;
        return result.data;
      })
      .then(data => {
        data.menus.forEach(menu => {
          menu.date = new Date(menu.date);
          menu.isNextWeek = !isSameWeek(data.currentTime, menu.date);
        });
        data.menus.sort((a, b) => +a.date - +b.date);
        return data;
      })
      .then(data => {
        const sections = {};
        data.menus.forEach(menu => {
          if (!sections.hasOwnProperty(+menu.isNextWeek)) {
            sections[+menu.isNextWeek] = [menu];
          } else {
            sections[+menu.isNextWeek].push(menu);
          }
        });
        this.setState({
          menus: this.state.menus.cloneWithRowsAndSections(sections),
          menuLists: this.state.menuLists.cloneWithRowsAndSections(data.menus, Object.keys(data.menus), data.menus.map(x => Object.keys(x.options)))
        })
      })
      .catch(e => alert(e));
  }

  renderMenuDay(menu, sectionId, rowId) {
    console.log(this.state.row);
    return (
      <TouchableHighlight key={+menu.date} onPress={this.scrollToMenu.bind(this, menu)}>
        <View style={{backgroundColor: this.state.row === sectionId ? 'yellow' : 'transparent'}}>
          <Text style={styles.textCenter}>{menu.day}</Text>
          <Text style={styles.textCenter}>{dateFormat(menu.date, 'mm-dd')}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  scrollToMenu(menu) {
    this.refs.rightScroller.scrollTo({y: 0});
  }

  onChangeVisibleRows(visibleRows, changedRows) {
    const row = Math.min(...Object.keys(visibleRows));
    this.setState({ row });
  }

  renderMenuListOption(option) {
    return (
      <View key={option.id} style={{
        flexDirection: 'row',
        padding: 10
      }}>
        <Image
          source={{uri: 'http:' + option.dishPictureUrl}}
          defaultSource={require('../assets/images/icon_no_image.png')}
          style={{
            width: 92,
            height: 92
          }}
          resizeMode={'contain'}
          onError={err => alert(option.dishPictureUrl)}
        />
        <View style={{marginLeft: 5, flexDirection: 'column', flex: 1}}>
          <Text style={{
            color: 'rgba(163,163,163,.95)',
            alignSelf: 'stretch',
            lineHeight: 14,
            height: 14,
            fontSize: 10
          }}>{option.restaurantName}</Text>
          <Text numberOfLines={5} style={{
            alignSelf: 'stretch',
            fontSize: 15,
            marginTop: 2,
          }}>{option.name}</Text>
          <View style={{flexDirection: 'row', marginTop: 10, flex: 1}}>
            <Text style={{color: 'red'}}>{`￥${option.discounted} ￥${option.price}`}</Text>
          </View>
        </View>
      </View>
    )
  }

  renderMenuListHeader(menu) {
    return (
      <View style={{alignSelf: "stretch", backgroundColor: '#F5FCFF', padding: 5}}>
        <Text>{menu.day + '  ' + dateFormat(menu.date, 'mm-dd')}</Text>
      </View>
    );
  }
}

export default Breakfast;
