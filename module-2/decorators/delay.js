// Задерживающий декоратор
const delay = (f, delay) => (...arg) => setTimeout(f, delay, ...arg);

function f(x) {
	console.log(x);
}

function f2(x, y) {
	console.log(x, y);
}

// создаём обёртки
let f1000 = delay(f, 1000);
let f1500 = delay(f, 1500);
let f2000 = delay(f2, 2000);

f1000("test"); // показывает "test" после 1000 мс
f1500("test"); // показывает "test" после 1500 мс
f2000(1, 2);
