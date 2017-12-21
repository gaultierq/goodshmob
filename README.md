== Mobile app for goodsh ==

NB: lineup.savings => the savings will be read once from data store. data store update won't be reflected on lineup.savings


java.io.IOException: Duplicate zip entry [classes.jar:com/google/android/gms/internal/zzfgf.class]

update app/build.gradle with latest google service version

./gradlew :app:dependencies | grep google | grep '>'


./node_modules/flow-bin/flow-osx-v0.57.3/flow check --show-all-errors | grep 'Error: src'