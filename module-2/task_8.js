const trimSymbols = (str, count) => {
	if (!count) return "";

	let result = "";
	let c = 0;
	let r = "";

	str.split("").forEach(char => {
		debugger;

		let lastChar = r[r.length - 1];

		if (!lastChar) {
			r += char;
		} else {
			if (lastChar != char) {
				c = 0;
				r = char;
				++c;
			}

			// if (c == 0) {
			//     result += char;
			//     ++c;
			// }

			if (lastChar == char && c < count) {
				r += char;
				++c;
			}

			if (r.length == count) {
				result += r;
				r = "";
			}
		}
	});

	return result;
};

console.log(trimSymbols("xxxaaaaab", 1)); // 'xab'
