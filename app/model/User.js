
import LoginManager from "../managers/LoginManager";

export default class User {

    static current() {
        return LoginManager.currentUser();
    }
}

