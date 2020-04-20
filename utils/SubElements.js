export default class SubElements {
    element;
    constructor(element){
        this.element = element;
    }

    static camelize(str) {
        const wordArray = str
            .replace(/\[*\]*/g,'')
            .toLowerCase()
            .split(/-/);

        wordArray.splice(0, 1);
        
        return wordArray[0] + wordArray.slice(1).map(word => word[0].toUpperCase() + word.slice(1)).join('');
    }

    subElements(attribute) {
        const nameField = SubElements.camelize(attribute);
        return Array.from(this.element.querySelectorAll(attribute)).reduce(
            (res, subElement) => ((res[subElement.dataset[nameField]] = subElement), res),
            {}
        );
    }
}