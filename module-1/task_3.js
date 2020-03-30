const camelize = str => {
	return `${str || ""}`
		.split("-")
		.map((e, inx) => (!inx ? e : e[0].toUpperCase() + e.slice(1)))
		.join("");
};

console.log(camelize("background-color"));
console.log(camelize("list-style-image"));
console.log(camelize("-webkit-transition"));
console.log(camelize("transition"));
console.log(camelize(""));
console.log(camelize());
