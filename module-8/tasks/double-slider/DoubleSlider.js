import HTMLBulder from '../../../utils/HTMLBulder.js';
import SubElements from '../../../utils/SubElements.js';

export default class DoubleSlider {
	element;
	subElements = {};
	dragElement = {};

	get template() {
		return `
			<div class="range-slider">
				<span data-elem="from"></span>
				<div data-elem="inner" class="range-slider__inner">
					<span class="range-slider__progress" data-elem="progress"></span>
					<span class="range-slider__thumb-left" data-elem="left"></span>
					<span class="range-slider__thumb-right" data-elem="right"></span>
				</div>
				<span data-elem="to"></span>
			</div>`;
	}

	constructor({
		min = 100,
		max = 200,
		formatValue = (value) => value,
		selected = {
			from: min,
			to: max,
		},
	} = {}) {
		this.min = min;
		this.max = max;
		this.setSelected(selected);
		this.formatValue = formatValue;
		this.render();
	}

	render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		this.subElements = new SubElements(this.element).subElements("[data-elem]");
		this.renderThumb();
		this.renderValue();
		this.initEventListeners();
	}

	getValue = () => ({
		from: Math.floor(this.min + .01 * parseFloat(this.subElements.left.style.left) * (this.max - this.min)),
		to: Math.floor(this.max - .01 * parseFloat(this.subElements.right.style.right) * (this.max - this.min))
	});

	initEventListeners() {
		this.subElements.left.addEventListener('pointerdown', this.onPointerDown);
		this.subElements.right.addEventListener('pointerdown', this.onPointerDown);
	}

	removeEventListener() {
		this.subElements.left.removeEventListener('pointerdown', this.onPointerDown);
		this.subElements.right.removeEventListener('pointerdown', this.onPointerDown);
	}

	dispatchSelect() {
		this.element.dispatchEvent(new CustomEvent('range-select', {
			bubbles: true,
			detail: this.selected,
		}));
	}

	dispatchChange() {
		this.element.dispatchEvent(new CustomEvent('range-change', {
			bubbles: true,
			detail: this.selected,
		}));
	}

	setScope({ min, max }) {
		this.selected.from = Math.max(min, this.selected.from);
		this.selected.to = Math.min(max, this.selected.to);

		this.min = min;
		this.max = max;
	}

	setSelected({ from, to }){
		this.min = Math.min(this.min, from);
		this.max = Math.max(this.max, to);
		this.selected = { from, to };
	}

	renderValue() {
		this.subElements.from.innerHTML = this.formatValue(this.selected.from);
		this.subElements.to.innerHTML = this.formatValue(this.selected.to);
	}

	renderThumb() {
		const oper = this.max - this.min;

		this.subElements.left.style.left = `${Math.floor((this.selected.from - this.min) / oper * 100)}%`;
		this.subElements.progress.style.left = this.subElements.left.style.left;

		this.subElements.right.style.right = `${Math.floor((this.max - this.selected.to) / oper * 100)}%`;
		this.subElements.progress.style.right = this.subElements.right.style.right;
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListener();
	}

	onPointerDown = (event) => {
		event.preventDefault();
		const { target } = event;
		this.dragElement = target;
		this.element.classList.add('range-slider_dragging');
		document.addEventListener('pointermove', this.onPointerMove);
		document.addEventListener('pointerup', this.onPointerUp);
	};

	onPointerUp = () => {
		this.element.classList.remove('range-slider_dragging');
		document.removeEventListener('pointermove', this.onPointerMove);
		document.removeEventListener('pointerup', this.onPointerUp);
		delete this.dragElement;
		this.dispatchSelect();
	};

	onPointerMove = (event) => {
		event.preventDefault();
		const { clientX } = event;
		const { 
			dragElement,
			subElements: {
				inner,
				left,
				right,
				progress,
			}
		} = this;

		if(dragElement === left){
			let percent = (clientX 
				- inner.getBoundingClientRect().left)
				/ inner.offsetWidth
				* 100;
	
			if(0 > percent) percent = 0;

			const percentRight = parseFloat(right.style.right);

			if(percentRight + percent > 100) 
				percent = 100 - percentRight;
	
			dragElement.style.left = `${percent}%`;
			progress.style.left = dragElement.style.left;
		}

		if(dragElement === right){
			let percent = (inner.getBoundingClientRect().right
				- clientX)
				/ inner.offsetWidth
				* 100;
	
			if(0 > percent) percent = 0;
	
			const percentLeft = parseFloat(left.style.left);

			if(percentLeft + percent > 100) 
				percent = 100 - percentLeft;

			dragElement.style.right = `${percent}%`;
			progress.style.right = dragElement.style.right;
		}

		this.setSelected(this.getValue());
		this.renderValue();
		this.dispatchChange();
	};
}
