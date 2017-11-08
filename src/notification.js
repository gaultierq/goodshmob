
import RNFirebase from 'react-native-firebase'

export function load() {
    console.info("fcm:load");
    let firebase = RNFirebase.app();
    
    firebase.messaging().getToken().then((token)=>{
        console.info("fcm:token="+token);
    }, (err) => console.log(err))

}