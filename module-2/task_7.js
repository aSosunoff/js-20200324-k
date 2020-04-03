const obj = {
	foo: "bar"
};

const invertObject = obj => obj && Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key])
);

console.log(invertObject(obj)); // {bar: 'foo'}