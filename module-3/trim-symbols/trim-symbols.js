/**
 * trimSymbols
 * @param {string} string
 * @param {number} size
 * @returns {string}
 */
export function trimSymbols(string, size) {
	const firstSlice = string.slice(0, size);
	const rest = [...string.slice(size)];

	return rest.reduce((accum, item) => {
		if (!accum.endsWith(item.repeat(size))) {
			accum += item;
		}

		return accum;
	}, firstSlice);
}

function trimSymbols_v2(str, count) {
	if (count === 0 || !str) return "";

	if (!count) return str;

	let charCount = 1;

	return str.split("").reduce((result, char) => {
		if (char != result[result.length - 1]) {
			charCount = 1;
			result += char;
			return result;
		}

		if (charCount < count) {
			result += char;
			charCount++;
		}

		return result;
	});
}
