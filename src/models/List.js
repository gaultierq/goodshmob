import Base from "./Base";

export default class List extends Base {

    createdAt;
    name;
    primary;
    privacy;
    savings;
    user;

    savings_count() {
        //self.meta.fetch("savings-count", 0).to_i
    }
}
