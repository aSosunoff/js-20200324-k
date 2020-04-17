export function createGetter(str) {
	let propertyPath = str.split(".");

	return (obj) =>
		propertyPath.reduce((obj, property) => (!obj ? obj : obj[property]), obj);
}
/**
 * createGetter
 * @param {string} path
 * @returns {function}
 */
function createGetter_v2(path) {
	const pathArray = path.split(".");

	return (obj) => {
		let result = obj;

		for (let item of pathArray) {
			if (typeof result[item] !== "undefined") {
				result = result[item];
			} else {
				result = undefined;
				break;
			}
		}

		return result;
	};
}

function createGetterRecursion(path) {
	const pathArray = path.split(".");

	return (obj) => {
		let result = obj;

		const getValue = (arr) => {
			if (arr.length && result) {
				result = result[arr.shift()];
				return getValue(arr);
			} else {
				return result;
			}
		};

		return getValue(pathArray);
	};
}
