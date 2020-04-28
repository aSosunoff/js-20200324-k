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

    const div = document.createElement('div');
    div.append(element);

    return Array.from(div.querySelectorAll(attribute)).reduce(
        (res, subElement) => ((res[subElement.dataset[nameField]] = subElement), res),
        {}
    );
}