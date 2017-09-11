import Base from "./Base";

export class Invitation extends Base {
    invitations;
    first_name;
    last_name;
    emails;
    phones;
    state;
    inviter;


    full_name() {
        return `${this.first_name} ${this.last_name}`;
    }
}
