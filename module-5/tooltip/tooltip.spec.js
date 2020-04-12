import * as module from "./index";

const { default: tooltip } = module;

describe("tooltip", () => {
	beforeEach(() => {
		tooltip.initialize();
		document.body.append(
			createElementFromHTML('<div data-tooltip="foo"></div>')
		);
	});

	afterEach(() => {
		tooltip.destroy();
		document.body.innerHTML = '';
	});

	it("should be rendered correctly", () => {
		const text = "Test text";
		tooltip.render(text);
		expect(tooltip.element).toBeVisible();
		expect(tooltip.element).toBeInTheDocument();
		expect(tooltip.element).toHaveTextContent(text);
	});

	it("should be rendered by class name 'tooltip'", () => {
		tooltip.render();
		expect(tooltip.element.classList.contains("tooltip")).toBeTruthy();
	});

	it("should be rendered by class name 'tooltip_2'", () => {
		const className = "tooltip_2";
		tooltip.initialize({ className });
		tooltip.render();
		expect(tooltip.element.classList.contains(className)).toBeTruthy();
	});

	it("should be visible after event 'pointerover'", () => {
		const div = document.querySelector("[data-tooltip]");
		div.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
		expect(document.body).toContainElement(document.querySelector(`.${tooltip.options.className}`));
		expect(document.querySelector(`.${tooltip.options.className}`)).toBeVisible();
		expect(document.querySelector(`.${tooltip.options.className}`)).toBeInTheDocument();
	});

	it("should not be visible after event 'pointerout'", () => {
		const div = document.querySelector("[data-tooltip]");
		div.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
		div.dispatchEvent(new MouseEvent("pointerout", { bubbles: true }));
		expect(document.querySelector(`.${tooltip.options.className}`)).toBeNull();
		expect(document.querySelector(`.${tooltip.options.className}`)).not.toBeInTheDocument();
	});

	it("should be contain text 'foo' from data attribute", () => {
		const div = document.querySelector("[data-tooltip]");
		div.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
		expect(document.querySelector(`.${tooltip.options.className}`)).toHaveTextContent('foo');
	});

	it("should be a singleton realization", () => {
		// ??
	});
});

function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}
