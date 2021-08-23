import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ToastAndroid,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import { Primary, secondary } from '../Styles/colors'
import { Button, Card } from 'react-native-paper'
import { AntDesign, Entypo, MaterialIcons } from '../Icons/icons'
import { main } from '../Styles/main'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { database, f } from '../config/config'
import Loading from '../Components/Loading'
import QrModal from './QrModal'
import {
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5
} from '../Icons/icons'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import Confirmation from '../Components/Confirmation'
import DataLoader from '../Components/DataLoader'
import RepeatedQRs from './RepeatedQRs'

export default function QrCode (props) {
  const [qrcodeId, setqrcodeId] = useState('')
  const [Amount, setAmount] = useState('')
  const [Name, setName] = useState('')
  const [Process, setProcess] = useState(0)
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrcodes, setQrCodes] = useState([])
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [currentModel, setCurrentModel] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [showInvalidModal, setShowInvalidModal] = useState(true)
  const [invalidData, setInvalidData] = useState([]);
  const [ timestamp, settimestamp ] = useState(0);
  const [ ismoredata, setismoredata ] = useState(true);

  const onDeleteQrCode = data => {
    setShowDeleteConfirmation(true)
    setCurrentModel(data)
  }

  const deleteQrCode = () => {
    setLoading(true)
    console.log('deleting = ', currentModel['id'])
    f.database()
      .ref()
      .child('qrcodes')
      .child(`${currentModel['id']}`)
      .remove()
      .then(r => {
        ToastAndroid.show('Qr Code deleted successfully', ToastAndroid.SHORT)
        //filter list
        let temp = qrcodes
        temp = temp.filter(t => {
          console.log(t.id != currentModel['id'], ' ', currentModel['id'])
          return t.id != currentModel['id']
        })
        setQrCodes(temp)
      })
      .catch(e => {
        console.log(e)
        alert('Something went wrong')
      })
      .finally(() => {
        setLoading(false)
        setCurrentModel({})
      })
  }

  const loadMore = (path) => {
    if(path === "refresh"){
      setLoading(true);
    }
    console.log('loadmore')
    f.database()
      .ref()
      .child('qrcodes').orderByChild("timestamp").limitToFirst(30).startAt(timestamp + 1)
      .once('value')
      .then(r => {
        let temp = []
        r.forEach(child => {
          let status = child.child('status').val()
          if (status == 1) {
            temp.push({
              amount: child.child('amount').val(),
              status: child.child('status').val(),
              name: child.child('Name').val(),
              timestamp : child.child('timestamp').val(),
              id: child.key
            })
          }
        });
        if(temp.length < 30){
          setismoredata(false);
        }else{
          setismoredata(true);
        }
        if(temp.length > 0){
          settimestamp(temp[temp.length - 1].timestamp);
        };
        setQrCodes([...qrcodes,...temp]);
      })
      .catch(e => {
        alert('Something Went Wrong')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    Loaddata();
  }, []);

  const Loaddata = () => {
    setInitializing(true)
    var temp = [];
    f.database()
      .ref()
      .child('qrcodes').orderByChild("timestamp").limitToFirst(30)
      .once('value')
      .then(r => {
        temp = [];
        setQrCodes([]);
        r.forEach(child => {
          let status = child.child('status').val()
          if (status == 1) {
            temp.push({
              amount: child.child('amount').val(),
              status: child.child('status').val(),
              name: child.child('Name').val(),
              timestamp : child.child('timestamp').val(),
              id: child.key
            })
          }
        });
        if(temp.length < 30){
          setismoredata(false);
        }else{
          setismoredata(true);
        }
        if(temp.length > 0){
          settimestamp(temp[temp.length - 1].timestamp);
        }
        setQrCodes(temp);
      })
      .catch(e => {
        console.log(e);
        alert('Something Went Wrong')
      })
      .finally(() => {
        setInitializing(false)
      })
  }

  const CheckInputs = async () => {
    setProcess(2)
    if (qrcodeId === '' || qrcodeId.length <= 4) {
      setProcess(0)
      alert('Please enter valid QR Code, qr code must be 5 wrods long')
    } else if (Amount.length === 0 || Amount === '') {
      setProcess(0)
      alert('Please Enter Amount')
    } else if (Name === '' || Name.length < 0) {
      setProcess(0)
      alert('Please Enter Name, qr code must be 3 words long')
    } else if (!qrcodeId.match(/^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/)) {
      setProcess(0)
      alert(
        'Invalid QRCode ID,id can not contain space or special character like @,#'
      )
    } else if (!Amount.match(/^[0-9]*$/) || parseInt(Amount) <= 0) {
      setProcess(0)
      alert(
        'Amount must be a one or two digit Number and must be grater than 0'
      )
    } else if (!Name.match(/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/)) {
      setProcess(0)
      alert('Invalid Name, can not contain numbers')
    } else {
      var validqrcodeid
      await database
        .ref('qrcodes')
        .child(qrcodeId)
        .once('value')
        .then(data => {
          if (data.exists()) {
            validqrcodeid = false
          } else {
            validqrcodeid = true
          }
        })

      if (validqrcodeid) {
        await UploadToDatabase()
      } else {
        setProcess(0)
        alert('QR CODE ID ALREADY EXIST..')
      }
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    Loaddata();
    setRefreshing(false)
  }

  const editQr = data => {
    setCurrentModel(data)
    setModal(true)
  }

  const UploadToDatabase = async () => {
    const ref = database.ref('qrcodes')
    try {
      await ref.child(qrcodeId).set({
        amount: parseInt(Amount),
        Name: Name,
        status: 1
      })
      setProcess(0);
      ToastAndroid.show('QRCODE ADDED..', ToastAndroid.LONG)
    } catch (e) {
      setProcess(0)
      console.log(e)
      alert('Something Bad Happpen...')
    }
  }

  const RenderUI = data => {
    return (
      <Card
        style={{
          marginTop: hp('3%'),
          marginHorizontal: wp('3%'),
          borderRadius: wp('5%'),
          elevation: 10,
          height: hp('25%'),
          overflow: 'hidden'
        }}
      >
        <View style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}>
          <Text style={{ color: 'black', fontSize: hp('2.2%') }}>
            Qr id : {data['item']['id']}
          </Text>
        </View>

        <View
          style={{
            marginTop: hp('3%'),
            flexDirection: 'row',
            marginLeft: wp('5%')
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons
              name='qrcode'
              size={hp('10%')}
              color={'black'}
            />
            <View style={{ marginLeft: wp('2%'), marginTop: hp('1%') }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'black', fontSize: hp('2%') }}>
                  Name:
                </Text>
                <Text
                  style={{
                    fontSize: hp('2%'),
                    color: Primary
                  }}
                >
                  {`${data['item']['name']}`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                <FontAwesome name='rupee' size={hp('2.5%')} color={'black'} />
                <Text
                  style={{
                    color: 'black',
                    fontSize: hp('2.5%'),
                    marginLeft: wp('1.5%'),
                    marginTop: -hp('0.7%'),
                    fontWeight: 'bold'
                  }}
                >
                  {data['item']['amount']}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ paddingVertical: hp('1%'), paddingHorizontal: hp('1%') }}
            onPress={() => {
              onDeleteQrCode(data['item'])
            }}
          >
            <MaterialCommunityIcons
              name='delete'
              size={24}
              color='red'
              style={{
                marginLeft: wp('5%')
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: hp('1%'), paddingHorizontal: hp('1%') }}
            onPress={() => {
              editQr(data['item'])
            }}
          >
            <Entypo
              name='edit'
              size={24}
              color={secondary}
              style={{
                marginLeft: wp('1%')
              }}
            />
          </TouchableOpacity>
        </View>
      </Card>
    )
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header Name={'QR CODES'} />
      {showDeleteConfirmation ? (
        <Confirmation
          isVisible={showDeleteConfirmation}
          question={'Want to delete QR Code?'}
          onBackButtonPress={() => {
            setShowDeleteConfirmation(false)
          }}
          onPressYes={() => {
            setShowDeleteConfirmation(false)
            deleteQrCode()
          }}
          onPressNo={() => {
            setShowDeleteConfirmation(false)
          }}
        />
      ) : (
        <View />
      )}
      {loading ? <Loading isVisible={loading} data={'loading'} /> : <View />}
      {initializing ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <DataLoader isVisible={initializing} data={'loading'} />
        </View>
      ) : null}
      {modal ? (
        <QrModal
          onSubmit={d => {
            if (d && d != undefined) {
              setInvalidData(d.data)
              if (d.data.length != 0) setShowInvalidModal(true)
              else setShowInvalidModal(false)
            }
            setModal(false)
          }}
          onBack={() => {
            setModal(false)
            setCurrentModel({})
          }}
          onCancel={() => {
            setModal(false)
            setCurrentModel({})
          }}
          data={currentModel}
        />
      ) : null}

      {showInvalidModal && invalidData.length > 0 ? (
        <RepeatedQRs
          isVisible={showInvalidModal}
          onBackButtonPress={() => {
            setShowInvalidModal(false)
            setInvalidData([])
          }}
          onBackdropPress={() => {
            setShowInvalidModal(false)
            setInvalidData([])
          }}
          data={invalidData}
        />
      ) : null}

      {!loading && qrcodes.length === 0 && !initializing ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => onRefresh()}
            />
          }
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: hp('2%')
            }}
          >
            <MaterialIcons
              name='qr-code'
              size={120}
              color='gray'
              style={{ alignSelf: 'center', marginTop: hp('35%') }}
            />
            <Text style={{ fontSize: hp('2%'), alignSelf: 'center' }}>
              No Qr Codes generated
            </Text>
          </View>
        </ScrollView>
      ) : initializing ? null : (
        <FlatList
          style={{ flex: 1 }}
          data={qrcodes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={RenderUI}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true)
            Loaddata();
            setRefreshing(false)
          }}
          showsVerticalScrollIndicator={false}
          onEndReached = {() => { ismoredata ? ( loadMore("lazy") ) : ( null ) }}
          onEndReachedThreshold = {0.5}
          ListFooterComponent={
            <View
              style={{
                marginBottom: hp('2%')
              }}
            />
          }
        />
      )}

      <AntDesign
        name='pluscircle'
        size={hp('6%')}
        color={secondary}
        style={{ position: 'absolute', right: wp('2%'), bottom: hp('2%') }}
        onPress={() => {
          console.log('clicked')
          setModal(true)
        }}
      />
    </View>
  )
}
