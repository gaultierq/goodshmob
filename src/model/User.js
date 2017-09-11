import LoginManager from "../managers/LoginManager";
import Base from "./Base";

export default class User extends Base {

    static current() {
        return LoginManager.currentUser();
    }
}

