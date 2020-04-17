import SortableTable from "./index";

const data = [
	{
		id: "soska-(pustyshka)-nuk-10729357",
		title: "А",
		price: 3,
		sales: 14,
		status: 1,
	},
	{
		id: "detskiy-velosiped-lexus-trike-racer-trike",
		title: "В",
		price: 1,
		sales: 11,
		status: 3,
	},
	{
		id: "tv-tyuner-d-color--dc1301hd",
		title: "Б",
		price: 15,
		sales: 13,
		status: 2,
	},
	{
		id: "powerbank-akkumulyator-hiper-sp20000",
		title: "Д",
		price: 30,
		sales: 11,
		status: 4,
	},
	{
		id: "soska-(pustyshka)-philips-scf182/12",
		title: "Г",
		price: 9,
		sales: 11,
		status: 5,
	},
];

export const header = [
	{
		id: "title",
		title: "Name",
		sortable: true,
		sortType: "string",
	},
	{
		id: "price",
		title: "Price",
		sortable: true,
		sortType: "number",
	},
	{
		id: "sales",
		title: "Sales",
		sortable: true,
		sortType: "number",
	},
	{
		id: "status",
		title: "Status",
		sortable: (order, a, b) => {
			return (order === 'asc' ? -1 : 1) * (a - b)
		},
	},
];

describe("SortableTable", () => {
	let sortableTable;

	beforeEach(() => {
		sortableTable = new SortableTable(header, { data });

		document.body.append(sortableTable.element);
	});

	afterEach(() => {
		sortableTable.destroy();
		sortableTable = null;
	});

	it("should be rendered correctly", () => {
		expect(sortableTable.element).toBeVisible();
		expect(sortableTable.element).toBeInTheDocument();
	});

	it("should have ability default sorting", () => {
		const columns = sortableTable.element.querySelectorAll(
			`.sortable-table__cell[data-sortable]`
		);

		const isSortingExistsColumn = [...columns].find((column) => column.dataset.order);

		const cellIndex = header.findIndex(obj => obj.id === isSortingExistsColumn.dataset.id);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("А");
		expect(lastRow.children[cellIndex].textContent).toEqual("Д");
		expect(isSortingExistsColumn).not.toBeUndefined();
	});

	it("should be dataset field id and order", () => {
		sortableTable.subElements.header.querySelectorAll(
			`.sortable-table__cell[data-sortable]`
		).forEach(e => {
			expect(e.dataset.id).not.toBeUndefined();
			expect(e.dataset.order).not.toBeUndefined();
		});
	});

	it("should have ability sorting by click. sort 'asc' correctly for 'sortType' equal number", () => {
		const field = 'price';

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = 'asc';

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex(obj => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("1");
		expect(lastRow.children[cellIndex].textContent).toEqual("30");
	});

	it("should have ability sorting by click. sort 'desc' correctly for 'sortType' equal number", () => {
		const field = "price";

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = "desc";

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex((obj) => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("30");
		expect(lastRow.children[cellIndex].textContent).toEqual("1");
	});

	it("should have ability sorting by click. sort 'asc' correctly for 'sortType' equal string", () => {
		const field = 'title';

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = 'asc';

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex(obj => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("А");
		expect(lastRow.children[cellIndex].textContent).toEqual("Д");
	});

	it("should have ability sorting by click. sort 'desc' correctly for 'sortType' equal string", () => {
		const field = "title";

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = "desc";

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex((obj) => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("Д");
		expect(lastRow.children[cellIndex].textContent).toEqual("А");
	});

	it("should have ability sorting by click. sort 'asc' correctly for custom sorting", () => {
		const field = 'status';

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = 'asc';

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex(obj => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("5");
		expect(lastRow.children[cellIndex].textContent).toEqual("1");
	});

	it("should have ability sorting by click. sort 'asc' correctly for custom sorting", () => {
		const field = 'status';

		const priceColumn = sortableTable.subElements.header.querySelector(
			`.sortable-table__cell[data-id='${field}'][data-sortable]`
		);

		priceColumn.dataset.order = 'desc';

		priceColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		const cellIndex = header.findIndex(obj => obj.id === field);

		const {
			subElements: {
				body: { firstElementChild: firstRow, lastElementChild: lastRow },
			},
		} = sortableTable;

		expect(firstRow.children[cellIndex].textContent).toEqual("1");
		expect(lastRow.children[cellIndex].textContent).toEqual("5");
	});

	it("should have ability to be destroyed", () => {
		setTimeout(() => {
			sortableTable.destroy();

			expect(sortableTable.element).not.toBeInTheDocument();
		});
	});
});
