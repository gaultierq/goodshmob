# == Mobile app for goodsh ==

## Lib
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

java.io.IOException: Duplicate zip entry [classes.jar:com/google/android/gms/internal/zzfgf.class]

update app/build.gradle with latest google service version

./gradlew :app:dependencies | grep google | grep '>'

./node_modules/flow-bin/flow-osx-v0.57.3/flow check --show-all-errors | grep 'Error: src'

## Troubleshooting
On Android, when launching the app on emulator you may end up with error :

`BUILD SUCCESSFUL in 7s...`<br/>
`Error type 3`<br/>
`Error: Activity class {it.goodsh.mob/it.goodsh.mob.MainActivity} does not exist.`<br/>

The app is installed but doesn't launch automatically, just navigate to applications you may find it already installed
