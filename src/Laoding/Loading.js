import React from 'react';
import { LogBox,Text } from 'react-native';
import { f } from '../config/config';
import { View, Image} from 'react-native';
import {
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default class Loading extends React.Component {

  constructor()
  {
    super();
    LogBox.ignoreAllLogs;
  }

  componentDidMount = async () => {

  var that = this;

  const unscribe = f.auth().onAuthStateChanged(
    function(user) {
        if (user) {
          that.props.navigation.navigate('App');
        }else {
          that.props.navigation.navigate('Auth');
        }
        unscribe();
    },
  );

  }

  render(){
    return(
      <View style = {{alignItems : 'center',justifyContent : 'center',flex : 1}}>
      <Image source={require("../../assets/Logo.png")} style = {{height : hp('20%'),width : wp('20%'), resizeMode : 'contain'}}  />
      <Text style = {{fontSize : hp('4%'),marginTop : hp('4%'),fontWeight : 'bold',color : 'black'}}>AngelCoating</Text>
    </View>
    )
  }
}
