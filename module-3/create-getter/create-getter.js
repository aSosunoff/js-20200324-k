export function createGetter(str) {
	let propertyPath = str.split(".");

	return obj => propertyPath
		.reduce((obj, property) => !obj ? obj : obj[property], obj);
}
