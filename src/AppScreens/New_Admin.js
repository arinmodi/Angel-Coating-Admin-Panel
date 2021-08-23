import React, { useEffect, useRef, useState } from 'react'
import { View, Text, FlatList, ToastAndroid, DevSettings } from 'react-native'
import { Button, Card } from 'react-native-paper'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import { AntDesign, FontAwesome, FontAwesome5 } from '../Icons/icons'
import { Primary, secondary } from '../Styles/colors'
import Modal from 'react-native-modal'
import PhoneInput from 'react-native-phone-number-input'
import { f, firestore } from '../config/config'
import Loading from '../Components/Loading'
import DataLoader from '../Components/DataLoader'
import Confirmation from '../Components/Confirmation'
import { NavigationActions } from 'react-navigation'
import RNRestart from 'react-native-restart'

export default function New_Admin (props) {
  const [modal, setmodal] = useState(false)
  const [mobileNo, setMobileNO] = useState('')
  const phoneInput = useRef(null)
  const [process, setprocess] = useState(0)
  const [loading, setloading] = useState(true)
  const [screendata, setscreendata] = useState([])
  const [lmodal, setlmodal] = useState(false)

  const HideLmodal = () => {
    setlmodal(false)
  }

  useEffect(() => {
    var maindata = []
    var unsubscribe = firestore.collection('Admin_Numbers').onSnapshot(data => {
      maindata = []
      setloading(true)
      if (data && !data.empty) {
        if (data.docs.length > 0) {
          console.log('length')
          data.docs.forEach(doc => {
            maindata.push({
              number: doc.data().phone,
              id: doc.id
            })
          })
          setscreendata(maindata)
          setloading(false)
        } else {
          console.log('empty')
          setscreendata([])
          setloading(false)
        }
      } else {
        console.log('null')
        setscreendata([])
        setloading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const RenderNumbers = data => {
    return (
      <Card
        style={{
          backgroundColor: 'white',
          height: hp('8%'),
          marginHorizontal: wp('2%'),
          marginTop: hp('2.5%'),
          elevation: 5,
          borderRadius: wp('4%'),
          width: wp('46%')
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            marginTop: hp('2.5%'),
            marginLeft: wp('3%')
          }}
        >
          <FontAwesome name='phone' size={hp('3%')} color={Primary} />
          <Text
            style={{
              fontWeight: 'bold',
              marginLeft: wp('3%'),
              fontSize: hp('2.2%'),
              color: 'black'
            }}
          >
            {data.item.number}
          </Text>
        </View>
      </Card>
    )
  }

  const CheckInputs = async () => {
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
      var finalnumber = '+' + phoneInput.current.getCallingCode() + mobileNo

      await firestore
        .collection('Admin_Numbers')
        .where('phone', '==', finalnumber)
        .get()
        .then(docdata => {
          if (docdata.docs.length > 0) {
            validnumber = false
          } else {
            validnumber = true
          }
        })

      if (validnumber) {
        var phonenumber
        await firestore
          .collection('users')
          .where('phone', '==', finalnumber)
          .get()
          .then(docdata => {
            if (docdata.docs.length > 0) {
              phonenumber = false
            } else {
              phonenumber = true
            }
          })

        if (phonenumber) {
          await UploadNumber(finalnumber)
        } else {
          setprocess(0)
          alert('Invalid Number...')
        }
      } else {
        setprocess(0)
        alert('Number already a Admin..')
      }
    }
  }

  const UploadNumber = async number => {
    const ref = firestore.collection('Admin_Numbers')

    try {
      await ref.add({
        phone: number
      })
      setmodal(false)
      setprocess(0)
      ToastAndroid.show('Number Added...', ToastAndroid.LONG)
    } catch (e) {
      setprocess(0)
      setmodal(false)
      console.log(e)
      alert('somthing bad happen...')
    }
  }

  const logout = async () => {
    await f
      .auth()
      .signOut()
      .then(r => {
        HideLmodal()
        ToastAndroid.show('Signed Out', ToastAndroid.LONG)
        global.stackNavigator.dispatch(
          NavigationActions.navigate({
            routeName: 'main',
            params: { Restart: true }
          })
        )
      })
      .catch(e => {
        console.log(e)
        alert('Something bad happend')
      })
  }

  return (
    <View style={{ flex: 1 }}>
      <Header Name={'ADMINS'} />

      {loading === true ? (
        <DataLoader style={{ flex: 10 }} />
      ) : (
        <View>
          {screendata.length > 0 ? (
            <View>
              <Text
                style={{
                  marginLeft: wp('5%'),
                  marginTop: hp('2%'),
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: hp('2.2%'),
                  color: Primary
                }}
              >
                List of Mobile Numbers :{' '}
              </Text>
              <FlatList
                style={{ marginTop: hp('3%'), marginBottom: hp('15%') }}
                numColumns={2}
                data={screendata}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={RenderNumbers}
                ListFooterComponent={
                  <View style={{ marginTop: hp('2%') }}></View>
                }
              />
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: hp('80%')
              }}
            >
              <FontAwesome5
                name='user-shield'
                size={hp('10%')}
                color={'#AFAFAF'}
              />
              <Text style={{ fontSize: hp('2.5%'), marginTop: hp('5%') }}>
                No Number found
              </Text>
            </View>
          )}
        </View>
      )}

      <Modal
        isVisible={modal}
        onBackButtonPress={() => setmodal(false)}
        onBackdropPress={() => setmodal(false)}
      >
        <View
          style={{
            height: hp('35%'),
            backgroundColor: 'white',
            borderRadius: wp('5%')
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Primary,
              marginTop: hp('2%'),
              fontSize: hp('2.5%'),
              fontWeight: 'bold'
            }}
          >
            ADD NEW ADMIN
          </Text>
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
              width: wp('80%'),
              borderWidth: 0.5,
              overflow: 'hidden'
            }}
            textInputStyle={{
              fontSize: hp('2.5%')
            }}
          />

          <Button
            style={{
              marginTop: hp('3%'),
              backgroundColor: secondary,
              width: wp('30%'),
              alignSelf: 'center'
            }}
            labelStyle={{ fontSize: hp('2%'), color: 'white' }}
            onPress={() => CheckInputs()}
          >
            ADD
          </Button>
        </View>
      </Modal>

      <AntDesign
        name='pluscircle'
        size={hp('6%')}
        color={secondary}
        style={{ position: 'absolute', right: wp('2%'), bottom: hp('2%') }}
        onPress={() => setmodal(true)}
      />

      <AntDesign
        name='logout'
        size={hp('3.5%')}
        color={'white'}
        style={{ position: 'absolute', left: wp('5%'), top: hp('3%') }}
        onPress={() => setlmodal(true)}
      />

      <Loading isVisible={process > 0} data='Checking...' />

      <Confirmation
        isVisible={lmodal}
        onBackButtonPress={() => HideLmodal()}
        onBackdropPress={() => HideLmodal()}
        question={'Are You Sure, Want To Logout ?'}
        onPressYes={() => logout()}
        onPressNo={() => HideLmodal()}
      />
    </View>
  )
}
