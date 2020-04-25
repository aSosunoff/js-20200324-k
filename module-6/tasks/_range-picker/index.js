import HTMLBulder from '../../../utils/HTMLBulder.js';
import subElements from '../../../utils/subElements.js';

export default class RangePicker {
	element;
	subElements = {};
	selected = {
		from: new Date(),
		to: new Date(),
	};

	static nextMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 1);
	}

	static prevMonth(date) {
		return new Date(date.getFullYear(), date.getMonth() - 1, 1);
	}

	static getFormatDate(date) {
		return date
			? date.toLocaleDateString("ru", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
			  })
			: "";
	}

	get template() {
		return `
		<div class="rangepicker">
			<div class="rangepicker__input" data-elem="input">
				<span data-elem="from"></span>
				-
				<span data-elem="to"></span>
			</div>
			<div class="rangepicker__selector" data-elem="selector"></div>
		</div>`;
	}

	constructor({ from = new Date(), to = new Date() } = {}) {
		this.showDateFrom = new Date(from);
		this.selected = { from, to };

		this.render();
	}

	toggle() {
		const isOpen = this.element.classList.contains("rangepicker_open");

		if (!isOpen) {
			this.open()
		} else {
			this.close();
		}
	}

	open(){
		this.element.classList.add("rangepicker_open");

		this.renderSelector();
		this.renderHighlight();
		this.initEventListeners();
	}

	close(){
		this.element.classList.remove("rangepicker_open");

		if (!this.selected.to) {
			this.setDay(this.selected.from);
		}

		this.removeEventListeners();
	}

	next() {
		this.showDateFrom = RangePicker.nextMonth(this.showDateFrom);
		this.renderSelector();
		this.renderHighlight();
	}

	prev() {
		this.showDateFrom = RangePicker.prevMonth(this.showDateFrom);
		this.renderSelector();
		this.renderHighlight();
	}

	setDay(date) {
		if (this.selected.to) {
			this.selected = {
				from: date,
				to: null,
			};
		} else {
			const current = date.getTime();
			this.selected.to = new Date(
				Math.max(current, this.selected.from.getTime())
			);
			this.selected.from = new Date(
				Math.min(current, this.selected.from.getTime())
			);
			this.renderFromToDate();
			this.dispatchEvent();
		}

		this.renderSelector();
		this.renderHighlight();
	}

	dispatchEvent() {
		this.element.dispatchEvent(new CustomEvent("date-range-selected", {
			detail: this.selected,
			bubbles: true,
		}));
	}

	renderSelector() {
		this.subElements.selector.innerHTML = `
			<div class="rangepicker__selector-arrow"></div>
			<div class="rangepicker__selector-control-left"></div>
			<div class="rangepicker__selector-control-right"></div>    
			${this._rederCalendar(this.showDateFrom)}
			${this._rederCalendar(RangePicker.nextMonth(this.showDateFrom))}`;
	}

	_rederCalendar(date) {
		const monthString = date.toLocaleString("ru", { month: "long" });

		return `
			<div class="rangepicker__calendar">
				<div class="rangepicker__month-indicator">
					<time datetime="${monthString}">${monthString}</time>
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
					${this._renderDays(date)}        
				</div>
			</div>`;
	}

	_renderDays(date) {
		const monthDayCount = new Date(
			date.getFullYear(),
			date.getMonth() + 1,
			0
		).getDate();

		let firsDayOfWeekByMonth = new Date(
			date.getFullYear(),
			date.getMonth()
		).getDay();
		firsDayOfWeekByMonth = firsDayOfWeekByMonth == 0 ? 7 : firsDayOfWeekByMonth;

		return new Array(monthDayCount)
			.fill()
			.map(
				(e, index) => `
				<button 
					type="button" 
					${index == 0 ? `style="--start-from: ${firsDayOfWeekByMonth}"` : ""}
					class="rangepicker__cell" 
					data-value="${new Date(
						date.getFullYear(),
						date.getMonth(),
						index + 1
					).toISOString()}" 
					>
						${index + 1}
				</button>`
			)
			.join("");
	}

	renderHighlight() {
		Array.from(this.element.querySelectorAll(".rangepicker__cell")).forEach(
			(buttonDay) => {
				buttonDay.classList.remove("rangepicker__selected-from");
				buttonDay.classList.remove("rangepicker__selected-between");
				buttonDay.classList.remove("rangepicker__selected-to");

				const date = new Date(buttonDay.dataset.value).getTime();
				const from = this.selected.from && this.selected.from.getTime();
				const to = this.selected.to && this.selected.to.getTime();

				if (from === date) {
					buttonDay.classList.add("rangepicker__selected-from");
				} else if (to === date) {
					buttonDay.classList.add("rangepicker__selected-to");
				} else if (from < date && date < to) {
					buttonDay.classList.add("rangepicker__selected-between");
				}
			}
		);
	}

	renderFromToDate() {
		this.subElements.from.textContent = RangePicker.getFormatDate(
			this.selected.from
		);
		this.subElements.to.textContent = RangePicker.getFormatDate(
			this.selected.to
		);
	}

	render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		this.subElements = subElements(this.element, "[data-elem]");
		this.renderFromToDate();
		this.element.addEventListener("click", this.onPickerToggle, true);
	}

	initEventListeners() {
		this.element.addEventListener("click", this.onControllRight, true);
		this.element.addEventListener("click", this.onControllLeft, true);
		this.element.addEventListener("click", this.onDayClick);
		document.addEventListener("click", this.onClose, true);
	}

	removeEventListeners() {
		this.element.removeEventListener("click", this.onControllRight, true);
		this.element.removeEventListener("click", this.onControllLeft, true);
		this.element.removeEventListener("click", this.onDayClick);
		document.removeEventListener("click", this.onClose, true);
	}

	remove() {
		this.element.remove();
		this.element = null;
		this.subElements = {};
		this.selected = {
			from: new Date(),
			to: new Date(),
		};
		this.showDateFrom = new Date();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.element.removeEventListener("click", this.onPickerToggle, true);
	}

	onPickerToggle = ({ target }) => {
		if (target.closest(".rangepicker__input")) {
			this.toggle();
		}
	};

	onClose = ({ target }) => {
		if (!target.closest(".rangepicker")) {
			this.close();
		}	
	};

	onControllRight = ({ target }) => {
		if (target.closest(".rangepicker__selector-control-right")) {
			this.next();
		}
	};

	onControllLeft = ({ target }) => {
		if (target.closest(".rangepicker__selector-control-left")) {
			this.prev();	
		}
	};

	onDayClick = ({ target }) => {
		const button = target.closest(".rangepicker__cell");
		if (button) {
			const { value } = button.dataset;
			this.setDay(new Date(value));
		}
	};
}
