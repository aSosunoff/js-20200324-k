function sum(num) {
	const s = n => (num += n, s);
	s[Symbol.toPrimitive] = () => num;
	return s;
}

console.log(sum(1)(2)(3)(5));
console.log(sum(1));
console.log(sum(1)(2));


const user = {
	name: 'Alex',
	age: 10,
	[Symbol.toPrimitive](hint) {
		return hint === "string" ? this.name : this.age;
	},
}