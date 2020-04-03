function createGetter(str) {
	let propertyPath = str.split(".");

	return obj => propertyPath
		.reduce((obj, property) => !obj ? obj : obj[property], obj);
}

const product = {
	category: {
		title: "Goods"
	}
};

const getter = createGetter("category.title");
console.error(getter(product)); // Goods
