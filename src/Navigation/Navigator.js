import React from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome
} from '../Icons/icons'
import { Primary } from '../Styles/colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'

// Login
import Login from '../Authentication/Login'
import OTP from '../Authentication/OTP_Verification'

// App Screens
import Seller from '../AppScreens/SellerRequest'
import widthraw from '../AppScreens/widthrawRequest'
import QrCode from '../AppScreens/QrCodeForm'
import admin from '../AppScreens/New_Admin'
import Reports from '../AppScreens/Reports'
import OneRequest from '../AppScreens/OnewidthawRequest'

// Loading
import Loading from '../Laoding/Loading'

const default_configuration = {
  headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    headerVisible: false
  }
}

const Auth = createStackNavigator(
  {
    main: Login,
    OTP: OTP
  },
  default_configuration
)

const widthrawalscreens = createStackNavigator(
  {
    widthraw: widthraw,
    OneRequest: OneRequest
  },
  default_configuration
)

const Tab = {
  Request: {
    screen: Seller,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => {
        return <AntDesign name='adduser' size={hp('4%')} color={tintColor} />
      }
    })
  },

  widthraw: {
    screen: widthrawalscreens,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => {
        return <FontAwesome name='bank' size={hp('4%')} color={tintColor} />
      }
    })
  },

  Code: {
    screen: QrCode,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => {
        return (
          <MaterialCommunityIcons
            name='qrcode-scan'
            size={hp('4%')}
            color={tintColor}
          />
        )
      }
    })
  },

  Admin: {
    screen: admin,
    navigationOptions: () => ({
      tabBarIcon: ({ tintColor }) => {
        return (
          <MaterialIcons
            name='admin-panel-settings'
            size={hp('4%')}
            color={tintColor}
          />
        )
      }
    })
  }

  // Reports : {
  //     screen : Reports,
  //     navigationOptions : () => ({
  //         tabBarIcon : ({tintColor})=>{
  //           return(
  //             <MaterialIcons name="picture-as-pdf" size={hp('4%')} color={tintColor} />
  //           );
  //         }
  //     })
  // }
}

const AppScreen = createBottomTabNavigator(Tab, {
  tabBarOptions: {
    activeTintColor: 'white',
    inactiveTintColor: 'black',
    activeBackgroundColor: Primary,
    style: {
      height: hp('9%'),
      elevation: 24
    }
  }
})

const Main = createStackNavigator(
  {
    Load: Loading,
    Auth: Auth,
    App: AppScreen
  },
  default_configuration
)

export default createAppContainer(Main)
