in ./keystores/
keytool -genkey -v -keystore goodsh-dev.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias goodsh-dev -keypass goodsh-dev -storepass goodsh-dev -dname "CN=Goodshit Dev,O=Goodshit,C=FR"


rm -r ./node_modules/jest/node_modules/jest-cli/node_modules/.bin
rm -r ./node_modules/node-pre-gyp/node_modules/.bin
rm -r ./node_modules/node-pre-gyp/node_modules/request/node_modules/.bin