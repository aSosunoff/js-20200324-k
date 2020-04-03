const throttlingDecorator = (f, delay) => {
    let timer = null;
    let lastArg = null;

	return (...arg) => {
		if (timer) {
            lastArg = arg;
            return;
        };

        f.apply(this, arg);
        
        if (!delay) return;

		timer = setTimeout(() => {
            if(lastArg)
                f.apply(this, lastArg);

            lastArg = null;
            clearTimeout(timer);
        }, delay);
	};
};

const f = (a) => console.log(a);

// f1000 передаёт вызовы f максимум раз в 1000 мс
let f1000 = throttlingDecorator(f, 1000);

f1000(1); // показывает 1
f1000(2); // (ограничение, 1000 мс ещё нет)
f1000(3); // (ограничение, 1000 мс ещё нет)

// когда 1000 мс истекли ...
// ...выводим 3, промежуточное значение 2 было проигнорировано
