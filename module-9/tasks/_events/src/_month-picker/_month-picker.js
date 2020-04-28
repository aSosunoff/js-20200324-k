import HTMLBulder from '../utils/HTMLBulder.js';
import subElements from '../utils/subElements.js';

export default class Calendar {
	element;
	subElements = {};
	showDateFrom = new Date();
	selected = {
		from: new Date(),
		to: new Date(),
	};

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
		return `<div data-elem="container"></div>`;
	}

	constructor({ showDateFrom = null, from = new Date(), to = new Date() } = {}) {
		this.showDateFrom = showDateFrom || from;
		this.selected = { from, to };

		this.render();
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

			this.dispatchEvent();
		}

		this.renderMonth();
		this.renderHighlight();
	}

	dispatchEvent() {
		this.element.dispatchEvent(new CustomEvent("date-range-selected", {
			detail: this.selected,
			bubbles: true,
		}));
	}

	renderMonth() {
		this.subElements
			.container
			.innerHTML = this._rederCalendar(this.showDateFrom);
	}

	_rederCalendar(date) {
		const monthString = date.toLocaleString("ru", { month: "long" });

		return `
			<div class="month-picker">
				<div class="month-picker__month-indicator">
					<time datetime="${monthString}">${monthString}</time>
				</div>
				<div class="month-picker__day-of-week">
					<div>Пн</div>
					<div>Вт</div>
					<div>Ср</div>
					<div>Чт</div>
					<div>Пт</div>
					<div>Сб</div>
					<div>Вс</div>
				</div>
				<div class="month-picker__date-grid">
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
					class="month-picker__cell" 
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
		Array.from(this.element.querySelectorAll(".month-picker__cell")).forEach(
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

	render() {
		this.element = HTMLBulder.getElementFromString(this.template);
		
		this.subElements = subElements(this.element, "[data-elem]");

		this.renderMonth();

		this.renderHighlight();
	
		this.initEventListeners();
	}

	initEventListeners() {
		this.element.addEventListener("click", this.onHundlerClick);
	}

	removeEventListeners() {
		this.element.removeEventListener("click", this.onHundlerClick);
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
	}

	onHundlerClick = (event) => {
		this.click(event);
	}

	click({ target }){
		const button = target.closest(".month-picker__cell");
		if (button) {
			const { value } = button.dataset;
			this.setDay(new Date(value));
		}
	};
}
