export default class HTMLBulder{
    static getElementFromString(htmlString) {
        const div = document.createElement("div");
        div.innerHTML = htmlString.trim();
        return div.firstElementChild;
    }

    static createUploadImageInput(callbackChange) {
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.multiple = true;
		inputFile.accept = "image/*";
		inputFile.hidden = true;
        inputFile.addEventListener('change', callbackChange);
        inputFile.click();
		document.body.appendChild(inputFile);
    }
}