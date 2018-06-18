//@flow
import 'es6-symbol/implement';
import glob from "./src/global"
import App from './src/app'


glob()
global.__APP__ = new App();