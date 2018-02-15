# == Mobile app for goodsh (prod) ==


## Setup
Use the following versions:
* node 9.3
* npm 5.6.0
* pod 1.4.0.rc.1

## Install
1. git clone git@github.com:bennytac/goodshmob.git
2. cd goodshmob
3. cp env.local .env
4. yarn
5. pod install --project-directory=ios (for iOS)

## Notes

NB: lineup.savings => the savings will be read once from data store. data store update won't be reflected on lineup.savings


display flow errors:  
`./node_modules/flow-bin/flow-osx-v0.57.3/flow check --show-all-errors | grep 'Error: src'`

## Debugging

`.env` file contains plenty of options to configure your app.  
1. display console.logs:   
 `ENABLED_LOGS=log,debug,info,warn,error`
   
2. show RN menu on android device: `adb shell input keyevent 82`

3. tester la preprod, avec le debugger et les logs:  
dans `RCTDefines.h` set `RCT_DEV 1`

4. debug menu accessible depuis le menu profile, en cliquant 5 fois de suite rapidement sur le numero de version


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


#### Cannot follow symbolic link
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
