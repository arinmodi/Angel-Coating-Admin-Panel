import React from 'react';
import { StyleSheet } from 'react-native';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export const main = StyleSheet.create({
    loginImage : {
        height : hp("48%"),
        width : wp('100%'),
        resizeMode : 'contain',
        justifyContent : 'center'
    },

    loginLogo : {
        height : hp('12%'),
        width : hp('12%'),
        alignSelf : 'center',
        marginTop : -hp('5%'),
        resizeMode : 'contain'
    },
    
    companyName : {
        alignSelf : 'center',
        color : 'white',
        marginTop : hp('5%'),
        fontSize : hp('3%'),
        fontWeight : 'bold'
    },

    buttonStyle : {
        backgroundColor : '#e03580',
        marginVertical : hp('4%'),
        marginHorizontal : wp('5%'),
        height : hp('8%'),
        borderRadius : wp('5%'),
        justifyContent : 'center'
    },

    Labels : {
        flexDirection : 'row',
        marginTop : hp('3%')
    },

    inputContainer : {
        marginHorizontal : wp('5%'),
        marginTop : hp('4%'),
        elevation : 5,
        height : hp('10%'),
        borderRadius : wp('3%'),
        overflow : 'hidden',
        borderWidth : 0.5
    },

    inputicon : {
        marginLeft : wp('5%'),
        marginTop : hp('2.8%')
    },

    input : {
        marginLeft : wp('5%'),
        fontSize : hp('2.5%'),
        marginTop : hp('1%')
    },

    Label : {
        textAlign : 'center',
        fontSize : hp('3%'),
        color : 'black',
        fontWeight : 'bold'
    },

    content : {
        textAlign : 'center',
        marginTop : hp('1%'),
        color : 'black',
        fontSize : hp('2.5%'),
        marginHorizontal : wp('3%')
    }
});