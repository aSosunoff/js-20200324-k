function createGetter(field) {
	let arrField = field.split(".");

	return obj =>
		arrField.reduce((r, e) => {
			return r[e];
		}, obj);
}

const product = {
	category: {
		title: "Goods"
	}
};

const getter = createGetter("category.title");
console.error(getter(product)); // Goods
