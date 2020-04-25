export default class HTMLBulder{
    static getElementFromString(htmlString) {
        const div = document.createElement("div");
        div.innerHTML = htmlString.trim();
        return div.firstElementChild;
    }

    static createUploadImageInput(callbackChange) {
        let inputFile = document.querySelector('input[data-file-load="file-load"][type="file"]');
        if (!inputFile) {
            inputFile = document.createElement("input");
            inputFile.dataset.fileLoad = "file-load";
            inputFile.type = "file";
            inputFile.multiple = true;
            inputFile.accept = "image/*";
            inputFile.hidden = true;
            document.body.appendChild(inputFile);
        }
        inputFile.onchange = callbackChange;
        inputFile.click();
    }
}