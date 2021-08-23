import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ToastAndroid,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { Card, Button } from 'react-native-paper'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Entypo, Ionicons } from '../Icons/icons'
import { FontAwesome } from '../Icons/icons'
import { Primary, secondary } from '../Styles/colors'
import Header from '../Components/mainHeader'
import { f, firestore } from '../config/config'
import LoadingBar from '../Components/Loading'
import Confirmation from '../Components/Confirmation'
import DataLoader from '../Components/DataLoader';
import Modal from 'react-native-modal';

export default function Seller (props) {
  const [Loading, setLoading] = useState(true)
  const [request_data, setrequest_data] = useState([])

  const [accepctModal, setAcceptModal] = useState(false)
  const [denyModal, setDenyModal] = useState(false)
  const [process, setprocess] = useState(0)
  const [process2, setprocess2] = useState(0)
  const [refresh, setrefresh] = useState(false)
  const [requestdata, setrequestdata] = useState([]);
  const [shopm, setshopm ] = useState(false);
  const [ shopdata, setshpdata ] = useState([]);

  useEffect(() => {
    var request_data = []

    firestore
      .collection('Seller_Request')
      .where('Deny', '==', false)
      .onSnapshot(async data => {
        setLoading(true)
        request_data = []
        if (data.docs.length > 0) {
          await Promise.all(
            data.docs.map(async res => {
              let request = res.data()
              await firestore
                .collection('users')
                .doc(request.SellerID)
                .get()
                .then(udata => {
                  const userData = udata.data()
                  request_data.push({
                    requestID: res.id,
                    Username: userData.firstName + ' ' + userData.lastName,
                    Image: userData.Profile_Image,
                    phone: userData.phone,
                    SellerID: userData.userId,
                    Code: userData.code,
                    ShopName : userData.ShopName,
                    ShopAddress : userData.ShopAddress
                  })
                })
            })
          )
          setrequest_data(request_data)
          setLoading(false)
        } else {
          setrequest_data(request_data)
          setLoading(false)
        }
      })
  }, [])

  const HideModalAccept = () => {
    setAcceptModal(false)
  }

  const HideModalDeny = () => {
    setDenyModal(false)
  }

  const ShowModalAccept = () => {
    setAcceptModal(true)
  }

  const ShowModalDeny = () => {
    setDenyModal(true)
  }

  const HideShopM = () => {
    setshopm(false);
    setshpdata([]);
  }

  const onPressAccept = async () => {
    HideModalAccept()
    setprocess(2)
    const reqref = firestore
      .collection('Seller_Request')
      .doc(requestdata.requestID)
    const userref = firestore.collection('users').doc(requestdata.SellerID)

    try {
      const res = await firestore.runTransaction(async t => {
        t.update(userref, {
          isApproved: true
        })
        t.delete(reqref)
        return true
      })
      setprocess(0)
      if (res === true) {
        ToastAndroid.show('Request Accepted', ToastAndroid.LONG)
      }
    } catch (e) {
      console.log(e)
      setprocess(0)
      alert('Something Bad Happen...!')
    }
  }

  const onDeny = async () => {
    setprocess2(2)
    HideModalDeny()
    const reqref = firestore
      .collection('Seller_Request')
      .doc(requestdata.requestID)
    await reqref.update({ Deny: true })
    setprocess2(0)
    ToastAndroid.show('Request Denied', ToastAndroid.LONG)
  }

  const onRefresh = () => {
    setrefresh(true)
    setrefresh(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Header Name={'Seller Requests'} />

      <View style={{ flex: 1 }}>
        {Loading === false ? (
          <View style={{ flex: 1 }}>
            {request_data.length > 0 ? (
              <View>
                <FlatList
                  data={request_data}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  refreshing={refresh}
                  onRefresh={() => onRefresh()}
                  renderItem={data => (
                    <View>
                      <Card style={styles.Request}>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={styles.imagecon}>
                            <Image
                              source={{ uri: data.item.Image }}
                              style={styles.ImageBackground}
                            ></Image>
                          </View>
                          <View style={styles.details}>
                            <View style={{ flexDirection: 'row' }}>
                              <Ionicons
                                name='ios-person'
                                size={hp('4%')}
                                color={Primary}
                                style={styles.icon}
                              />
                              <Text
                                style={styles.Username}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                              >
                                {data.item.Username}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                              <FontAwesome
                                name='phone'
                                size={hp('3%')}
                                color={Primary}
                                style={styles.Phone_icon}
                              />
                              <Text
                                style={styles.Phone}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                              >
                                {data.item.phone}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity style = {{alignItems : 'center',marginTop : hp('2%')}} activeOpacity = {0.5} onPress = {() => { setshopm(true), setshpdata(data.item) }}>
                          <Text style = {{color : secondary,fontWeight : 'bold'}}>Shop Details</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text
                              style={{
                                marginTop: hp('5%'),
                                fontSize: hp('2.2%'),
                                fontWeight: 'bold',
                                color: 'black'
                              }}
                            >
                              Code : {data.item.Code}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'center', flex: 2 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginTop: hp('4%')
                              }}
                            >
                              <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => {
                                  ShowModalAccept(), setrequestdata(data.item)
                                }}
                              >
                                <Button
                                  style={{
                                    backgroundColor: secondary,
                                    borderRadius: wp('3%'),
                                    height: hp('6%')
                                  }}
                                  labelStyle={{
                                    color: 'white',
                                    fontSize: hp('1.8%')
                                  }}
                                >
                                  ACCEPT
                                </Button>
                              </TouchableOpacity>
                              <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => {
                                  ShowModalDeny(), setrequestdata(data.item)
                                }}
                              >
                                <Button
                                  style={{
                                    backgroundColor: 'red',
                                    borderRadius: wp('3%'),
                                    height: hp('6%'),
                                    marginLeft: wp('5%')
                                  }}
                                  labelStyle={{
                                    color: 'white',
                                    fontSize: hp('1.8%')
                                  }}
                                >
                                  DENY
                                </Button>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Card>
                    </View>
                  )}
                />
              </View>
            ) : (
              <View>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={refresh}
                      onRefresh={() => onRefresh()}
                    />
                  }
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: hp('25%')
                    }}
                  >
                    <FontAwesome
                      name='users'
                      size={hp('13%')}
                      color='#A9A9B8'
                    />
                    <Text
                      style={{
                        fontSize: hp('2.5%'),
                        marginTop: hp('5%'),
                        color: '#B2AFAF'
                      }}
                    >
                      {' '}
                      No Request Found{' '}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}

            {shopm ? (
              <Modal
                isVisible = {shopm}
                onBackButtonPress = {() => HideShopM()}
                onBackdropPress = {() => HideShopM()}
              >
                <View style = {{height : hp('50%'),backgroundColor : 'white',borderRadius : wp('5%')}}>
                  <View style = {{alignItems : 'center',marginVertical : hp('2%')}}>
                    <Text style = {{color : Primary, fontWeight : 'bold',fontSize : hp('2.5%')}}>Shop Details</Text>
                  </View>
                  <View style = {{flexDirection : 'row',marginTop : hp('3%'),marginLeft : wp('7%')}}>
                    <Entypo name="shop" size={hp('4%')} color={secondary} />
                    <Text numberOfLines = {1} adjustsFontSizeToFit = {true} style = {{marginLeft : wp('5%'),fontSize : hp('2.5%'),color : 'black',marginTop : hp('0.5%'),fontWeight : 'bold'}}>{"Shop Name :"}</Text>
                  </View>
                  <Text style = {{marginLeft : wp('8%'),marginTop : hp('2%'),color : 'black',fontSize : hp('2.2%')}}>{shopdata.ShopName}</Text>
                  <View style = {{flexDirection : 'row',marginTop : hp('4%'),marginLeft : wp('7%')}}>
                    <Entypo name="location-pin" size={hp('4%')} color={secondary} />
                    <Text style = {{width : wp('70%'),marginLeft : wp('5%'),fontSize : hp('2.5%'), color : 'black',fontWeight : 'bold',marginTop : hp('0.5%')}}>{"Shop Address :"}</Text>
                  </View>
                  <Text style = {{marginLeft : wp('8%'),marginTop : hp('2%'),color : 'black',fontSize : hp('2.2%'),width : wp('80%')}}>{shopdata.ShopAddress}</Text>
                </View>
              </Modal>
            ):( null)}

            <Confirmation
              isVisible={accepctModal}
              onBackButtonPress={() => HideModalAccept()}
              onBackdropPress={() => HideModalAccept()}
              question={'Are You Sure, Want To Accept ?'}
              onPressYes={() => onPressAccept()}
              onPressNo={() => HideModalAccept()}
            />

            <Confirmation
              isVisible={denyModal}
              onBackButtonPress={() => HideModalDeny()}
              onBackdropPress={() => HideModalDeny()}
              question={'Are You Sure, Want To Deny ?'}
              onPressYes={() => onDeny()}
              onPressNo={() => HideModalDeny()}
            />

            <LoadingBar isVisible={process > 0} data={'Accepting ...'} />

            <LoadingBar isVisible={process2 > 0} data={'Deleting...'} />
          </View>
        ) : (
          <DataLoader style={{ flex: 1 }} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  ImageBackground: {
    width: hp('13%'),
    height: hp('13%'),
    borderRadius: hp('13%'),
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden'
  },
  Request: {
    height: hp('34%'),
    marginHorizontal: wp('3%'),
    marginVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    elevation: 10
  },
  imagecon: {
    marginLeft: wp('3%'),
    marginTop: hp('2%'),
    width: wp('25%'),
    overflow: 'hidden'
  },
  details: {
    width: wp('75%'),
    backgroundColor: 'white'
  },
  Username: {
    marginLeft: wp('4%'),
    fontSize: hp('3%'),
    marginTop: hp('4%'),
    color: 'black'
  },
  icon: {
    marginTop: hp('4%'),
    marginLeft: wp('4%')
  },
  Phone: {
    marginLeft: wp('6%'),
    fontSize: hp('2.5%'),
    marginTop: hp('2%'),
    color: 'black'
  },
  Phone_icon: {
    marginTop: hp('2%'),
    marginLeft: wp('6%')
  },
  modal: {
    height: hp('70%'),
    backgroundColor: 'white',
    borderRadius: hp('4%'),
    overflow: 'hidden'
  },
  modalimage: {
    height: hp('30%'),
    width: wp('90%'),
    resizeMode: 'contain'
  },
  modalicon: {
    margin: hp('2%')
  },
  button: {
    marginTop: hp('4%'),
    width: wp('30%'),
    height: hp('6%'),
    backgroundColor: '#93F014',
    borderRadius: wp('3%'),
    elevation: 10,
    alignItems: 'center'
  },
  buttontext: {
    color: '#154293',
    fontSize: hp('3%'),
    marginTop: hp('0.5%')
  }
})
