function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

class SortableTableCell {
	id;
	title;
	sortable;

	order;

	element;

	constructor(
		{ id = "", title = "", sortable = false, order = "" } = {}
	) {
		this.id = id;
		this.title = title;
		this.sortable = sortable;

		this.order = order;

		this.render();
	}

	render() {
		this.element = `
			<div 
				class="sortable-table__cell" 
				data-name="${this.id}" 
				data-sortable="${this.sortable}"
				data-order="${this.order}">
				<span>${this.title}</span>`;

		if (this.order) {
			this.element += `
				<span data-element="arrow" class="sortable-table__sort-arrow">
					<span class="sort-arrow"></span>
				</span>`;
		}

		this.element += "</div>";
	}
}

class SortableTableRow {
	id;
	title;
	quantity;
	price;
	sales;
	images;
	headersConfig;

	element;

	constructor(
		headersConfig,
		{
			id = "",
			title = "",
			quantity = 0,
			price = 0,
			sales = 0,
			images = [],
		} = {}
	) {
		this.headersConfig = headersConfig;

		this.id = id;
		this.title = title;
		this.quantity = quantity;
		this.price = price;
		this.sales = sales;
		this.images = images;

		this.render();
	}

	render() {
		this.element = `
			<a href="/products/${this.id}" class="sortable-table__row">
				${this.headersConfig
					.map((e) =>
						"template" in e
							? e.template(this.images)
							: `<div class="sortable-table__cell">${this[e.id]}</div>`
					)
					.join("")}
			</a>`;
	}
}

const curry = (fn, ...a) =>
	a.length >= fn.length
		? fn.apply(this, a)
		: (...b) => curry.apply(this, [fn, ...a, ...b]);

const mapSort = new Map()
	.set("number", (i, a, b) => i * (a - b))
	.set("string", (i, a, b) => i * new Intl.Collator().compare(a, b));

const getSort = (type, order, a, b) => {
	const i = "asc" === order ? 1 : -1;

	if (mapSort.has(type)) {
		return mapSort.get(type)(i, a, b)
	}

	return mapSort.get([...mapSort.keys()][0])(i, a, b)
}

export default class SortableTable {
	element;
	subElements = {};
	headersConfig = [];
	data = [];

	constructor(headersConfig, { data = [] } = {}) {
		this.headersConfig = headersConfig;
		this.data = data;

		this.render();
	}

	render() {
		this.element = createElementFromHTML(this.getTable());
		this.subElements = [...this.element.querySelectorAll("[data-elem]")].reduce(
			(res, e) => ((res[e.dataset.elem] = e), res),
			{}
		);
	}

	getHeader() {
		return `
			<div data-elem="header" class="sortable-table__header sortable-table__row">
				${this.getHeaderRow()}
			</div>`;
	}

	getHeaderRow(field, order) {
		return this.headersConfig
			.map((e) =>
				e.id === field
					? new SortableTableCell({ ...e, order }).element
					: new SortableTableCell(e).element
			)
			.join("");
	}

	getBody() {
		return `
			<div data-elem="body" class="sortable-table__body">
				${this.getBodyRow()}
			</div>`;
	}

	getBodyRow() {
		return this.data
			.map((e) => new SortableTableRow(this.headersConfig, e).element)
			.join("");
	}

	getTable() {
		return `
		<div class="sortable-table">
			${this.getHeader()}
			${this.getBody()}
		</div>`;
	}

	sort(field, order = "asc") {
		const { sortType } = this.headersConfig.find((e) => e.id === field);

		let getSortTypeOrder = curry(getSort, sortType, order);

		this.data = this.data.sort((a, b) => getSortTypeOrder(a[field], b[field]));

		this.subElements.header.innerHTML = this.getHeaderRow(field, order);

		this.subElements.body.innerHTML = this.getBodyRow();
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.subElements = {};
	}
}
