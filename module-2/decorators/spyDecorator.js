// Декоратор-шпион
const spyDecorator = f => {
	const  wrapper = (...arg) => {
		wrapper.calls.push(arg);
		return f.apply(this, arg);
	}

	wrapper.calls = [];

	return wrapper;
};

// произвольная функция или метод
function work(a, b) {
	return a + b;
}

work = spyDecorator(work);

console.log(work(1, 2));
console.log(work(3, 2));
console.log(work.calls);


