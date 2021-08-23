import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableNativeFeedback,
  StyleSheet,
  ToastAndroid
} from 'react-native'
import OtpInputs from './OTP_Inputs'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Card } from 'react-native-paper'
import { f } from '../config/config'
import RNOtpVerify from 'react-native-otp-verify'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Header from '../Components/header'
import Loading from '../Components/Loading';

export default function OTP (props) {
  const mobile = props.navigation.getParam('phone')
  const confirmResult = props.navigation.getParam('confirmResult');

  const [code, setCode] = useState('')
  const [otp, setotp] = useState([])
  const [auto, setauto] = useState(false);
  const [ process, setprocess ] = useState(0);

  async function confirmCode () {
    setprocess(2);
    try {
      const user = f.auth().currentUser;
      if (user) {
        setprocess(0);
        props.navigation.navigate('App');
      } else {
        await confirmResult
          .confirm(code)
          .then(result => {
            setprocess(0);
            props.navigation.navigate('App');
          })
          .catch(e => {
            setprocess(0);
            alert('Invalid OTP...!');
            console.log(e);
          })
      }
    } catch (error) {
      setprocess(0);
      alert('Something Bad Happen try again...!');
      console.log(error);
    }
  };

  useEffect(() => {
         if (f.auth.PhoneAuthState.CODE_SENT) {
         ToastAndroid.show('OTP Sent!', ToastAndroid.LONG)
         RNOtpVerify.getOtp()
           .then(p => {
             RNOtpVerify.addListener(message => {
               console.log('Listener Added')
               try {
                 if (message && message !== 'Timeout Error') {
                   console.log('Message Found', message)
                 const otp = new RegExp(/(\d{6})/g.exec(message)[1])
                   console.log('OTP Found', otp.source, otp.source.length)
                   if (otp.source.length >= 6) {
                    console.log('setting otp...')
                    var otpnumbers = []
                    for (var i = 0; i <= otp.source.length; i++) {
                       var num = otp.source.charAt(i)
                       console.log('Setting', num)
                       otpnumbers[i] = num
                     }
                     setotp(otpnumbers)
                    setauto(true)
                   } else {
                     console.log('Not otp...')
                   }
                 } else {
                   console.log(
                     'OTPVerification: RNOtpVerify.getOtp - message=>',
                     message
                   )
                 }
               } catch (error) {
                 console.log('OTPVerification: RNOtpVerify.getOtp error=>', error)
               }
             })
         })
           .catch(error => {
             console.log(error)
        })

         return () => {
           RNOtpVerify.removeListener()
         }
       }   }, [])

  const setOtp = index => {
    console.log(otp[index])
    return otp[index].toString()
  }

  return (
    <KeyboardAwareScrollView
      enableAutomaticScroll={true}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View style={styles.container}>
        <View style={styles.ImageBackground}>
          <Header
            Name={'OTP Verification'}
            onPress={() => props.navigation.navigate('Login')}
          />
        </View>

        <View
          style={{
            flex: 1,
            marginTop: -hp('10%'),
            backgroundColor: 'white',
            borderTopLeftRadius: wp('15%')
          }}
        >
          <View
            style={{ flex: 1, marginTop: hp('10%'), backgroundColor: 'white' }}
          >
            <Text
              style={{
                ...styles.title,
                ...{ color: 'black', marginTop: hp('1%') }
              }}
            >
              Enter OTP
            </Text>

            <OtpInputs
              getOtp={setCode}
              autofill={auto}
              setotp={index => setOtp(index)}
            />

            <View style={{ flex: 1 }}>
              <TouchableNativeFeedback onPress={confirmCode}>
                <Card style={styles.button}>
                  <Text style={styles.buttontext}>Submit</Text>
                </Card>
              </TouchableNativeFeedback>
            </View>
          </View>
        </View>

        <Loading 
                isVisible = { process > 1 }
                data = "Checking"
            />
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  ImageBackground: {
    height: hp('30%'),
    width: wp('100%')
  },
  title: {
    color: '#C6C7CB',
    fontSize: hp('2.5%'),
    marginTop: hp('5%'),
    textAlign: 'center',
    marginLeft: -wp('5%'),
    fontWeight: 'bold'
  },
  icon: {
    marginLeft: wp('5%'),
    marginTop: wp('8%')
  },
  button: {
    height: hp('7%'),
    width: wp('40%'),
    marginVertical: hp('2%'),
    alignItems: 'center',
    backgroundColor: '#702f8b',
    borderRadius: wp('5%'),
    alignSelf: 'center',
    elevation: 10
  },
  buttontext: {
    color: 'white',
    fontSize: hp('3%'),
    marginTop: hp('1%')
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  }
})
