// Задерживающий декоратор
const delayDecorator = (f, delay) => (...arg) => setTimeout(f, delay, ...arg);

function f(x) {
	console.log(x);
}

function f2(x, y) {
	console.log(x, y);
}

// создаём обёртки
let f1000 = delayDecorator(f, 1000);
let f1500 = delayDecorator(f, 1500);
let f2000 = delayDecorator(f2, 2000);

f1000("test"); // показывает "test" после 1000 мс
f1500("test"); // показывает "test" после 1500 мс
f2000(1, 2);
