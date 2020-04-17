export const invertObj = (obj) =>
	obj &&
	Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));

function invertObj_BAD(obj) {
	if (!obj) {
		return;
	}

	Object.entries(obj).forEach(([key, value]) => {
		obj[value] = key;
		delete obj[key];
	});

	return obj;
}
/**
 * invertObj - should swap object keys and values
 * @param {object} obj
 * @returns {object | undefined}
 */
function invertObj_v2(obj) {
	if (obj) {
		return Object.entries(obj).reduce((accum, [key, value]) => {
			accum[value] = key;
			return accum;
		}, {});
	}
}
