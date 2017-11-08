
import RNFirebase from 'react-native-firebase'

export function load() {
    console.info("fcm:load");
    let firebase = RNFirebase.app();

    let messaging = firebase.messaging();

    messaging.getToken().then((token)=>{
        console.info("fcm:token="+token);
    }, (err) => console.log(err))

    messaging.onMessage((message)=>console.log("message received from fcm: "+ JSON.stringify(message)));

}