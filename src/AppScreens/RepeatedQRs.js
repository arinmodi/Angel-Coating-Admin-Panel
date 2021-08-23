import React from 'react'
import {
  View,
  Text,
  TouchableNativeFeedback,
  StyleSheet,
  FlatList
} from 'react-native'
import Modal from 'react-native-modal'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Card } from 'react-native-paper'
import { Primary } from '../Styles/colors'

export default function RepeatedQRs (props) {
  return (
    <View>
      <Modal
        isVisible={props.isVisible}
        onBackButtonPress={props.onBackButtonPress}
        onBackdropPress={props.onBackdropPress}
      >
        <View
          style={{
            alignSelf: 'center',
            backgroundColor: 'white',
            height: hp('50%'),
            borderRadius: hp('3%'),
            overflow: 'hidden',
            width: wp('80%')
          }}
        >
          <Text
            style={{
              marginVertical: hp('3%'),
              fontSize: hp('2.5%'),
              color: 'red',
              textAlign: 'center'
            }}
          >
            {'Repeated QRs'}
          </Text>
          <FlatList
            data={props.data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={data => (
              <View style={{ height: hp('6%'),alignItems : 'center' }}>
                <Text
                  style={{
                    fontSize: hp('2%'),
                    color: 'black',
                    marginHorizontal: wp('3%')
                  }}
                >
                  {data['item']['id']}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ marginTop: hp('2%') }} />}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  ButtonMainCon: {
    marginTop: hp('4%'),
    marginHorizontal: wp('30%')
  },
  Button: {
    width: wp('25%'),
    height: hp('6%'),
    backgroundColor: Primary,
    alignItems: 'center',
    elevation: 10,
    borderWidth: 1
  },
  Button_text: {
    color: 'white',
    fontSize: hp('3%'),
    marginTop: hp('0.5%')
  }
})
