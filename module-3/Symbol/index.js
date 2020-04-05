import { users, User } from "./libs.js";

let id = Symbol("ID");

let toForEachCustom = Symbol.for("toForEachCustom");

users.forEach((user, inx) => {
    user[id] = `inx_${inx + 1}`;
    user[toForEachCustom] = () => {
        return `${user.name} ${user.age}`
    }
});

let user5 = users.find((e) => e[id] === "inx_5");
user5.name = user5.name.toUpperCase();
user5.new_property = "QWERTY";

window.users = users;

//---
class Admin extends User {
    constructor(name, age) {
        super(name, age);
    }

    [toForEachCustom]() {
        return `Admin: ${this.name} ${this.age}`
    }
}

window.admin = new Admin('admin', 26);