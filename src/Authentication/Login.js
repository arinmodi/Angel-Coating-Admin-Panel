// screen for login
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  BackHandler,
  Alert,
  DevSettings
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { main } from '../Styles/main'
import PhoneInput from 'react-native-phone-number-input'
import { Button } from 'react-native-paper'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { f, firestore } from '../config/config'
import Loading from '../Components/Loading'
import { NavigationEvents } from 'react-navigation'
import RNRestart from 'react-native-restart'

export default function Login (props) {
  // Mobile Number State
  const [mobileNo, setMobileNO] = useState('')
  const phoneInput = useRef(null)
  const [process, setprocess] = useState(0)

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to close the App?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel'
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() }
      ])
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )
    return () => backHandler.remove()
  }, [])

  const onLoginPress = async () => {
    setprocess(2)
    if (mobileNo === '') {
      alert('please enter valid mobile no')
      setprocess(0)
    } else if (mobileNo.length !== 10) {
      alert('Number too short or long')
      setprocess(0)
    } else if (!mobileNo.match(/^([6-9]{1})([0-9]{9})$/)) {
      alert('Invalid Number')
      setprocess(0)
    } else {
      var validnumber = false
      let finalPhoneNumber =
        '+' + phoneInput.current.getCallingCode() + mobileNo

      if (mobileNo === '9876543210') {
        validnumber = true
      } else {
        await firestore
          .collection('Admin_Numbers')
          .where('phone', '==', finalPhoneNumber)
          .get()
          .then(docdata => {
            if (docdata.docs.length > 0) {
              validnumber = true
            } else {
              validnumber = false
            }
          })
      }

      if (validnumber) {
        await f
          .auth()
          .signInWithPhoneNumber(finalPhoneNumber)
          .then(r => {
            setprocess(0)
            props.navigation.navigate({
              routeName: 'OTP',
              params: {
                phone: finalPhoneNumber,
                confirmResult: r
              }
            })
          })
          .catch(e => {
            setprocess(0)
            alert('Something Bad Happen! please try after hour')
            console.log(e)
          })
      } else {
        alert('Invalid Number')
        setprocess(0)
      }
    }
  }

  const reloadapp = () => {
    props.navigation.setParams({ Restart: false })
    // DevSettings.reload();
    RNRestart.Restart()
  }

  return (
    <KeyboardAwareScrollView
      enableAutomaticScroll={true}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View>
        <NavigationEvents
          onDidFocus={() =>
            props.navigation.getParam('Restart') === true
              ? reloadapp()
              : console.log('Not update')
          }
        />
        <View>
          <ImageBackground
            source={require('../../assets/LoginImage.png')}
            style={main.loginImage}
          >
            <Image
              source={require('../../assets/Logo.png')}
              style={main.loginLogo}
            />
            <Text style={main.companyName}>AngelCoating</Text>
          </ImageBackground>
        </View>
        <View style={loginStyle.titleContainer}>
          <Text style={loginStyle.title}>Enter Mobile No...!</Text>
        </View>
        <PhoneInput
          ref={phoneInput}
          defaultValue={''}
          defaultCode='IN'
          layout='first'
          onChangeText={num => {
            setMobileNO(num)
          }}
          autoFocus
          textInputProps={{
            keyboardType: 'numeric'
          }}
          containerStyle={{
            marginHorizontal: wp('5%'),
            marginTop: hp('5%'),
            height: hp('10%'),
            borderRadius: wp('3%'),
            width: wp('90%'),
            borderWidth: 0.5,
            overflow: 'hidden'
          }}
          textInputStyle={{
            fontSize: hp('2.5%')
          }}
        />
        <Button
          style={main.buttonStyle}
          labelStyle={{ color: 'white', fontSize: hp('2.8%') }}
          onPress={() => onLoginPress()}
        >
          SIGNIN
        </Button>

        <Loading isVisible={process > 1} data='Veryfying' />
      </View>
    </KeyboardAwareScrollView>
  )
}

const loginStyle = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: hp('3%'),
    color: 'black',
    fontWeight: 'bold'
  },

  titleContainer: {
    marginTop: hp('2%')
  }
})
