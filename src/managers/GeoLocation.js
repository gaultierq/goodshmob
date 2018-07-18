// @flow
import {PermissionsAndroid, Platform} from 'react-native'
import type {Position} from "../types"

class _GeoLocation implements GeoLocation {


    getPosition(): Promise<Position> {
        return this.getPositionAndSaveIt().then(position => position.coords, err => {throw err});
        // console.log(`current position=${JSON.stringify(this.currentPosition)}`);
        // return this.currentPosition && this.currentPosition.coords;
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

    getPositionAndSaveIt = () => {
        return new Promise(async (resolve, reject) => {
            const hasLocationPermission = await this.hasLocationPermission();

            if (hasLocationPermission) {
                navigator.geolocation.getCurrentPosition(position => {
                        resolve(position);
                    },
                    (error) => {
                        console.log('Error requesting position', error);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 10000,
                        distanceFilter: 50
                    }
                );
            } else {
                reject('We do not have location permission');

            }
        });


    };



}
export interface GeoLocation {

    init(): void;

    getPosition(): Promise<Position>;
}

module.exports = new _GeoLocation();
