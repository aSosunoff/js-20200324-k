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

export default class SortableTable {
	element;
	subElements = {};
	headersConfig = [];
	data = [];
	url = "";

	static getSubElements(element) {
		return Array.from(element.querySelectorAll("[data-elem]")).reduce(
			(res, subElement) => ((res[subElement.dataset.elem] = subElement), res),
			{}
		);
	}

	static sortStrategy = {
		number: (direction, a, b) => direction * (a - b),
		string: (direction, a, b) => direction * new Intl.Collator().compare(a, b),
	};

	static sort(type, order, a, b) {
		const direction = "asc" === order || !order ? 1 : -1;

		if (type in SortableTable.sortStrategy) {
			return SortableTable.sortStrategy[type](direction, a, b);
		}

		return SortableTable.sortStrategy[
			Object.keys[SortableTable.sortStrategy][0]
		](direction, a, b);
	}

	get template() {
		return `
		<div class="sortable-table">
			<div data-elem="header" class="sortable-table__header sortable-table__row"></div>
			
			<div data-elem="body" class="sortable-table__body"></div>
			
			<div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
			
			<div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
				<div>
					<p>No products satisfies your filter criteria</p>
					<button type="button" class="button-primary-outline">Reset all filters</button>
				</div>
			</div>
		</div>`;
	}

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

	render(id, order) {
		this.element = createElementFromHTML(this.template);
		this.subElements = SortableTable.getSubElements(this.element);
		this.renderHeader(id, order);
		this.subElements = {
			...this.subElements,
			...SortableTable.getSubElements(this.subElements.header),
		};
		
		this.sort(id, order);

		this.initEventListeners();
	}

	renderHeader(idSort, orderSort) {
		this.subElements.header.innerHTML = this.headersConfig
			.map(
				({ id, sortable, title }) => `
				<div 
					class="sortable-table__cell" 
					data-id="${id}" 
					data-sortable="${Boolean(sortable)}"
					data-order="${id === idSort ? orderSort : ""}">
						<span>${title}</span>
						${
							id === idSort
								? `
						<span data-elem="arrow" class="sortable-table__sort-arrow">
							<span class="sort-arrow"></span>
						</span>`
								: ""
						}
				</div>`
			)
			.join("");
	}

	renderBody() {
		this.removeEmptyData();

		if (!this.data.length) {
			this.setEmptyData();
			return;
		}

		const cells = this.headersConfig.map(({ id, template }) => ({
			id,
			template,
		}));

		this.subElements.body.innerHTML = this.data
			.map((e) => new SortableTableRow(cells, e).element)
			.join("");
	}

	loadingToggle() {
		this.element.classList.toggle("sortable-table_loading");
	}

	setEmptyData() {
		this.element.classList.add("sortable-table_empty");
	}

	removeEmptyData() {
		this.element.classList.remove("sortable-table_empty");
	}

	initEventListeners() {
		this.subElements.header.addEventListener(
			"click",
			this.onSortableCellHandler
		);
	}

	removeEventListeners() {
		this.subElements.header.removeEventListener(
			"click",
			this.onSortableCellHandler
		);
	}

	async sortServer(id, order) {
		this.url.searchParams.set('_sort', id);
		this.url.searchParams.set('_order', order);
		this.url.searchParams.set('_start', 0);
		this.url.searchParams.set('_end', 30);
	
		this.loadingToggle();
	
		this.data = await fetchJson(this.url);
	
		this.loadingToggle();

		this.renderBody();
	}

	sortLocaly(id, order) {
		const { sortType, sortable } = this.headersConfig.find(
			(e) => e.id === id
		);

		if (typeof sortable !== "function") {
			this.data = this.data.sort((a, b) =>
				SortableTable.sort(sortType, order, a[id], b[id])
			);
		} else {
			this.data = this.data.sort((a, b) => sortable(order, a[id], b[id]));
		}

		this.renderBody();
	}

	async sort(id, order = 'asc') {
		this.updateSortArrow(id, order);

		if (this.url) {
			await this.sortServer(id, order);
		} else {
			this.sortLocaly(id, order);
		}
	}

	updateSortArrow(id, order) {
		const column = this.subElements.header.querySelector(`[data-id="${id}"]`);

		if (column) {
			column.dataset.order = order;
			column.append(this.subElements.arrow);
		}
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.subElements = {};
	}

	onSortableCellHandler = ({ target }) => {
		let cellClick = target.closest('[data-sortable="true"]');
		
		const getOrder = order => ({
			asc: 'desc',
			desc: 'asc',
		}[order]);

		if (cellClick) {
			const {
				dataset: { id, order },
			} = cellClick;

			this.sort(id, getOrder(order));
		}
	};
}
