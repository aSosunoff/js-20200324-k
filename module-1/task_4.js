function sum(num) {
	const s = n => (num += n, s);
	s.toString = () => num;
	return s;
}

console.log(sum(1)(2)(3)(5));
console.log(sum(1));
console.log(sum(1)(2));
