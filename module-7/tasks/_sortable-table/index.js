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
		};		

		timer = setTimeout(() => {
			f.apply(this, arg);
			clearTimeout(timer);
			timer = null;
		}, delay);
	};
};

const chunk = (arr, size = 1) => {
	const a = arr || [];
	
	return Array(Math.ceil(a.length / size))
		.fill([])
		.map((e, inx) => a.slice(inx * size, inx * size + size));
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
	sorted = {};
	data = [];
	url = "";
	paggination = {
		size: 5,
		page: 1,
	}
	chunkData = [];

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
			pageSize = 15,
		} = {}
	) {
		this.headersConfig = headersConfig;
		this.chunkData = chunk(data, pageSize);
		this.data = this.chunkData[this.paggination.page - 1];
		this.url = url.trim() ? new URL(url.trim(), BACKEND_URL) : url;
		this.paggination.size = pageSize;
		this.sorted = sorted;

		this.onScroll = debounceDecorator(this.onScroll, 100);

		this.render();
	}

	render() {
		this.element = createElementFromHTML(this.template);
		this.subElements = SortableTable.getSubElements(this.element);
		this.renderHeader();
		this.subElements = {
			...this.subElements,
			...SortableTable.getSubElements(this.subElements.header),
		};
		
		this.sort(this.sorted.id, this.sorted.order);

		this.initEventListeners();
	}
	
	renderHeader() {
		this.subElements.header.innerHTML = this.headersConfig
			.map(
				({ id, sortable, title }) => `
				<div 
					class="sortable-table__cell" 
					data-id="${id}" 
					data-sortable="${Boolean(sortable)}"
					data-order="${id === this.sorted.id ? this.sorted.order : ""}">
						<span>${title}</span>
						${
							id === this.sorted.id
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
		if (!this.data.length) {
			this.setEmptyData();
			return;
		} else {
			this.removeEmptyData();
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

		document.addEventListener('scroll', this.onScroll);
	}

	removeEventListeners() {
		this.subElements.header.removeEventListener(
			"click",
			this.onSortableCellHandler
		);

		document.removeEventListener("scroll", this.onScroll);
	}

	async loadData(page) {
		this.url.searchParams.set('_sort', this.sorted.id);
		this.url.searchParams.set('_order', this.sorted.order);
		this.url.searchParams.set('_start', (page - 1) * this.paggination.size);
		this.url.searchParams.set('_end', (page - 1) * this.paggination.size + this.paggination.size);

		return await fetchJson(this.url);
	}

	async scrollServer() {
		const dataChunk = await this.loadData(this.paggination.page + 1);
		
		if (dataChunk.length) {
			this.paggination.page += 1
			this.data.push(...dataChunk);
			this.renderBody();	
		}
	}

	async scrollLocaly() {
		const dataChunk = this.chunkData[this.paggination.page];
		
		if (dataChunk.length) {
			this.paggination.page += 1
			this.data.push(...dataChunk);
			this.renderBody();	
		}
	}

	async sortServer() {
		this.loadingToggle();

		this.data = await this.loadData(1);
	
		this.renderBody();

		this.loadingToggle();
	}

	sortLocaly() {
		const { sortType, sortable } = this.headersConfig.find(
			(e) => e.id === this.sorted.id
		);

		if (typeof sortable !== "function") {
			this.data = this.data.sort((a, b) =>
				SortableTable.sort(sortType, this.sorted.order, a[this.sorted.id], b[this.sorted.id])
			);
		} else {
			this.data = this.data.sort((a, b) => sortable(this.sorted.order, a[this.sorted.id], b[this.sorted.id]));
		}

		this.renderBody();
	}

	async sort(id, order = 'asc') {
		this.sorted = {
			id,
			order,
		};

		this.updateSortArrow();

		this.paggination.page = 1;
		
		if (this.url) {
			await this.sortServer();
		} else {
			this.sortLocaly();
		}
	}

	async scroll() {
		if (this.url) {
			await this.scrollServer();
		} else {
			this.scrollLocaly();
		}
	}

	updateSortArrow() {
		const column = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`);

		if (column) {
			column.dataset.order = this.sorted.order;
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

	onScroll = (event) => {
		const { bottom } = document.documentElement.getBoundingClientRect();
		const { clientHeight } = document.documentElement;

		if (bottom < clientHeight + 100) {
			this.scroll();
		}
	};
}
