import Table from './Table.js';

const chunk = (arr = [], size) => {
	const a = [...arr];

	return Array(Math.ceil(a.length / size))
		.fill([])
		.map((e, inx) => a.slice(inx * size, inx * size + size));
}

export default class TablePagging extends Table {
	paggination = {
		size: 5,
		page: 1,
	};

	constructor(
		headersConfig,
		{
			data,
			sorted,
			pageSize = 5,
		} = {}
	) {
		super(headersConfig, { data, sorted });
		this.paggination.size = pageSize;
		this.renderBody();
	}
	
	/**@override */
	renderBody() {
		if (!this.paggination) return;

		this.subElements.body.innerHTML = '';

		this.renderNextRows(this.getDataOfPage(1));	
	}


	renderNextPage() {
		let dataChunk = this.getDataOfPage(this.paggination.page + 1);

		if (dataChunk && dataChunk.length) {
			this.paggination.page += 1;
			this.renderNextRows(dataChunk);
			return dataChunk;
		}
	}

	getVisibleData() {
		return this.data.slice(0, this.paggination.page * this.paggination.size);
	}

	getDataOfPage(page) {
		return chunk(
			this.getSortArray(
				this.data,
				this.sorted.id, 
				this.sorted.order), 
			this.paggination.size)[page - 1] || [];
	}
}
