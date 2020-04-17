function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

export default class RangePicker {
	element;
	subElements = {};
	// TODO: rename "selectingFrom"
	selectingFrom = true;
	selected = {
		from: new Date(),
		to: new Date(),
	};

	constructor({ from = new Date(), to = new Date() } = {}) {
		this.showDateFrom = new Date(from);
		this.selected = { from, to };

		this.render();
		this.initEventListeners();
	}
	
	renderSelector() {
		this.subElements.selector.innerHTML = `
			<div class="rangepicker__selector-arrow"></div>
			<div class="rangepicker__selector-control-left"></div>
			<div class="rangepicker__selector-control-right"></div>    
			${this._rederCalendar(this.showDateFrom)}
			${this._rederCalendar(this.nextMonth(this.showDateFrom))}`;
	}

	nextMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}

	prevMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() - 1, 1);
	}

	_rederCalendar(date) {
		const monthString = date.toLocaleString('ru', { month: 'long' });

		return `
			<div class="rangepicker__calendar">
				<div class="rangepicker__month-indicator">
					<time datetime="${ monthString }">${ monthString }</time>
				</div>
				<div class="rangepicker__day-of-week">
					<div>Пн</div>
					<div>Вт</div>
					<div>Ср</div>
					<div>Чт</div>
					<div>Пт</div>
					<div>Сб</div>
					<div>Вс</div>
				</div>
				<div class="rangepicker__date-grid">
					${ this._renderDays(date) }        
				</div>
			</div>`;
	}

	_renderDays(date){
		const monthDayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

		let firsDayOfWeekByMonth = new Date(date.getFullYear(), date.getMonth()).getDay();
		firsDayOfWeekByMonth = firsDayOfWeekByMonth == 0 ? 7 : firsDayOfWeekByMonth;

		return new Array(monthDayCount)
			.fill()
			.map((e, index) => `
				<button 
					type="button" 
					${index == 0 ? `style="--start-from: ${firsDayOfWeekByMonth}"` : ''}
					class="rangepicker__cell" 
					data-value="${new Date(date.getFullYear(), date.getMonth(), index + 1).toISOString()}" 
					>
						${index + 1}
				</button>`)
			.join('');
	}

	renderHighlight() {
		[...this.element.querySelectorAll(".rangepicker__cell")].forEach(buttonDay => {
			buttonDay.classList.remove('rangepicker__selected-from');
			buttonDay.classList.remove('rangepicker__selected-between');
			buttonDay.classList.remove('rangepicker__selected-to');

			const date = new Date(buttonDay.dataset.value).getTime();
			const from = this.selected.from && this.selected.from.getTime();
			const to = this.selected.to && this.selected.to.getTime();

			if (from === date) {
				buttonDay.classList.add('rangepicker__selected-from');
			} else if (to === date) {
				buttonDay.classList.add('rangepicker__selected-to');
			} else if (from < date && date < to) {
				buttonDay.classList.add('rangepicker__selected-between');
			}
		});
	}

	render() {
		this.element = createElementFromHTML(`
			<div class="rangepicker">
				<div class="rangepicker__input" data-elem="input">
					<span data-elem="from">${this.getFormatDate(this.selected.from)}</span> -
					<span data-elem="to">${this.getFormatDate(this.selected.to)}</span>
				</div>
				<div class="rangepicker__selector" data-elem="selector"></div>
			</div>`);

		this.subElements = this.getSubElements(this.element);
	}

	onRangePickerOpen = (e) => {
		const rangePickerInput = e.target.closest(".rangepicker__input");

		if (!rangePickerInput) {
			return;
		}

		const isOpen = this.element.classList.toggle('rangepicker_open');

		if (isOpen) {
			this.renderSelector();
			this.renderHighlight();
		}
	}

	onControllRight = (e) => {
		const controllRight = e.target.closest(".rangepicker__selector-control-right");

		if (!controllRight) {
			return;
		}

		this.showDateFrom = this.nextMonth(this.showDateFrom);
		
		this.renderSelector();
		this.renderHighlight();
	}

	onControllLeft = (e) => {
		const controllRight = e.target.closest(".rangepicker__selector-control-left");

		if (!controllRight) {
			return;
		}

		this.showDateFrom = this.prevMonth(this.showDateFrom);
		
		this.renderSelector();
		this.renderHighlight();
	}

	onDayClick = (e) => {
		const button = e.target.closest(".rangepicker__cell");

		if (!button) {
			return;
		}

		if (this.selected.to) {
			this.selected.from = new Date(button.dataset.value);
			this.selected.to = null;
		} else {
			const current = new Date(button.dataset.value).getTime();
			this.selected.to = new Date(Math.max(current, this.selected.from.getTime()));
			this.selected.from = new Date(Math.min(current, this.selected.from.getTime()));
		}

		this.renderSelector();
		this.renderHighlight();
	}

	onClose = (e) => {
		const date = e.target.closest(".rangepicker__selector");
		
		if (date) {
			return;
		}

		this.element.classList.remove('rangepicker_open');
	}

	initEventListeners() {
		this.element.addEventListener("click", this.onRangePickerOpen);
		this.element.addEventListener("click", this.onControllRight);
		this.element.addEventListener("click", this.onControllLeft);
		this.element.addEventListener("click", this.onDayClick);
		document.addEventListener("click", this.onClose, true);
	}

	removeEventListeners() {
		this.element.removeEventListener("click", this.onRangePickerOpen);
		this.element.removeEventListener("click", this.onControllRight);
		this.element.removeEventListener("click", this.onControllLeft);
		this.element.removeEventListener("click", this.onDayClick);
		document.removeEventListener("click", this.onClose, true);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
	}

	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////

	getFormatDate(date) {
		return date.toLocaleDateString('en', { day: '2-digit', month: '2-digit', year: '2-digit' });
	}
	
	getSubElements(element) {
		return [...element.querySelectorAll("[data-elem]")].reduce(
			(res, subElement) => ((res[subElement.dataset.elem] = subElement), res),
			{}
		);
	}
}
