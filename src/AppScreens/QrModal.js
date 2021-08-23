import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, ToastAndroid } from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Modal from 'react-native-modal'
import Header from '../Components/mainHeader'
import { Primary, secondary } from '../Styles/colors'
import { Button } from 'react-native-paper'
import { MaterialIcons } from '../Icons/icons'
import { main } from '../Styles/main'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { database } from '../config/config'
import Loading from '../Components/Loading'
import XLSX from 'xlsx'
import DocumentPicker from 'react-native-document-picker'
import RepeatedQrs from './RepeatedQRs'

export default function QrCode (props) {
  const [qrcodeId, setqrcodeId] = useState('')
  const [Amount, setAmount] = useState('')
  const [Name, setName] = useState('')
  const [Process, setProcess] = useState(0)
  const [modal, setModal] = useState({})
  const [isIdDisabled, setIsIdDisabled] = useState(true)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadProcess, setUploadProcess] = useState(0)
  const [showInvalidModal, setShowInvalidModal] = useState(true)
  const [invalidData, setInvalidData] = useState([])

  useEffect(() => {
    console.log(props.data)
    setAmount(props.data['amount'] ? props.data['amount'] + '' : '')
    setName(props.data['name'] ? props.data['name'] : '')
    setqrcodeId(props.data['id'] ? props.data['id'] : '')
    if (props.data['id'] && props.data['id'] != undefined) {
      setIsIdDisabled(false)
    }
    setModal(props.data)
  }, [])

  const inputfile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx]
      })

      await readEcxel(res)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        console.log('some other error = ', err)
      }
    }
  }

  const readEcxel = async file => {
    setIsUploadingFile(true)

    const filePath = file.uri
    var RNFS = require('react-native-fs')
    try {
      const excelFile = await RNFS.readFile(filePath, 'ascii')
      const workbook = XLSX.read(excelFile, { type: 'binary' })
      const wsname = workbook.SheetNames[0]
      const ws = workbook.Sheets[wsname]
      const data = XLSX.utils.sheet_to_csv(ws)
      convert_To_JSON(data)
    } catch (e) {
      setIsUploadingFile(false)
      console.log(e)
    }
  }

  function convert_To_JSON (csv) {
    var lines = csv.split('\n')

    var result = []

    var headers = lines[0].split(',')

    for (var i = 1; i < lines.length - 1; i++) {
      var obj = {}
      var currentline = lines[i].split(',')

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]
      }

      result.push(obj)
    }

    uploadData(result, headers)
  }

  async function uploadData (result, headers) {
    let flag = true
    console.log(headers)
    if (
      headers.includes('QRID') &&
      headers.includes('AMOUNT') &&
      headers.includes('NAME')
    ) {
      let temp = []
      for (let element in result) {
        var qrObj = result[element]
        let qrcodeId = qrObj.QRID.trim()
        let Name = qrObj.NAME.trim()
        let Amount = qrObj.AMOUNT.trim()

        if (qrcodeId === '' || qrcodeId.length <= 4) {
          alert('Please enter valid QR Code, qr code must be 5 wrods long')
          flag = false
          break
        } else if (Amount.length === 0 || Amount === '') {
          alert('Please Enter Amount')
          flag = false
          break
        } else if (Name === '' || Name.length < 0) {
          alert('Please Enter Name, qr code must be 3 words long')
          flag = false
        } else if (!qrcodeId.match(/^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/)) {
          alert(
            'Invalid QRCode ID,id can not contain space or special character like @,#'
          )
          flag = false
          break
        } else if (!Amount.match(/^[0-9]*$/) || parseInt(Amount) <= 0) {
          alert(
            'Amount must be a one or two digit Number and must be grater than 0'
          )
          flag = false
          break
        } else if (!Name.match(/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/)) {
          alert('Invalid Name, can not contain numbers')
          flag = false
          break
        } else {
          temp.push({
            amount: parseInt(Amount),
            Name: Name,
            status: 1,
            id: qrcodeId
          })
        }
      }
      let invalidIds = []
      let validIdsPromises = []
      if (flag === true) {
        for (let t in temp) {
          var qr = temp[t]
          console.log(qr)
          let op = await checkForInvalidIds(qr['id'])
          if (op) {
            console.log('op = ', op)
            await uploadQrCode(qr)
            console.log('qr code uploaded done')
          } else {
            invalidIds.push(qr)
          }
          setUploadProcess((t / temp.length) * 100)
        }
        setIsUploadingFile(false);
        ToastAndroid.show("All QR Codes Uploaded....", ToastAndroid.LONG);
        props.onSubmit({ data: invalidIds });
      } else {
        ToastAndroid.show('Something is wrong in file', ToastAndroid.SHORT);
        setIsUploadingFile(false);
      }
    } else {
      alert('Invalid Format')
      setIsUploadingFile(false)
    }
  }

  const uploadQrCode = async qrdata => {
    console.log('qr data = ', qrdata)
    await database
      .ref()
      .child(`qrcodes`)
      .child(qrdata['id'])
      .set({
        amount: qrdata['amount'],
        Name: qrdata['Name'],
        status: 1,
        timestamp : Date.now() * -1
      })
      .then(res => {
        console.log('then phase')
      })
      .catch(err => {
        console.log('erro = ', err)
      })
  }

  const checkForInvalidIds = async qrcodeId => {
    let isValid
    await database
      .ref('qrcodes')
      .child(qrcodeId)
      .once('value')
      .then(data => {
        if (data.exists() && isIdDisabled) {
          isValid = false
        } else {
          isValid = true
        }
      })
      .catch(e => [(isValid = false)])
    return isValid
  }

  const CheckInputs = async () => {
    setProcess(2)
    if (qrcodeId === '' || qrcodeId.length <= 4) {
      setProcess(0)
      alert('Please enter valid QR Code, qr code must be 5 wrods long')
    } else if (Amount.length === 0 || Amount === '') {
      setProcess(0)
      alert('Please Enter Amount')
    } else if (Name === '' || Name.length <= 0) {
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
          if (data.exists() && isIdDisabled) {
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

  const UploadToDatabase = async () => {
    const ref = database.ref('qrcodes')
    try {
      await ref.child(qrcodeId).set({
        amount: parseInt(Amount),
        Name: Name,
        status: 1,
        timestamp : Date.now() * -1
      })
      setProcess(0)
      props.onSubmit()
      ToastAndroid.show('QRCODE ADDED..', ToastAndroid.LONG);
    } catch (e) {
      setProcess(0)
      props.onSubmit()
      console.log(e)
      alert('Something Bad Happpen...')
    } finally {
    }
  }

  return (
    <Modal
      isVisible={true}
      onBackButtonPress={props.onBack}
      onBackdropPress={props.onBack}
    >
      <View
        style={{
          alignSelf: 'center',
          width: wp('95%'),
          borderRadius: wp('5%'),
          backgroundColor: 'white',
          height: hp('70%')
        }}
      >
        <View>
          <Button
            style={{ marginVertical: hp('3%') }}
            labelStyle={{ color: Primary }}
            onPress={() => {
              inputfile()
            }}
          >
            IMPORT FILE
          </Button>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'black', fontSize: hp('1.5%') }}>
            ---- OR ----
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: hp('3%') }}>
          <Text
            style={{ fontSize: hp('3%'), color: Primary, fontWeight: 'bold' }}
          >
            Fill this form to create Qr Code
          </Text>
        </View>

        <KeyboardAwareScrollView enableAutomaticScroll={true}>
          <Text
            style={{
              marginTop: hp('4%'),
              fontSize: hp('2.5%'),
              marginLeft: wp('6%'),

              fontWeight: 'bold',
              color: 'black'
            }}
          >
            QRCode ID :
          </Text>
          <View>
            <TextInput
              style={{
                width: wp('85%'),
                backgroundColor: 'white',
                borderWidth: 1,
                marginTop: hp('1%'),
                marginLeft: wp('5%'),

                padding: hp('1%'),
                fontSize: hp('2.2%'),
                borderRadius: wp('3%')
              }}
              editable={isIdDisabled}
              numberOfLines={1}
              maxLength={20}
              value={qrcodeId}
              placeholder={'QR Code ID'}
              onChangeText={setqrcodeId}
            />
          </View>

          <Text
            style={{
              marginTop: hp('4%'),
              fontSize: hp('2.5%'),
              marginLeft: wp('6%'),

              fontWeight: 'bold',
              color: 'black'
            }}
          >
            Amount :
          </Text>
          <View>
            <TextInput
              style={{
                width: wp('85%'),
                backgroundColor: 'white',
                borderWidth: 1,
                marginTop: hp('1%'),
                marginLeft: wp('5%'),

                padding: hp('1%'),
                fontSize: hp('2.2%'),
                borderRadius: wp('3%')
              }}
              editable={true}
              value={Amount}
              numberOfLines={1}
              maxLength={2}
              placeholder={'Amount'}
              onChangeText={setAmount}
              keyboardType={'numeric'}
            />
          </View>

          <Text
            style={{
              marginTop: hp('4%'),
              fontSize: hp('2.5%'),
              marginLeft: wp('6%'),
              fontWeight: 'bold',
              color: 'black'
            }}
          >
            Name :
          </Text>
          <View>
            <TextInput
              style={{
                width: wp('85%'),
                backgroundColor: 'white',
                borderWidth: 1,
                marginTop: hp('1%'),
                marginLeft: wp('5%'),
                padding: hp('1%'),
                fontSize: hp('2.2%'),
                borderRadius: wp('3%')
              }}
              editable={true}
              value={Name}
              numberOfLines={1}
              maxLength={20}
              placeholder={'Paint Can Name'}
              onChangeText={setName}
            />
          </View>

          <Button
            compact={true}
            style={{
              ...main.buttonStyle,
              ...{ marginTop: hp('6%'), marginBottom: hp('1%') }
            }}
            icon={() => (
              <MaterialIcons
                name={'file-download-done'}
                size={hp('3%')}
                color={'white'}
              />
            )}
            labelStyle={{ color: 'white', fontSize: hp('2.8%') }}
            onPress={() => CheckInputs()}
          >
            SUBMIT
          </Button>

          <Button
            compact={true}
            style={{
              ...main.buttonStyle,
              ...{ marginTop: hp('0%'), backgroundColor: 'red' }
            }}
            icon={() => (
              <MaterialIcons name={'cancel'} size={hp('3%')} color={'white'} />
            )}
            labelStyle={{ color: 'white', fontSize: hp('2.8%') }}
            onPress={() => props.onCancel()}
          >
            Cancel
          </Button>

          <Loading isVisible={Process > 0} data='Uploading ...' />

          <Loading
            isVisible={isUploadingFile}
            data={uploadProcess + '% uploading'}
          />
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}
