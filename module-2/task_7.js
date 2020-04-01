const obj = {
	foo: "bar"
};

const invertObject = obj => {
    Object.entries(obj)
        .forEach(([key, value]) => {
            obj[value] = key;
            delete obj[key];
        });
};

invertObject(obj); // {bar: 'foo'}

console.log(obj);