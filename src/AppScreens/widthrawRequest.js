import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl
} from 'react-native'
import { Card } from 'react-native-paper'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import { FontAwesome, MaterialIcons, Octicons } from '../Icons/icons'
import { Primary, secondary } from '../Styles/colors'
import SearchBar from 'react-native-dynamic-search-bar'
import { f } from '../config/config'
import DataLoader from '../Components/DataLoader'

export default function widthraw (props) {
  const [serch, setSerch] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [lastTimeStamp, setLastTimeStamp] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isDataAvailable, setIsDataAvailable] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [transactionHolder, setTransactionHolder] = useState([])

  const NavigateToRequest = data => {
    props.navigation.navigate({
      routeName: 'OneRequest',
      params: {
        data: data,
        onAccepted: (data, newWallet) => {
          let temp
          temp = transactions
          temp = temp.filter(t => {
            if (data['userId'] == t['userId']) {
              t['wallet'] = newWallet
            }
            return t.id != data.id
          })
          setTransactions(temp)
          setTransactionHolder(temp)
        },
        onDenied: data => {
          let temp
          temp = transactions
          temp = temp.filter(t => {
            return t.id != data.id
          })
          setTransactions(temp)
          setTransactionHolder(temp)
        }
      }
    })
  }

  const loadMore = (isRefreshing = false) => {
    console.log('here ', isDataAvailable)
    if (!isDataAvailable && !isRefreshing) return
    setLoading(true)
    f.firestore()
      .collection('withdrawrequests')
      .orderBy('timestamp', 'asc')
      .where('status', '==', 2)
      .startAfter(lastTimeStamp)
      .limit(5)
      .get()
      .then(r => {
        if (r && !r.empty) {
          if (r.docs.length < 5) {
            setIsDataAvailable(false)
          } else {
            setIsDataAvailable(true)
          }
          console.log('data availabl e= ', r.docs.length)

          let temp = []
          r.docs.forEach(doc => {
            //information
            /* 
                  id
                  amount 
                  uid
                  username
                  profile url
                  seller code
                  email
                  phone
                  timestamp
                  IFSC
                  bank name
                  acc holder name
                  branch name
                  acc no
                  adhar uri,
                  wallet
              */
            let data = doc.data()
            let obj = {
              ...data,
              id: doc.id
            }
            temp.push(obj)
          })
          setLastTimeStamp(r.docs[r.docs.length - 1].data()['timestamp'])
          let promises = temp.map((t, index) => {
            return new Promise((resolve, reject) => {
              let user = t['user']
              f.firestore()
                .collection('users')
                .doc(user)
                .get()
                .then(d => {
                  temp[index] = {
                    ...temp[index],
                    ...d.data()
                  }

                  resolve('')
                })
                .catch(e => {
                  console.log(e)
                  reject(e)
                })
            })
          })
          Promise.all(promises)
            .then(r => {
              setTransactions([...transactions, ...temp])
              setTransactionHolder([...transactions, ...temp])
              console.log('length = ', transactions.length)
            })
            .catch(e => {
              alert('Something went wrong')
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          //data not found
          console.log('data not found')
          setLoading(false)
          setIsDataAvailable(false)
        }
      })
      .catch(e => {
        console.log(e)
        setLoading(false)
        alert('Something Bad happend')
      })
  }

  useEffect(() => {
    loadMore()
  }, [])

  const RenderUI = data => {
    return (
      <Card
        style={{
          height: hp('38%'),
          marginHorizontal: wp('3%'),
          elevation: 10,
          borderRadius: wp('5%'),
          marginTop: hp('3%')
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            marginTop: hp('2%'),
            marginLeft: wp('5%')
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Image
              style={{
                height: hp('6%'),
                width: hp('6%'),
                borderRadius: hp('6%'),
                overflow: 'hidden'
              }}
              source={{
                uri: data['item']['Profile_Image']
              }}
            />
            <Text
              numberOfLines={1}
              style={{
                marginLeft: wp('3%'),
                fontSize: hp('2.2%'),
                color: 'black',
                fontWeight: 'bold',
                marginTop: hp('1.3%'),
                width: wp('40%')
              }}
            >
              {`${data['item']['firstName']} ${data['item']['lastName']}`}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row' }}>
              <FontAwesome
                name='rupee'
                size={hp('2.2%')}
                color={Primary}
                style={{ marginTop: hp('1.7%') }}
              />
              <Text
                style={{
                  ...style.Text,
                  ...{
                    marginRight: wp('8%'),
                    color: Primary,
                    marginTop: hp('1.3%')
                  }
                }}
              >
                {`${data['item']['amount']}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: hp('1%'), marginLeft: wp('7%') }}>
          <Text style={{ fontWeight: 'bold' }}>{`${new Date(
            data['item']['timestamp']
          )}`}</Text>
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
              {` ${data['item']['SellerCode']}`}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: hp('3%'), marginLeft: wp('8%') }}>
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons name='email' size={hp('3%')} color={Primary} />
            <Text style={{ ...style.Text, ...{ fontWeight: 'normal' } }}>
              {` ${data['item']['email']}`}
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
              {` ${data['item']['phone']}`}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignItems: 'flex-end',
            marginRight: wp('5%'),
            marginTop: hp('2%')
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => NavigateToRequest(data['item'])}
          >
            <View
              style={{
                backgroundColor: secondary,
                borderRadius: wp('2%'),
                width: wp('20%'),
                height: hp('4.5%'),
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: hp('2%')
                }}
              >
                More
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Card>
    )
  }

  const onSerch = text => {
    text = text.trim().toLowerCase()
    console.log('text = ', text)
    if (text == '') {
      //show original data
      console.log('showing originla ')
      setTransactions(transactionHolder)
    } else {
      const search = transactionHolder.filter(transaction => {
        return (
          transaction['firstName'].toLowerCase().includes(text) ||
          transaction['lastName'].toLowerCase().includes(text) ||
          (transaction['firstName'] + ' ' + transaction['lastName'])
            .toLowerCase()
            .includes(text)
        )
      })

      setTransactions(search)
    }
  }

  const onCancelPress = () => {
    setTransactions(transactionHolder)
  }

  return (
    <View style={{ flex: 1 }}>
      <Header Name={'Widthraw Requests'} />

      <SearchBar
        placeholder='Search for User Name'
        onChangeText={text => onSerch(text)}
        onPress={() => onSerch('')}
        onClearPress={onCancelPress}
        searchIconImageStyle={{
          tintColor: Primary
        }}
        clearIconImageStyle={{
          tintColor: 'red'
        }}
        style={{
          height: hp('6%'),
          width: wp('90%'),
          borderRadius: wp('3%'),
          backgroundColor: 'white',
          marginTop: hp('2%'),
          elevation: 20,
          borderColor: 'black',
          borderWidth: 1
        }}
        textInputStyle={{
          fontSize: hp('2%'),
          color: 'black',
          padding: wp('2%')
        }}
      />

      {loading ? (
        <DataLoader
          isVisible={loading && transactions.length != 0}
          data={'loading'}
        />
      ) : null}

      {!loading && transactions.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                loadMore(true)
                setRefreshing(false)
              }}
            />
          }
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop : hp('22%')
            }}
          >
            <MaterialIcons
              name='request-quote'
              size={hp('15%')}
              color='gray'
              style={{ alignSelf: 'center' }}
            />
            <Text style={{ fontSize: hp('2%'), alignSelf: 'center' }}>
              No Withdrawl Requests
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          style={{
            flex: 1,
            height: transactions.length == 0 ? hp('0%') : hp('100%')
          }}
          data={transactions}
          onEndReached={() => {
            console.log('End reached')
            loadMore()
          }}
          onEndReachedThreshold={0.5}
          keyExtractor={(item, index) => index.toString()}
          renderItem={RenderUI}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true)
            loadMore(true)
            setRefreshing(false)
          }}
          ListFooterComponent={
            loading && transactions.length != 0 ? (
              <DataLoader
                isVisible={loading && transactions.length != 0}
                data={'loading'}
              />
            ) : null
          }
        />
      )}
    </View>
  )
}

export const style = StyleSheet.create({
  Text: {
    marginLeft: wp('3%'),
    fontSize: hp('2.2%'),
    color: 'black',
    fontWeight: 'bold'
  }
})
