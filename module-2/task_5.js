let calculator = {
    a: 0, 
    b: 0,
    read: () => {
        const returnNumber = () => {
            let e = prompt('Введите число');
            return isFinite(e) && e ? parseInt(e) : 0;
        }
        
        this.a = returnNumber();
        this.b = returnNumber();
    },
    sum: () => {
        return this.a + this.b;
    },
    mul: () => {
        return this.a * this.b;
    }
};

calculator.read();
alert(calculator.sum());
alert(calculator.mul());
