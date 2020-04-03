function sum (a, b) {
    return a + b;
}

const cacheDecorator = func => {
    let cache = new Map();

    return (...arg) => {
        if(!cache.has(`${arg}`)) {
            cache.set(`${arg}`, func.apply(this, arg));
        }
        return cache.get(`${arg}`);
    };
};

sum = cacheDecorator(sum);

console.log(sum(1,2));
console.log(sum(1,2));
console.log(sum(1,2));