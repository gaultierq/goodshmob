# Goodsh mobile

## Setup

Use the following versions:

* node 9.3
* npm 5.6.0
* pod 1.4.0.rc.1

## Install

```
git clone git@github.com:bennytac/goodshmob.git
cd goodshmob
cp env.local .env
yarn
pod install --project-directory=ios
```

## Running

### Android

Depending on whether you are willing to use a physical or virtual device, below you will find the explanation on how to run the app on a physical device. If you are willing to use a virtual device take a look [here](https://developer.android.com/studio/run/managing-avds.html).

If you are running the app for the first time, you will need to use the command line:

```bash
react-native run-android
```

Make sure your android device has the developer options enabled and the `USB debugging` as well as the `Install via USB` option enabled in order to authorize the installation the local app via USB.

Then, once the previous command is completed, you should see a new app installed on your device.

You are now ready to run the app anytime with the following command:

```bash
yarn start
```

## Debugging

The `.env` file contains plenty of options to configure your app.

- display console.logs:   
 `ENABLED_LOGS=log,debug,info,warn,error`

- show RN menu on android device:   
`adb shell input keyevent 82`

- tester la preprod, avec le debugger et les logs:  
dans `RCTDefines.h` set `RCT_DEV 1`

- Debug menu can be open from profile screen: 5 clicks on version number

- Display flow errors:  
`./node_modules/flow-bin/flow-osx-v0.57.3/flow check --show-all-errors | grep 'Error: src'`

## Troubleshooting

1. On Android, when launching the app on emulator you may end up with error :
   ```
   BUILD SUCCESSFUL in 7s...
   Error type 3
   Error: Activity class {it.goodsh.mob/it.goodsh.mob.MainActivity} does not exist.
   ```
    The app is installed but doesn't launch automatically, just navigate to applications you may find it already installed


2. `java.io.IOException: Duplicate zip entry [classes.jar:com/google/android/gms/internal/zzfgf.class]`

    update app/build.gradle with latest google service version  

    You can check before which version is resolved:  
    `./gradlew :app:dependencies | grep google | grep '>'`


3. Cannot follow symbolic link
   ```  
   rm -rf ./node_modules/node-pre-gyp/node_modules/.bin/rc \
   rm -rf ./node_modules/node-pre-gyp/node_modules/request/node_modules/.bin/uuid \
   rm -rf ./node_modules/react-native/node_modules/jest-haste-map/node_modules/sane/node_modules/.bin/watch \
   rm -rf ./node_modules/envify/node_modules/.bin/esparse \
   rm -rf ./node_modules/envify/node_modules/.bin/esvalidate \
   rm -rf ./node_modules/jest/node_modules/jest-cli/node_modules/.bin/jest-runtime \
   rm -rf ./node_modules/node-pre-gyp/node_modules/.bin/detect-libc \
   rm -rf ./node_modules/node-pre-gyp/node_modules/.bin/nopt
   ```
