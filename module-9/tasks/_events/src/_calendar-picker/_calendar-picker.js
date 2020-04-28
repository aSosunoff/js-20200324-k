import HTMLBulder from '../utils/HTMLBulder.js';
import MonthPicker from "../_month-picker/_month-picker.js";

export default class Calendar extends MonthPicker {
	static nextYear(date) {
		return new Date(date.getFullYear() + 1, 0, 1);
	}

	static prevYear(date) {
		return new Date(date.getFullYear() - 1, 0, 1);
	}

	static getFormatDate(date) {
		return date
			? date.toLocaleDateString("ru", { year: "numeric" })
			: "";
	}

	get template() {
		return `
		<div class="calendar">
			<div class="calendar__head" data-elem="calendar__head">
				<div class="calendar__title" data-elem="calendar__title"></div>
				<div class="calendar-control-left"></div>
				<div class="calendar-control-right"></div>
			</div>
			<div class="calendar__body" data-elem="calendar__body"></div>
		</div>`;
	}

	constructor({ showDateFrom = new Date(), from = new Date(), to = new Date() } = {}) {
		super({ showDateFrom, from, to });
	}

	next() {
		this.showDateFrom = Calendar.nextYear(this.showDateFrom);
		this.renderMonth();
		this.renderHighlight();
	}

	prev() {
		this.showDateFrom = Calendar.prevYear(this.showDateFrom);
		this.renderMonth();
		this.renderHighlight();
	}

	renderYear() {
		this.subElements
			.calendar__title
			.textContent = `${Calendar.getFormatDate(
				this.showDateFrom
			)} год`;
	}

	/** @override */
	renderMonth() {
		this.subElements
				.calendar__body
				.innerHTML = '';

		const year = this.showDateFrom.getFullYear();

		for (let i = 0; i < 12; i++) {
			this.subElements
				.calendar__body
				.append(HTMLBulder.getElementFromString(this._rederCalendar(new Date(year, i, 1))));
		}

		this.renderYear();
	}

	click({ target }) {
		super.click({ target });

		const controlLeft = target.closest(".calendar-control-left");
		if(controlLeft) {
			this.prev();
		}

		const controlRight = target.closest(".calendar-control-right");
		if(controlRight) {
			this.next();
		}
	}
}
