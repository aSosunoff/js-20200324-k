// Пример:

function returnTrue0(a) {
	return a;
}

console.assert(returnTrue0(true), "should return true");

// Задачи:

function returnTrue1(a) {
	return typeof a !== "object" && !Array.isArray(a) && a.length === 4;
}

function returnTrue2(a) {
	return a !== a;
}

function returnTrue3(a, b, c) {
	return a && a == b && b == c && a != c;
}

function returnTrue4(a) {
	return a++ !== a && a++ === a;
}

function returnTrue5(a) {
	return a in a;
}

function returnTrue6(a) {
	return a[a] == a;
}

function returnTrue7(a, b) {
	return a === b && 1 / a < 1 / b;
}

function TEST(a, b) {
	return a === b;
}

let a = {
	toString: () => 1,
};

let b = {
	toString: () => 1,
};

[
	[returnTrue1, "0000"],
	[returnTrue2, NaN],
	[returnTrue3, [0], 0, [0]],
	[returnTrue4, Number.MAX_SAFE_INTEGER],
	[returnTrue5, [0]],
	[returnTrue6, [0]],
	[TEST, a, b]
	// [returnTrue7, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 2],
].forEach(([f, ...arg]) => {
	console.assert(f.apply(null, arg), `should return true ${f}`);
});
