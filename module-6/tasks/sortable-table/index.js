import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

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
	string: (direction, a, b) => direction * new Intl.Collator().compare(a, b),
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
	url = '';

	constructor(
		headersConfig,
		{
			data = [],
			sorted = {
				id: headersConfig.find((item) => item.sortable).id,
				order: "asc",
			},
			url = "",
		} = {}
	) {
		this.headersConfig = headersConfig;
		this.data = data;
		this.url = url.trim() ? new URL(url.trim(), BACKEND_URL) : url;
		
		this.render(sorted.id, sorted.order);
	}

	loadingToggle() {
		this.element.classList.toggle("sortable-table_loading");
	}

	emptyDataToggle() {
		this.element.classList.toggle("sortable-table_empty");
	}

	sortableCellHandler = (e) => {
		let cellClick = e.target.closest(".sortable-table__cell");
		if ("sortable" in cellClick.dataset) {
			const {
				dataset: { id, order },
			} = cellClick;

			this.sort(id, order === "asc" ? "desc" : "asc");
		}
	};

	initEventListeners() {
		this.subElements.header.addEventListener("click", this.sortableCellHandler);
	}
	removeEventListeners() {
		this.subElements.header.removeEventListener("click", this.sortableCellHandler);
	}

	render(id, order) {
		this.element = createElementFromHTML(this.getTable());
		
		this.subElements = [...this.element.querySelectorAll("[data-elem]")].reduce(
			(res, e) => ((res[e.dataset.elem] = e), res),
			{}
		);

		this._setGetDataMethod();

		(async () => {
			await this.sort(id, order);

			this.initEventListeners();
		})();
	}

	_setGetDataMethod() {
		if (this.url) {
			this._getData = async (id, order) => {
				const data = await fetchJson(`${this.url.href}?
					_embed=subcategory.category
					&_sort=${id}
					&_order=${order}
					&_start=0
					&_end=30`);

				return data;
			}
		} else {
			this._getData = async (id, order) => {
				const { sortType, sortable } = this.headersConfig.find(
					(e) => e.id === id
				);
		
				let getSortTypeOrder =
					typeof sortable !== "function"
						? curry(getSort, sortType, order)
						: curry(sortable, order);
		
				return this.data.sort((a, b) => getSortTypeOrder(a[id], b[id]));
			};
		}
	}

	getHeaderCell({ id, sortable, title }) {
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
			<div data-elem="header" class="sortable-table__header sortable-table__row">
				${this.headersConfig.map(this.getHeaderCell).join("")}
			</div>
			
			<div data-elem="body" class="sortable-table__body">
				${this.getBodyRow()}
			</div>
			
			<div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
			
			<div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
				<div>
					<p>No products satisfies your filter criteria</p>
					<button type="button" class="button-primary-outline">Reset all filters</button>
				</div>
			</div>
		</div>`;
	}

	_refreshRow() {
		this.subElements.body.innerHTML = this.getBodyRow();
	}

	async sort(id, order) {
		order = order || "asc";

		this.updateSortArrow(id, order);

		this.loadingToggle();

		this.data = await this._getData(id, order);

		this.loadingToggle();

		if (this.data.length) {
			this._refreshRow();
		} else {
			this.emptyDataToggle();
		}
	}

	updateSortArrow(id, order) {
		const columnSort = this.subElements.header.querySelector(
			"[data-order='asc'], [data-order='desc']"
		);

		if (columnSort) {
			columnSort.dataset.order = "";
		}
		
		this.subElements.header.querySelector(
			`[data-id='${id}']`
		).dataset.order = order;
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
