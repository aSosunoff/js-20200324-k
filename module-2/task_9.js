const uniq = arr => {
    return [...new Set(arr)];
};

console.log(uniq([1, 2, 2, 3, 1, 4])); // [1, 2, 3, 4]