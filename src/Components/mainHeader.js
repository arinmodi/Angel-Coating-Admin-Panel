import React from 'react';
import { View, Text } from 'react-native';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Ionicons } from '../Icons/icons';

export default function Header(props){
    return(
        <View  style={{height : hp('10%'),backgroundColor:'#702f8b',borderBottomRightRadius : wp('18%')}}>
            <View style={{flexDirection:'row',marginTop:hp('2.5%'),marginBottom : hp('2%')}}>
                <View style = {{flex : 1,alignItems : 'center'}}>
                    <Text style={{fontSize:hp('2.5%'),color:'white',marginTop : hp('0.5%'),fontWeight : 'bold'}}>{props.Name}</Text>
                </View>
            </View>
        </View>
    )
}