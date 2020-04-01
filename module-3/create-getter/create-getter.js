export function createGetter(str) {
	let arrField = str.split(".");

	return obj =>
		arrField.reduce((r, e) => {
			return r[e];
		}, obj);
}
