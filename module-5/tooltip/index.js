class Tooltip {
	static instance;
	
	options = {};
	element;

	constructor() {
		if (Tooltip.instance) {
			return Tooltip.instance;
		}

		this.onPointerOver = this.onPointerOver.bind(this);
		this.onPointerOut = this.onPointerOut.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);

		Tooltip.instance = this;
	}

	showTooltip(text) {
		this.element = document.createElement(this.options.tag);
		this.element.className = this.options.className;
		this.element.innerHTML = text;
		document.body.append(this.element);
	}

	onPointerOver(e) {
		const spaceTooltip = e.target.closest("[data-tooltip]");
		if (!spaceTooltip) return;
		this.showTooltip(spaceTooltip.dataset.tooltip);
		document.addEventListener("pointermove", this.onPointerMove);
	}

	onPointerOut(e) {
		if (!this.element) return;
		this.element.remove();
		this.element = null;
		document.removeEventListener("pointermove", this.onPointerMove);
	}

	onPointerMove(e) {
		let newX = e.clientX + 10;
		let newY = e.clientY + 10;

		if (newX + this.element.offsetWidth > document.documentElement.clientWidth) {
			newX = document.documentElement.clientWidth - this.element.offsetWidth
		}

		if (newY + this.element.offsetHeight > document.documentElement.clientHeight) {
			newY = document.documentElement.clientHeight - this.element.offsetHeight
		}

		this.element.style.left = `${newX}px`;
		this.element.style.top = `${newY}px`
	}

	initEventListeners() {
		document.addEventListener("pointerover", this.onPointerOver);
		document.addEventListener("pointerout", this.onPointerOut);
	}

	initialize({ className = 'tooltip', tag = 'div' } = {}) {
		this.options = {
			className,
			tag,
		}

		this.initEventListeners();
	}

	render(text) {
		this.showTooltip(text);
	}

	destroy() {
		if (this.element) {
			this.element.remove();
			this.element = null;
		};
		document.removeEventListener("pointerover", this.onPointerOver);
		document.removeEventListener("pointerout", this.onPointerOut);
	}
}

export default new Tooltip();
