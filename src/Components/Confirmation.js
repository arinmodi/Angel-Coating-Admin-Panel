import React from 'react';
import { View,Text, TouchableNativeFeedback, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Card } from 'react-native-paper';
import { Primary } from '../Styles/colors';

export default function Confirmation(props){
    return(
        <View>
            <Modal
                isVisible = {props.isVisible}
                onBackButtonPress= {props.onBackButtonPress}
                onBackdropPress = {props.onBackdropPress}
            >

                <View style={{backgroundColor : 'white',height : hp('20%'),borderRadius  : hp('3%'),overflow : 'hidden'}}>
                    <Text style={{marginTop : hp('3%'),fontSize : hp('2.5%'),color :'black',textAlign : 'center'}}>{props.question}</Text>

                    <View style={{flexDirection : 'row',justifyContent : 'space-around'}}>
                        <View style={{...styles.ButtonMainCon,...{marginHorizontal : wp('0%')}}}>
                            <TouchableNativeFeedback onPress = {props.onPressYes}>
                                <Card style={{...styles.Button,...{width : wp('25%'),backgroundColor : 'red'}}}>
                                    <Text style={styles.Button_text}>Yes</Text>
                                </Card>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={{...styles.ButtonMainCon,...{marginHorizontal : wp('0%')}}}>
                            <TouchableNativeFeedback onPress = {props.onPressNo}>
                                <Card style={{...styles.Button,...{width : wp('25%')}}}>
                                    <Text style={styles.Button_text}>No</Text>
                                </Card>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    ButtonMainCon : {
        marginTop : hp('4%'),
        marginHorizontal : wp('30%'),
    },
    Button : {
        width:wp('25%'),
        height:hp('6%'),
        backgroundColor : Primary,
        alignItems:'center',
        elevation:10,
        borderWidth : 1,
    },
    Button_text : {
        color : 'white',
        fontSize:hp('3%'),
        marginTop : hp('0.5%')
    }
})