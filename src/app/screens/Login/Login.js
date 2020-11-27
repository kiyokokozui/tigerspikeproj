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
import Spinner from 'react-native-loading-spinner-overlay';

const initialState = {
  username: '',
  password: '',
  errors: {},
  isAuthorized: false,
  isLoading: false,
  usernameEmpty: false,
  passwordEmpty: false,
  emailIsValid: true,
};

export default class LoginScreen extends React.Component {
  state = initialState;

  componentDidMount() {
    this.checkUserAuthenticated();
  }

  checkUserAuthenticated() {
    //CHECK IF USER HAS PREVIOUSLY LOGGED IN
    if (auth().currentUser) {
      let user = auth().currentUser.uid;
      if (user) {
        this.setState({isAuthorized: true});
        this.props.navigation.navigate('Home');
      } else {
        this.setState({isAuthorized: false});
      }
    }
  }

  validateEmail = (username) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(username) === false) {
      this.setState({emailIsValid: false});
    } else {
      this.setState({emailIsValid: true});
    }
    this.setState({username});
  };

  checkTextField(username, password) {
    //CHECK ALL TEXT FIELD, IF ANY EMPTY, FUNCTION WILL RETURN AND WILL NOT INITIATE SIGN IN
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
  }

  initSignin(username, password) {
    // FIREBASE INITIATE SIGN IN
    auth()
      .signInWithEmailAndPassword(username, password)
      .then((res) => {
        this.setState({isLoading: false});
        console.log(res);
        this.props.navigation.navigate('Home');
      })
      .catch((err) => {
        this.setState({isLoading: false});
        console.error('Login failed, error ========', err.message);
      });
  }

  onLoginPress() {
    const {username, password} = this.state;

    this.checkTextField(username, password);

    // Show spinner when call is made
    this.setState({isLoading: true});

    this.initSignin(username, password);
  }

  onSignupPress() {
    this.props.navigation.navigate('Sign Up');
  }

  onUsernameChange = (username) => {
    this.setState({usernameEmpty: false});
    this.validateEmail(username);
  };

  onPasswordChange = (password) => {
    this.setState({passwordEmpty: false});
    this.setState({password});
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <Spinner
          visible={this.state.isLoading}
          textContent={'Signing in...'}
          textStyle={{color: '#FFF'}}
        />
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Login</Text>
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

            <Button
              buttonStyle={styles.loginButton}
              onPress={() => this.onLoginPress()}
              title="Login"
            />

            <Button
              title="New user? Sign up"
              buttonStyle={styles.loginButton}
              onPress={() => this.onSignupPress()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}
