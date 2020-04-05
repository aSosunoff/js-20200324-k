let toForEachCustom = Symbol.for("toForEachCustom");

let id = Symbol("ID");

class User {
	name;
	age;
	[id];

	constructor(name, age) {
		this[id] = `f${(+new Date()).toString(16)}`;
		this.name = name;
		this.age = age;
	}

	[toForEachCustom]() {
		return `${this[id]}-${this.name}-${this.age}`;
	}
}

const getRundomName = () => ["Alex", "Bill", "Egor"][Math.trunc(Math.random() * 3)];
const getRundomAge = () => Math.trunc(Math.random() * 20) + 10;

const users = [];

for (let i = 1; i <= 10; i++) {
	users.push(
		new User(
			getRundomName(),
			getRundomAge(),
		)
	);
}

export { users, User };
