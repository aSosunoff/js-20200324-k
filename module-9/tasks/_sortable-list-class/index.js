import HTMLBulder from '../../../utils/HTMLBulder.js';

export default class SortableList {
	element = null;
	childrenClass = '';
	dragClass = '';
	placeholderClass = '';

	constructor({ container, childrenClass, dragClass, placeholderClass } = {}) {
		this.element = container;
		this.childrenClass = childrenClass;
		this.dragClass = dragClass;
		this.placeholderClass = placeholderClass;
		this.initEventListener();
	}

	initEventListener() {
		this.element.addEventListener("pointerdown", this.onPointerDown);
	}

	removeEventListener() {
		this.element.removeEventListener("pointerdown", this.onPointerDown);
	}

	dragStart(item, {clientX, clientY}) {
		this.pointerInitialShift = {
			x: clientX - item.getBoundingClientRect().x,
			y: clientY - item.getBoundingClientRect().y
		};
		
		item.style.width = item.offsetWidth + "px";
		item.style.height = item.offsetHeight + "px";
		this.placeholderElem = HTMLBulder.getElementFromString(`<div class="${this.placeholderClass}"></div>`);
		this.placeholderElem.style.width = item.style.width;
		this.placeholderElem.style.height = item.style.height;
		item.after(this.placeholderElem);
		item.classList.add(this.dragClass);
		document.body.append(item);
		this.draggingElemement = item;
		this.moveDraggingAt(clientX, clientY)

		document.addEventListener('pointerup', this.onPointerUp);
		document.addEventListener('pointermove', this.onPointerMove);
	}

	moving(callback) {		
		let isCallback = true;

		const {
			left: leftHolder,
			top: topHolder,
		} = this.placeholderElem.getBoundingClientRect();

		const {
			left, 
			top,
			leftDragg = parseInt(left),
			topDragg = parseInt(top),
		} = this.draggingElemement.style;

		if(leftHolder - 20 > leftDragg){
			this.draggingElemement.style.left = leftDragg + 20 + "px";
			isCallback = false;
		} else if (leftHolder + 20 < leftDragg) {
			this.draggingElemement.style.left = leftDragg - 20 + "px";
			isCallback = false;
		}

		if(topHolder - 5 > topDragg){
			this.draggingElemement.style.top = topDragg + 5 + "px";
			isCallback = false;
		} else if (topHolder + 5 < topDragg) {
			this.draggingElemement.style.top = topDragg - 5 + "px";
			isCallback = false;
		}

		if(isCallback){
			callback();
		} else {
			setTimeout(() => { this.moving(callback); }, 15);
		}
	}

	dragStop() {
		document.removeEventListener('pointerup', this.onPointerUp);
		document.removeEventListener('pointermove', this.onPointerMove);
		this.element.removeEventListener("pointerdown", this.onPointerDown);

		this.moving(() => {
			this.draggingElemement.classList.remove(this.dragClass);
			this.placeholderElem.replaceWith(this.draggingElemement);
			this.draggingElemement.classList.remove(this.dragClass),
			this.draggingElemement.style.left = "";
			this.draggingElemement.style.top = "";
			this.draggingElemement.style.width = "";
			this.draggingElemement.style.height = "";
			delete this.draggingElemement;
			delete this.placeholderElem;
			delete this.pointerInitialShift;
			this.element.addEventListener("pointerdown", this.onPointerDown);
		});
	}

	moveDraggingAt(clientX, clientY) {
		this.draggingElemement.style.left = clientX - this.pointerInitialShift.x + "px",
		this.draggingElemement.style.top = clientY - this.pointerInitialShift.y + "px"
	}

	scrollIfCloseToWindowEdge({clientY}) {
		const offset = 50;
		const move = 10;
		if(clientY < offset){
			window.scrollBy(0, -move);
		} else if (clientY > document.documentElement.clientHeight - offset) {
			window.scrollBy(0, move)
		}
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListener();
		this.element = null;
		this.childrenClass = '';
		this.dragClass = '';
		this.placeholderClass = '';
	}

	onPointerDown = (event) => {
		if(event.button != 0) return;
		const gragButton = event.target.closest('[data-grab-handle]');
		if(!gragButton) return;
		event.preventDefault();
		const item = gragButton.closest(`.${this.childrenClass}`);
		if (item) {
			this.dragStart(item, event);
		};
	}
	
	onPointerUp = () => {
		this.dragStop();
	}

	onPointerMove = (event) => {
		event.preventDefault();
		this.moveDraggingAt(event.clientX, event.clientY);
		this.scrollIfCloseToWindowEdge(event);

		const children = this.element.querySelectorAll(`.${this.childrenClass}`);

		for (const item of children) {
			if (event.clientY > item.getBoundingClientRect().top 
				&& event.clientY < item.getBoundingClientRect().bottom) {
					if (this.placeholderElem.getBoundingClientRect().bottom 
						< this.draggingElemement.getBoundingClientRect().top) {
						item.after(this.placeholderElem);
					} else {
						item.before(this.placeholderElem);
					}
					break;
			}
		}
	}
}
