function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

class SortableTableCell {
	id;
	title;
	sortable;

	element;

	constructor({ id = "", title = "", sortable = false } = {}) {
		this.id = id;
		this.title = title;
		this.sortable = sortable;

		this.render();
	}

	render() {
		this.element = `
			<div 
				class="sortable-table__cell" 
				data-id="${this.id}" 
				${this.sortable ? "data-sortable" : ""}
				data-order="">
					<span>${this.title}</span>
					<span data-element="arrow" class="sortable-table__sort-arrow">
						<span class="sort-arrow"></span>
					</span>
			</div>`;
	}
}

class SortableTableRow {
	cells;
	data;
	element;

	constructor(cells, data) {
		this.cells = cells;
		this.data = data;
		this.render();
	}

	template(data) {
		return `<div class="sortable-table__cell">${data}</div>`;
	}

	render() {
		this.element = `
			<div data-href="/products/${this.id}" class="sortable-table__row">
				${this.cells
					.map(({ id, template = this.template }) => template(this.data[id]))
					.join("")}
			</div>`;
	}
}

const curry = (fn, ...a) =>
	a.length >= fn.length
		? fn.apply(this, a)
		: (...b) => curry.apply(this, [fn, ...a, ...b]);

const mapSort = new Map()
	.set("number", (direction, a, b) => direction * (a - b))
	.set(
		"string",
		(direction, a, b) => direction * new Intl.Collator().compare(a, b)
	);

const getSort = (type, order, a, b) => {
	const direction = "asc" === order || !order ? 1 : -1;

	if (mapSort.has(type)) {
		return mapSort.get(type)(direction, a, b);
	}

	return mapSort.get([...mapSort.keys()][0])(direction, a, b);
};

export default class SortableTable {
	element;
	subElements = {};
	headersConfig = [];
	data = [];

	constructor(
		headersConfig,
		{
			data = [],
			sorted = {
				id: headersConfig.find((item) => item.sortable).id,
				order: "asc",
			},
		} = {}
	) {
		this.headersConfig = headersConfig;
		this.data = data;
		this.sorted = sorted;

		this.render();
		this.initEventListeners();
	}

	initEventListeners() {
		this.subElements.header.addEventListener("click", (e) => {
			let cellClick = e.target.closest(".sortable-table__cell");
			if ("sortable" in cellClick.dataset) {
				const {
					dataset: { order },
				} = cellClick;

				this.sort(cellClick.dataset.id, order);

				cellClick.dataset.order = order === "asc" || !order ? "desc" : "asc";
			}
		});
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
				${this.headersConfig.map((e) => new SortableTableCell(e).element).join("")}
			</div>`;
	}

	getBody() {
		return `
			<div data-elem="body" class="sortable-table__body">
				${this.getBodyRow()}
			</div>`;
	}

	getBodyRow() {
		const cells = this.headersConfig.map(({ id, template }) => ({
			id,
			template,
		}));

		return this.data
			.map((e) => new SortableTableRow(cells, e).element)
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

		const columnSort = this.subElements.header.querySelector(
			"[data-order='asc'], [data-order='desc']"
		);

		if (columnSort) {
			columnSort.dataset.order = null;
		}

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
