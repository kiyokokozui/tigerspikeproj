import React, {Component} from 'react';

import {
  Button,
  Dimensions,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import database from '@react-native-firebase/database';
import MapView, {Marker} from 'react-native-maps';
import styles from './Style';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';

navigator.geolocation = require('@react-native-community/geolocation');

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
      notes: 'Note here',
      markers: [],
      isLoading: true,
      loadSignOut: false,
    };
  }

  getAllUsers() {
    //GET ALL USERS FROM FIREBASE
    database()
      .ref('users')
      .once('value')
      .then((res) => {
        this.setState({markers: res.val()});
      });
  }

  getUserPosition() {
    //GET USER CURRENT LOCATION FROM GEO LOCATION
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
          isLoading: false,
        });
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }

  updateUserData(userid) {
    //CALL FIREBASE TO UPDATE USER DATA
    database()
      .ref('users/' + userid)
      .update({
        notes: this.state.notes,
        location: {
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: this.state.latitudeDelta,
          longitudeDelta: this.state.longitudeDelta,
        },
      })
      .then(() => console.log('Data updated.'));
  }

  signOut() {
    this.setState({isLoading: true});
    try {
      auth()
        .signOut()
        .then(() => {
          this.setState({isLoading: false});
        });
      this.props.navigation.navigate('Login');
    } catch (e) {
      console.log(e);
    }
  }

  componentDidMount() {
    this.getAllUsers();
    this.getUserPosition();
  }

  updateLocation() {
    this.setState({isLoading: true});
    this.getUserPosition();
  }

  onSubmitPress() {
    //FIND CURRENT USER ID (USER ID FROM FIREBASE)
    let users = this.state.markers;
    var userid = 0;
    for (var index = 0; index < users.length; index++) {
      if (users[index].name === auth().currentUser.email) {
        userid = index;
      }
    }

    //UPDATE USER'S NOTE AND LOCATION
    this.updateUserData(userid);
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <Spinner
          visible={this.state.isLoading}
          textContent={'Getting your location'}
          textStyle={{color: '#FFF'}}
        />
        <Spinner
          visible={this.state.loadSignOut}
          textContent={'Signing Out...'}
          textStyle={{color: '#FFF'}}
        />
        <Button title="Sign out" onPress={this.signOut.bind(this)} />
        <MapView
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta,
          }}>
          <Marker
            title="My location"
            description={this.state.notes}
            pinColor={'#0000FF'}
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}
          />

          {/* RENDERS ALL USERS PIN AND DATA ==== STARTS HERE*/}
          {this.state.markers.map((item, key) => {
            return (
              <Marker
                key={key}
                title={item.name}
                description={item.notes}
                coordinate={{
                  latitude: item.location.latitude ? item.location.latitude : 0,
                  longitude: item.location.longitude
                    ? item.location.longitude
                    : 0,
                }}
              />
            );
          })}
          {/* RENDERS ALL USERS PIN AND DATA ==== ENDS HERE*/}
        </MapView>
        <TextInput
          placeholder="Write a note here"
          placeholderColor="#c4c3cb"
          style={{
            backgroundColor: '#fff',
          }}
          onChangeText={(res) => this.setState({notes: res})}
        />
        <Button onPress={this.onSubmitPress.bind(this)} title="Submit" />
        <Button
          onPress={this.updateLocation.bind(this)}
          title="Refresh Location"
        />
      </KeyboardAvoidingView>
    );
  }
}
