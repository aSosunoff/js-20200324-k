import HTMLBulder from '../../../utils/HTMLBulder.js';

export default class SortableList {
	element;
	items = [];

	get trmplate() {
		return '<ul class"sortable-list"></ul>';
	}

	constructor({ items = [] } = {}) {
		this.items = items;

		this.render();
	}

	render() {
		this.element = HTMLBulder.getElementFromString(this.trmplate);
		
		this.items.forEach(this.addElement.bind(this));
	
		this.initEventListener();
	}

	addElement(element) {
		this.element.append(HTMLBulder.getElementFromString(`<li class="sortable-list__item" data-grab-handle>${element}</li>`));
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
		this.placeholderElem = HTMLBulder.getElementFromString('<div class="sortable-list__placeholder"></div>');
		this.placeholderElem.style.width = item.style.width;
		this.placeholderElem.style.height = item.style.height;
		item.after(this.placeholderElem);
		item.classList.add('sortable-list__item_dragging');
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
			this.draggingElemement.classList.remove('sortable-list__item_dragging');
			this.placeholderElem.replaceWith(this.draggingElemement);
			this.draggingElemement.classList.remove("sortable-list__item_dragging"),
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
		this.items = [];
	}

	onPointerDown = (event) => {
		if(event.button != 0) return;
		event.preventDefault();
		const item = event.target.closest('.sortable-list__item');
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

		for (const item of this.element.children) {
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
