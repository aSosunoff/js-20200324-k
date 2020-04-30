const debounceDecorator = (f, delay = 0) => {
	let timer = null;

	return (...arg) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}

		timer = setTimeout(() => {
			f.apply(this, arg);
			clearTimeout(timer);
			timer = null;
		}, delay);
	};
};

export default class InfinityScroll {
	get checkBottomBorder() {
		const { bottom } = document.documentElement.getBoundingClientRect();
		const { clientHeight } = document.documentElement;
		return bottom < clientHeight + 100;
	}

	constructor(element) {
		this.element = element;
		this.onScroll = debounceDecorator(this.onScroll, 100);
		this.render();
	}

	render() {
		this.initEventListeners();
	}

	dispatchEvent() {
		this.element.dispatchEvent(
			new CustomEvent("infinity-scroll", {
				bubbles: true,
				/* detail: {
			start: this.start,
			end: this.end
		  } */
			})
		);
	}

	initEventListeners() {
		document.addEventListener("scroll", this.onScroll);
	}

	removeEventListeners() {
		document.removeEventListener("scroll", this.onScroll);
	}

	destroy() {
		this.removeEventListeners();
	}

	onScroll = (event) => {
		if (this.checkBottomBorder) {
			this.dispatchEvent();
		}
	};
}
