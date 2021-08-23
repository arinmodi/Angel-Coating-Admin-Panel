import firebase from '@react-native-firebase/app';
import at from '@react-native-firebase/auth';
import db from '@react-native-firebase/database';
import fs from '@react-native-firebase/firestore';

export const f = firebase;
export const auth = at();
export const firestore = fs();
export const database = db();
export const timestamp = firebase.firestore;