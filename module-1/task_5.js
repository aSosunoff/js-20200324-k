function sortStrings(arr, direction) {
	const arrSort = arr.sort(new Intl.Collator().compare);
	
	return direction === "asc"
		? arrSort
		: arrSort.reverse();
}

console.log(sortStrings(["b", "a", "c"], "asc"));
console.log(sortStrings(["b", "a", "c"], "desc"));

console.log(sortStrings(["ソ", "セ"], "asc"));
console.log(sortStrings(["ソ", "セ"], "desc"));
