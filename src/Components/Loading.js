import React from 'react';
import { View,Text, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default function Loading(props){
    return(
        <View style={{flex:1}}>
            <Modal
                isVisible = {props.isVisible}
                animationIn = {"fadeIn"}
            >
                <View style={{backgroundColor : 'white',height : hp('20%'),marginHorizontal : wp('10%'),borderRadius : wp('5%')}}>
                    <ActivityIndicator color = "blue" size = "large" style ={{marginTop : wp('8%')}}/>
                    <Text style={{textAlign : 'center',marginTop : hp('2%'),fontSize : hp('2%'),color : 'black'}}>{props.data}...</Text>
                </View>
            </Modal>
        </View>
    )
} 