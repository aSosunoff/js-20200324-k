function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
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

const sortStrategy = {
	number: (direction, a, b) => direction * (a - b),
	string: (direction, a, b) => direction * new Intl.Collator().compare(a, b)
};

const getSort = (type, order, a, b) => {
	const direction = "asc" === order || !order ? 1 : -1;

	if (type in sortStrategy) {
		return sortStrategy[type](direction, a, b);
	}

	return sortStrategy[Object.keys[sortStrategy][0]](direction, a, b);
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

		this.render();
		this.initEventListeners();
		this.sort(sorted.id, sorted.order);
	}

	sortableCellHandler = (e) => {
		let cellClick = e.target.closest(".sortable-table__cell");
		if ("sortable" in cellClick.dataset) {
			const {
				dataset: { id, order },
			} = cellClick;

			this.sort(id, order);
		}
	};

	initEventListeners() {
		this.subElements.header.addEventListener("click", this.sortableCellHandler);
	}
	removeEventListeners() {
		this.subElements.header.removeEventListener("click", this.sortableCellHandler);
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
				${this.headersConfig.map(this.getHeaderCell).join("")}
			</div>`;
	}

	getHeaderCell({id, sortable, title}) {
		return `
			<div 
				class="sortable-table__cell" 
				data-id="${id}" 
				${sortable ? "data-sortable" : ""}
				data-order="">
					<span>${title}</span>
					<span data-element="arrow" class="sortable-table__sort-arrow">
						<span class="sort-arrow"></span>
					</span>
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

	sort(field, order) {
		order = order || 'asc'

		const { sortType, sortable } = this.headersConfig.find((e) => e.id === field);
		
		let getSortTypeOrder = typeof sortable !== "function" 
			? curry(getSort, sortType, order) 
			: curry(sortable, order);

		this.data = this.data.sort((a, b) => getSortTypeOrder(a[field], b[field]));

		this.subElements.body.innerHTML = this.getBodyRow();

		this.updateSortArrow(field, order);
	}

	updateSortArrow(field, order){
		const columnSort = this.subElements.header.querySelector(
			"[data-order='asc'], [data-order='desc']"
		);

		if (columnSort) {
			columnSort.dataset.order = '';
		}

		this.subElements.header.querySelector(
			`[data-id='${field}']`
		).dataset.order = order === "asc" || !order ? "desc" : "asc";
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
	}
}
