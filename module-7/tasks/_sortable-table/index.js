import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

const debounceDecorator = (f, delay = 0) => {
	let timer = null;

	return (...arg) => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}

		timer = setTimeout(() => {
			f.apply(this, arg);
			clearTimeout(timer);
			timer = null;
		}, delay);
	};
};

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
	sorted = {};
	data = [];
	allData = [];
	url = "";
	paggination = {
		size: 5,
		page: 1,
	};

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

	static chunk(arr = [], size) {
		const a = [...arr];

		return Array(Math.ceil(a.length / size))
			.fill([])
			.map((e, inx) => a.slice(inx * size, inx * size + size));
	}

	static getOrder = (order) =>
		({
			asc: "desc",
			desc: "asc",
		}[order]);

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

	get arrowTemplate() {
		return `
		<span data-elem="arrow" class="sortable-table__sort-arrow">
			<span class="sort-arrow"></span>
		</span>`;
	}

	get isSortServer() {
		return Boolean(this.url);
	}

	get checkBottomBorder() {
		const { bottom } = document.documentElement.getBoundingClientRect();
		const { clientHeight } = document.documentElement;
		return bottom < clientHeight + 100;
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
			pageSize = 5,
		} = {}
	) {
		this.headersConfig = headersConfig;
		this.sorted = sorted;
		this.paggination.size = pageSize;
		this.allData = data;
		this.data = this.getDataOfPage(this.paggination.page);
		this.url = url.trim() ? new URL(url.trim(), BACKEND_URL) : null;
		
		this.render();
		this.setSettings();
		this.sort(this.sorted.id, this.sorted.order);

		/* setTimeout(() => {
			while(this.checkBottomBorder){
				this.renderNextPage();
			}
		}); */
		/*  */
	}

	setSettings() {
		this.onScroll = debounceDecorator(this.onScroll, 100);
		this.initEventListeners();
	}

	render() {
		this.element = createElementFromHTML(this.template);
		this.subElements = { 
			...SortableTable.getSubElements(this.element), 
			arrow: createElementFromHTML(this.arrowTemplate)
		};
		this.renderHeader();
		this.renderBody();
	}

	renderHeader() {
		this.subElements.header.innerHTML = this.headersConfig
			.map(
				({ id, sortable, title }) => `
				<div 
					class="sortable-table__cell" 
					data-id="${id}" 
					data-sortable="${Boolean(sortable)}"
					data-order="">
						<span>${title}</span>
				</div>`
			)
			.join("");
	}

	renderBody() {
		if (!this.data.length) {
			this.element.classList.add("sortable-table_empty");
			return;
		} else {
			this.element.classList.remove("sortable-table_empty");
		}

		const cells = this.headersConfig.map(({ id, template }) => ({
			id,
			template,
		}));

		this.subElements.body.innerHTML = this.data
			.map((e) => new SortableTableRow(cells, e).element)
			.join("");
	}

	async renderNextPage() {
		let dataChunk = [];

		if (this.isSortServer) {
			dataChunk = await this.loadData(this.paggination.page + 1, this.sorted);
		} else {
			dataChunk = this.getDataOfPage(this.paggination.page + 1);
		}

		if (dataChunk && dataChunk.length) {
			this.paggination.page += 1;
			this.data.push(...dataChunk);
			this.renderBody();
		}
	}

	renderArrow(id, order) {
		const column = this.subElements.header.querySelector(
			`[data-id="${id}"]`
		);

		if (column) {
			column.dataset.order = order;
			column.append(this.subElements.arrow);
		}
	}

	initEventListeners() {
		this.subElements.header.addEventListener(
			"click",
			this.onSortableCellHandler
		);

		document.addEventListener("scroll", this.onScroll);
	}

	removeEventListeners() {
		this.subElements.header.removeEventListener(
			"click",
			this.onSortableCellHandler
		);

		document.removeEventListener("scroll", this.onScroll);
	}

	async loadData(
		page = this.paggination.page,
		{ id = this.sorted.id, order = this.sorted.order } = {}
	) {
		const { size } = this.paggination;

		this.url.searchParams.set("_sort", id);
		this.url.searchParams.set("_order", order);
		this.url.searchParams.set("_start", (page - 1) * size);
		this.url.searchParams.set("_end", (page - 1) * size + size);

		return await fetchJson(this.url);
	}

	async sort(id = this.sorted.id, order = this.sorted.order) {
		this.sorted = {
			id,
			order,
		};

		this.renderArrow(this.sorted.id, this.sorted.order);

		this.paggination.page = 1;

		if (this.isSortServer) {
			this.element.classList.add("sortable-table_loading");
			this.data = await this.loadData(this.paggination.page, this.sorted);
			this.element.classList.remove("sortable-table_loading");
		} else {
			this.allData = this.getSortArray(this.allData, this.sorted.id, this.sorted.order);
			this.data = this.getDataOfPage(this.paggination.page);
		}

		this.renderBody();
	}

	getDataOfPage(page) {
		return SortableTable.chunk(this.allData, this.paggination.size)[page - 1] || []
	}

	getSortArray(arr, id, order) {
		const { sortType, sortable } = this.headersConfig.find(
			(e) => e.id === id
		);

		if (typeof sortable !== "function") {
			return arr.sort((a, b) =>
				SortableTable.sort(
					sortType,
					order,
					a[id],
					b[id]
				)
			);
		} else {
			return arr.sort((a, b) =>
				sortable(this.sorted.order, a[this.sorted.id], b[this.sorted.id])
			);
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

		if (cellClick) {
			const {
				dataset: { id, order },
			} = cellClick;

			this.sort(id, SortableTable.getOrder(order));
		}
	};

	onScroll = (event) => {
		if (this.checkBottomBorder) {
			this.renderNextPage();
		}
	};
}
