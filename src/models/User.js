import LoginManager from "../managers/LoginManager";
import Base from "./Base";

export default class User extends Base {

    firstName;
    provider;
    uid;
    lastName;
    image;
    email;
    timezone;
    goodshbox;
    lists;

    static fullname(u: User) {
        return `${u.firstName} ${u.lastName}`;
    }
}

