/* 
Результатом декоратора debounce(f, ms) должна быть обёртка, которая передаёт вызов f не более одного раза в ms миллисекунд. 
Другими словами, когда мы вызываем debounce, это гарантирует, что все остальные вызовы будут игнорироваться в течение ms. 
*/

/* const debounceDecorator = (f, delay) => {
    let timer = null;
    
	return (...arg) => {
		if (timer) return;

		f.apply(this, arg);

		if (!delay) return;

		timer = setTimeout(() => {
			clearTimeout(timer);
			timer = null;
		}, delay);
	};
}; */

const debounceDecorator = (f, delay = 0) => {
    let timer = null;
    
	return (...arg) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		};		

		timer = setTimeout(() => {
			f.apply(this, arg);
			clearTimeout(timer);
			timer = null;
		}, delay);
	};
};

// let f = debounceDecorator(console.log, 100);

// f(1); // выполняется немедленно
// f(2); // проигнорирован

// setTimeout(() => f(3), 90); // проигнорирован (прошло только 100 мс)
// setTimeout(() => f(4), 190); // проигнорирован (прошло только 100 мс)
// // setTimeout(() => f(5), 10); // проигнорирован (прошло только 100 мс)
// // setTimeout(() => f(6), 110); // выполняется
// // setTimeout(() => f(7), 120); // проигнорирован (прошло только 400 мс от последнего вызова)
// // setTimeout(() => f(8), 220); // проигнорирован (прошло только 400 мс от последнего вызова)
