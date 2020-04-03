export function trimSymbols(str, count) {
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
