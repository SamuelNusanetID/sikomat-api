import * as firebase from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from './sikomat-apps-firebase-adminsdk-32zil-af3ae51c15.json';

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount as ServiceAccount),
});

module.exports.admin = firebase;

export { firebase };
