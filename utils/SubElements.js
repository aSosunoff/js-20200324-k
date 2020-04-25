const camelize = (str) => {
    const wordArray = str
        .replace(/\[*\]*/g,'')
        .toLowerCase()
        .split(/-/);

    wordArray.splice(0, 1);
    
    return wordArray[0] + wordArray.slice(1).map(word => word[0].toUpperCase() + word.slice(1)).join('');
}

export default (element, attribute) => {
    const nameField = camelize(attribute);

    return Array.from(element.querySelectorAll(attribute)).reduce(
        (res, subElement) => ((res[subElement.dataset[nameField]] = subElement), res),
        {}
    );
}