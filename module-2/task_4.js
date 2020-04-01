let salaries = {
	John: 100,
	Pete: 300,
	Mary: 250
};

const topSalary = sal => {
	let maxName = '';
	let maxSal = 0;

	Object.entries(sal).forEach(([name, sal]) => {
		if (s > maxSal) {
			maxName = name;
			maxSal = sal;
		}
	});

	return name;
};

console.log(topSalary(salaries));