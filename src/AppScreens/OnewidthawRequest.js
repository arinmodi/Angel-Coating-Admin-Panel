import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  FlatList,
  ScrollView
} from 'react-native'
import Modal from 'react-native-modal'
import { Button, Card } from 'react-native-paper'
import { f } from '../config/config'
import { color } from 'react-native-reanimated'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/header'
import Confirmation from '../Components/Confirmation'
import {
  FontAwesome,
  MaterialIcons,
  Octicons,
  FontAwesome5,
  Entypo,
  MaterialCommunityIcons,
  Fontisto
} from '../Icons/icons'
import { Primary, secondary } from '../Styles/colors'
import { main } from '../Styles/main'
import { style } from './widthrawRequest'
import Loading from '../Components/Loading'
import ViewAadharModal from './ViewAadharModal'

export default function OneRequest (props) {
  const [data, setData] = useState(props.navigation.getParam('data'))
  const [loading, setLoading] = useState(false)
  const [amodal, setamodal] = useState(false)
  const [accepctModal, setAcceptModal] = useState(false)

  const HideModalAccept = () => {
    setAcceptModal(false)
  }

  const confirm_transaction = async () => {
    setLoading(true)
    let docRef = f
      .firestore()
      .collection('withdrawrequests')
      .doc(data['id'])

    let docRef2 = f
      .firestore()
      .collection('users')
      .doc(data['userId'])

    console.log(
      'here ',
      data['wallet'],
      data['amount'],
      data['wallet'] - data['amount']
    )

    let finalwallet =
      data['wallet'] && data['wallet'] != undefined
        ? data['wallet'] - data['amount']
        : 0

    try {
      const res = await f.firestore().runTransaction(async t => {
        await t
          .get(docRef2)
          .then(res => {
            let currentWallet = res.data()['wallet'] - data['amount']
            if (currentWallet >= 0) {
              t.update(docRef, {
                status: 1
              })

              t.update(docRef2, {
                wallet: currentWallet
              })

              alert('Withdraw Approve')
            } else {
              alert('Insufficient Balance in wallet')
            }
          })
          .catch(err => {
            console.log(err)
          })
      })
      props.navigation.getParam('onAccepted')(data, finalwallet)
      props.navigation.goBack()
    } catch (e) {
      alert('Something Went wrong')
      console.log(e)
    } finally {
      setLoading(false)
      HideModalAccept()
    }
  }
  const view_transaction = () => {}
  const deny_transaction = () => {
    setLoading(true)
    f.firestore()
      .collection('withdrawrequests')
      .doc(data['id'])
      .update({
        status: 0
      })
      .then(r => {
        alert('Withdraw Denied')
      })
      .catch(e => {
        alert('Something went wrong')
      })
      .finally(() => {
        setLoading(false)
        props.navigation.getParam('onDenied')(data)
        props.navigation.goBack()
      })
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        Name='Widthraw Request'
        onPress={() => props.navigation.navigate('widthraw')}
      />
      {loading ? (
        <Loading isVisible={loading} data={'loading'} />
      ) : (
        <ScrollView>
          <View
            style={{
              marginTop: hp('2%'),
              marginLeft: wp('5%'),
              alignItems: 'center'
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={{
                  height: hp('6%'),
                  width: hp('6%'),
                  borderWidth: 1,
                  borderColor: 'black',
                  borderRadius: hp('6%'),
                  overflow: 'hidden'
                }}
                source={{
                  uri: data['Profile_Image']
                }}
              />
              <Text
                numberOfLines={1}
                style={{
                  marginLeft: wp('4%'),
                  fontSize: hp('2.2%'),
                  color: 'black',
                  fontWeight: 'bold',
                  marginTop: hp('1.3%'),
                  width: wp('40%')
                }}
              >
                {`${data['firstName']} ${data['lastName']}`}
              </Text>
            </View>
          </View>

          <Card
            style={{
              height: hp('25%'),
              marginHorizontal: wp('3%'),
              marginTop: hp('3%'),
              borderRadius: wp('5%'),
              elevation: 5
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('2%'),
                  marginHorizontal: wp('5%')
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: hp('1.5%'),
                    fontSize: hp('2.5%'),
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                >
                  Amount
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'center', marginTop: hp('5%') }}>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome name='rupee' size={hp('4.5%')} color={Primary} />
                <Text
                  style={{
                    color: Primary,
                    fontSize: hp('5%'),
                    marginLeft: wp('2%'),
                    marginTop: -hp('1.5%'),
                    fontWeight: 'bold'
                  }}
                >
                  {`${data['amount']}`}
                </Text>
              </View>
            </View>
          </Card>

          <Card
            style={{
              height: hp('28%'),
              marginHorizontal: wp('3%'),
              marginTop: hp('3%'),
              borderRadius: wp('5%'),
              elevation: 5
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: hp('1.5%'),
                  fontSize: hp('2.5%'),
                  color: 'black',
                  fontWeight: 'bold'
                }}
              >
                User Details
              </Text>
            </View>

            <View style={{ marginTop: hp('3%'), marginLeft: wp('8%') }}>
              <View style={{ flexDirection: 'row' }}>
                <Octicons name='paintcan' size={hp('3%')} color={Primary} />
                <Text
                  style={{
                    ...style.Text,
                    ...{ fontWeight: 'normal', marginLeft: wp('4%') }
                  }}
                >
                  {`${data['SellerCode']}`}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: hp('3%'), marginLeft: wp('8%') }}>
              <View style={{ flexDirection: 'row' }}>
                <MaterialIcons name='email' size={hp('3%')} color={Primary} />
                <Text style={{ ...style.Text, ...{ fontWeight: 'normal' } }}>
                  {`${data['email']}`}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: hp('3%'), marginLeft: wp('9%') }}>
              <View style={{ flexDirection: 'row' }}>
                <FontAwesome name='phone' size={hp('3%')} color={Primary} />
                <Text
                  style={{
                    ...style.Text,
                    ...{ fontWeight: 'normal', marginLeft: wp('4%') }
                  }}
                >
                  {`${data['phone']}`}
                </Text>
              </View>
            </View>
          </Card>

          <Card
            style={{
              height: hp('60%'),
              marginHorizontal: wp('3%'),
              marginTop: hp('3%'),
              borderRadius: wp('5%'),
              elevation: 5
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: hp('1.5%'),
                  fontSize: hp('2.5%'),
                  color: 'black',
                  fontWeight: 'bold'
                }}
              >
                Bank Details
              </Text>
            </View>

            <View style={{ marginTop: hp('4%'), marginLeft: wp('6%') }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ marginTop: -hp('1%') }}>
                  <Text
                    style={{
                      ...style.Text,
                      ...{
                        fontWeight: 'bold',
                        fontSize: hp('1.8%'),
                        color: Primary
                      }
                    }}
                  >
                    Bank Name :
                  </Text>
                  <Text
                    style={{
                      ...style.Text,
                      ...{ marginTop: hp('0.5%'), fontWeight: 'normal' }
                    }}
                  >
                    {`${data['bankName']}`}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: hp('4%'), marginLeft: wp('6%') }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ marginTop: -hp('1%') }}>
                  <Text
                    style={{
                      ...style.Text,
                      ...{
                        fontWeight: 'bold',
                        marginLeft: wp('3%'),
                        fontSize: hp('1.8%'),
                        color: Primary
                      }
                    }}
                  >
                    Branch Name :
                  </Text>
                  <Text
                    style={{
                      ...style.Text,
                      ...{
                        marginTop: hp('0.5%'),
                        fontWeight: 'normal',
                        marginLeft: wp('3%')
                      }
                    }}
                  >
                    {`${data['branchName']}`}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: hp('4%'), marginLeft: wp('6%') }}>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    fontWeight: 'bold',
                    marginLeft: wp('3%'),
                    fontSize: hp('1.8%'),
                    color: Primary
                  }
                }}
              >
                Account Holder Name :
              </Text>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    marginTop: hp('0.5%'),
                    fontWeight: 'normal',
                    marginLeft: wp('3%')
                  }
                }}
              >
                {`${data['accountHolderName']}`}
              </Text>
            </View>

            <View style={{ marginTop: hp('4%'), marginLeft: wp('6%') }}>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    fontWeight: 'bold',
                    marginLeft: wp('3%'),
                    fontSize: hp('1.8%'),
                    color: Primary
                  }
                }}
              >
                Account Number :
              </Text>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    marginTop: hp('0.5%'),
                    fontWeight: 'normal',
                    marginLeft: wp('3%')
                  }
                }}
              >
                {`${data['accNo']}`}
              </Text>
            </View>

            <View style={{ marginTop: hp('4%'), marginLeft: wp('6%') }}>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    fontWeight: 'bold',
                    marginLeft: wp('3%'),
                    fontSize: hp('1.8%'),
                    color: Primary
                  }
                }}
              >
                IFSC CODE :
              </Text>
              <Text
                style={{
                  ...style.Text,
                  ...{
                    marginTop: hp('0.5%'),
                    fontWeight: 'normal',
                    marginLeft: wp('3%')
                  }
                }}
              >
                {`${data['IFSC']}`}
              </Text>
            </View>
          </Card>

          {amodal === true ? (
            <Modal
              isVisible={amodal}
              onBackButtonPress={() => setamodal(false)}
              onBackdropPress={() => setamodal(false)}
              onDismiss={() => setamodal(false)}
            >
              <View
                style={{
                  height: hp('80%'),
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  alignItems: 'center',
                  width: wp('90%'),
                  borderRadius: wp('5%'),
                  justifyContent: 'center'
                }}
              >
                <Image
                  source={{
                    uri: data['Adhar_Card_Image']
                  }}
                  style={{
                    height: hp('70%'),
                    width: wp('80%'),
                    resizeMode: 'contain'
                  }}
                />
              </View>
            </Modal>
          ) : null}

          <View style={{ marginTop: hp('4%'), marginBottom: hp('3%') }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
            >
              <Text
                style={{
                  color: 'black',
                  fontSize: hp('2.5%'),
                  fontWeight: 'bold',
                  marginTop: hp('1%')
                }}
              >
                Adhar Card :{' '}
              </Text>
              <Button
                style={{ backgroundColor: Primary }}
                labelStyle={{ color: 'white' }}
                onPress={() => setamodal(true)}
              >
                View
              </Button>
            </View>
          </View>

          {accepctModal ? (
            <Confirmation
              isVisible={accepctModal}
              onBackButtonPress={() => HideModalAccept()}
              onBackdropPress={() => HideModalAccept()}
              question={'Are You Sure, Want To Accept ?'}
              onPressYes={() => {
                confirm_transaction()
              }}
              onPressNo={() => HideModalAccept()}
            />
          ) : null}

          <Button
            compact={true}
            style={{ ...main.buttonStyle, marginTop: hp('0%') }}
            icon={() => (
              <MaterialIcons
                name={'file-download-done'}
                size={hp('3%')}
                color={'white'}
              />
            )}
            labelStyle={{ color: 'white', fontSize: hp('2.8%') }}
            onPress={() => {
              setAcceptModal(true)
            }}
          >
            Confirm
          </Button>

          <Button
            compact={true}
            style={{
              ...main.buttonStyle,
              ...{ marginTop: hp('0%'), backgroundColor: 'red' }
            }}
            icon={() => <Entypo name='cross' size={hp('3%')} color='white' />}
            labelStyle={{ color: 'white', fontSize: hp('2.8%') }}
            onPress={() => deny_transaction()}
          >
            Cancel
          </Button>
        </ScrollView>
      )}
    </View>
  )
}
