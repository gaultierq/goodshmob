// @flow
import {
    Platform,
    PermissionsAndroid
} from 'react-native';
import type {Position} from "../types";

class _GeoLocation implements GeoLocation {

    currentPosition: Position;


    getPosition() {
        this.getPositionAndSaveIt();
        console.log(`current position=${JSON.stringify(this.currentPosition)}`);
        return this.currentPosition && this.currentPosition.coords;
    }


    hasLocationPermission = async () => {
        if (Platform.OS === 'ios' ||
            (Platform.OS === 'android' && Platform.Version < 23)) {
            return true;
        }

        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) return true;

        const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            console.log('Location permission denied by user.');
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('Location permission revoked by user.');
        }

        return false;
    };

    getPositionAndSaveIt = async () => {
        const hasLocationPermission = await this.hasLocationPermission();

        if (!hasLocationPermission) {
            console.log('We do not have location permission')
            this.currentPosition = null;
        }

        navigator.geolocation.getCurrentPosition(position => {
                this.currentPosition = position;
                console.log(position);
            },
            (error) => {
                console.log('Error requesting permission', error)
                this.currentPosition = null
            },
            { enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 50
            }
        );

    };



}
export interface GeoLocation {

    init(): void;

    getPosition(): Position;
}

module.exports = new _GeoLocation();
