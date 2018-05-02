# Goodsh mobile

## Setup

Use the following versions:

* node 9.3
* npm 5.6.0
* cocoapods 1.4.0

To install `cocoapods` you might need to run the command:

```bash
sudo gem install cocoapods
```

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

Once I had to add local.properties in ./android with : `sdk.dir=/Users/qg/Library/Android/sdk` not sure why...

In order to build the app on your Android device (without running the packager), you can use the following command:

```bash
react-native run-android --no-packager
```

Make sure your android device has the developer options enabled and the `USB debugging` as well as the `Install via USB` option enabled in order to authorize the installation the local app via USB.

Then, once the previous command is completed, you should see a new app installed on your device.

You are now ready to run the packager with the following command:

```bash
yarn start
```

If you want to know how to setup a virtual device, you can use [android studio](https://developer.android.com/studio/run/managing-avds.html) or install [genymotion](https://www.genymotion.com/download/).

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

- Deeplinking

-- ios
```
xcrun simctl openurl booted https://goodshitapp-staging.herokuapp.com/lists/eb124127-5ec7-428c-bb7c-1c82f994ddc2
```


--android
```
adb shell am start \
        -W -a android.intent.action.VIEW \
        -d https://goodshitapp-staging.herokuapp.com/sendings/98e59b99-ba77-4781-9842-9e5d02b13d7c it.goodsh.mob.debug
```


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
