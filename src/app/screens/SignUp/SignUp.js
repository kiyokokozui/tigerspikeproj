import React, {Component} from 'react';

import styles from './Style';
import {
  Keyboard,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Spinner from 'react-native-loading-spinner-overlay';

const initialState = {
  username: '',
  password: '',
  repPassword: '',
  error: '',
  isLoading: false,
  usernameEmpty: false,
  passwordEmpty: false,
  valPasswords: false,
  emailIsValid: true,
};

var numOfUsers = 0;

export default class SignUpScreen extends React.Component {
  state = initialState;

  componentDidMount() {
    //GET NUMBER OF USERS IN FIREBASE
    database()
      .ref('users')
      .on('value', function (snapshot) {
        numOfUsers = snapshot.numChildren();
      });
  }

  componentWillUnmount() {}

  validateEmail = (username) => {
    // REGEX TO CHECK IF EMAIL IS CORRECT FORMAT
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(username) === false) {
      this.setState({emailIsValid: false});
    } else {
      this.setState({emailIsValid: true});
    }
    this.setState({username});
  };

  checkTextField(username, password, repPassword) {
    this.setState({error: ''});

    if (username === '') {
      this.setState({
        usernameEmpty: true,
      });
      return;
    } else {
      this.setState({
        usernameEmpty: false,
      });
    }

    if (!this.state.emailIsValid) {
      return;
    }

    if (password === '') {
      console.log(password);
      this.setState({
        passwordEmpty: true,
      });
      return;
    } else {
      this.setState({
        passwordEmpty: false,
      });
    }

    if (password !== repPassword) {
      this.setState({valPasswords: true});
      return;
    }
  }

  initSignup(username, password) {
    //INITIATE SIGNING UP
    auth()
      .createUserWithEmailAndPassword(username, password)
      .then((res) => {
        this.setState({isLoading: false});
        console.log(res);
        Alert.alert(
          'Sign up successful!',
          'You will be redirected to home page',
          [{text: 'OK', onPress: () => this.props.navigation.navigate('Home')}],
          {cancelable: false},
        );

        database()
          .ref('/users/' + numOfUsers)
          .set({
            location: 0,
            name: username,
            notes: 'empty',
          });
      })
      .catch((err) => {
        this.setState({isLoading: false});
        console.log(err.code);
        this.setState({error: err.message});
      });
  }

  onSignupPress() {
    const {username, password, repPassword} = this.state;

    //CHECK ALL TEXT FIELD, IF ANY EMPTY, FUNCTION WILL RETURN AND WILL NOT INITIATE SIGN IN
    this.checkTextField(username, password, repPassword);

    // Show spinner when call is made
    this.setState({isLoading: true});

    this.initSignup(username, password);
  }

  onUsernameChange = (username) => {
    this.setState({usernameEmpty: false});
    this.validateEmail(username);
  };

  onPasswordChange = (password) => {
    this.setState({passwordEmpty: false});
    this.setState({password});
  };

  onRepPasswordChange = (password) => {
    this.setState({valPasswords: false});
    this.setState({repPassword: password});
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <Spinner
          visible={this.state.isLoading}
          textContent={'Signin up...'}
          textStyle={{color: '#FFF'}}
        />
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Sign Up</Text>
            <TextInput
              placeholder="Username"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              onChangeText={this.onUsernameChange}
            />

            {/* ERROR MESSAGE */}
            {this.state.usernameEmpty ? (
              <Text style={styles.errorMessageTextStyle}>
                Username is empty
              </Text>
            ) : (
              <View />
            )}

            {this.state.emailIsValid ? (
              <View />
            ) : (
              <Text style={styles.errorMessageTextStyle}>
                Email is not valid
              </Text>
            )}

            <TextInput
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={true}
              onChangeText={this.onPasswordChange}
            />

            {/* ERROR MESSAGE */}
            {this.state.passwordEmpty ? (
              <Text style={styles.errorMessageTextStyle}>
                Passwword is empty
              </Text>
            ) : (
              <View />
            )}

            <TextInput
              placeholder="Repeat Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={true}
              onChangeText={this.onRepPasswordChange}
            />

            {/* ERROR MESSAGE */}
            {this.state.valPasswords ? (
              <Text style={styles.errorMessageTextStyle}>
                Passwords are not the same
              </Text>
            ) : (
              <View />
            )}

            <Button
              buttonStyle={styles.loginButton}
              onPress={() => this.onSignupPress()}
              title="Sign Up"
            />

            {/* ERROR MESSAGE */}
            <Text style={styles.errorMessageTextStyle}>{this.state.error}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
