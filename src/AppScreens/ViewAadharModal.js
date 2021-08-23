import React from 'react'
import { Modal, View, Image } from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
function ViewAadharModal (props) {
  return (
    <Modal
      isVisible={props.isVisible}
      onBackButtonPress={() => props.setamodal(false)}
      onBackdropPress={() => props.setamodal(false)}
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
            uri:
              'https://firebasestorage.googleapis.com/v0/b/angelcoating-737a7.appspot.com/o/Aadhar_Images_Users%2FjAYEfcwZC6XtHpTJwOcwm7N7i3p1%2Fimg%2F6f1ea165-b007-bf30-4836-16d8-2b8a-0ac4.jpg?alt=media&token=160b3067-8626-4c2e-8ebe-64e99db7bb22'
          }}
          style={{ height: hp('70%'), width: wp('80%'), resizeMode: 'contain' }}
        />
      </View>
    </Modal>
  )
}

export default ViewAadharModal
