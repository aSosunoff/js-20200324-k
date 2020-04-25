import ImageUploader from '../../../utils/ImageUploader.js';
import HTMLBulder from '../../../utils/HTMLBulder.js';
import subElements from '../../../utils/subElements.js';
import fetchJson from '../../../utils/fetch-json.js';
import escapeHtml from '../../../utils/escape-html.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductFormComponent {
	element;
	subElements = {};
	idProduct = null;
	defaultFormData = {
		id: null,
		title: "",
		description: "",
		subcategory: "",
		price: "",
		discount: "",
		quantity: "",
		status: "",
		images: [],
		categories: [],
		characteristics: [],
	};

	get template() {
		return `
		<div class="product-form">
			<form data-elem="productForm" class="form-grid">
				<input type="hidden" name="id" value=""/>
				<div class="form-group form-group__wide">
					<fieldset>
						<label class="form-label">Название товара</label>
						<input required="" type="text" name="title" class="form-control" placeholder="Название товара" value=""/>
					</fieldset>
				</div>
				<div class="form-group form-group__wide">
					<fieldset>
						<label class="form-label">Описание</label>
						<textarea required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
					</fieldset>
				</div>
				<div class="form-group form-group__wide">
					<label class="form-label">Фото</label>
					<ul data-elem="sortableList" class="sortable-list"></ul>
					<button type="button" data-elem="uploadImage" class="button-primary-outline">
						<span>Загрузить</span>
					</button>
					</div>
				<div class="form-group form-group__half_left">
					<fieldset>
						<label class="form-label">Категория</label>
						<select class="form-control" name="subcategory"></select>
					</fieldset>
				</div>
				<div class="form-group form-group__half_left form-group__two-col">
					<fieldset>
						<label class="form-label">Цена ($)</label>
						<input required="" type="number" name="price" class="form-control" placeholder="100" value=""/>
					</fieldset>
					<fieldset>
						<label class="form-label">Скидка ($)</label>
						<input required="" type="number" name="discount" class="form-control" placeholder="0" value=""/>
					</fieldset>
				</div>
				<div class="form-group form-group__part-half">
					<label class="form-label">Количество</label>
					<input required="" type="number" class="form-control" name="quantity" placeholder="1" value=""/>
				</div>
				<div class="form-group form-group__part-half">
					<label class="form-label">Статус</label>
					<select class="form-control" name="status"></select>
				</div>
				<div class="form-buttons">
					<button type="submit" class="button-primary-outline">
						Сохранить товар
					</button>
				</div>
			</form>
		</div>`;
	}

	constructor(idProduct) {
		this.render();
		this.renderData(idProduct);
	}

	render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = subElements(this.element, "[data-elem]");

		this.initEventListeners();
	}

	async renderData(idProduct) {
		let loadFormData = Promise.resolve(this.defaultFormData);
		if(idProduct){
			loadFormData = this.loadProduct(idProduct);
		}

		try {
			const [product, categories] = await Promise.all([loadFormData, this.loadSubcategory()]);

			this.renderCategoryList(categories);

			this.renderStatusList([
				{ value: 1, text: "Активен" }, 
				{ value: 0, text: "Неактивен" }]);

			this.renderValue(product);

			this.clearSortableList();
			
			product.images.forEach(this.renderNewElementToSortableList.bind(this));
		} catch(err) {
			this.dispatchEventError(err);
			throw err;
		}
	}

	renderValue(product){
		Object.entries(product).forEach(([key, value]) => {
			if(this.subElements.productForm[key]){
				this.subElements.productForm[key].value = value;
			}
		});
	}

	renderCategoryList(categories) {
		const options = categories
			.reduce((options, { title: titleCategory, subcategories }) => {
				const head = new Option(`${titleCategory}`, null);
				head.disabled = true;

				const optionsSubcategories = [
					head, 
					...subcategories.map(({ id, title }) => new Option(`- ${title}`, id))];
				options.push(...optionsSubcategories);
				return options;
			}, []);

		this.subElements.productForm.subcategory.innerHTML = '';
		this.subElements.productForm.subcategory.append(...options);
	}

	async loadProduct(idProduct) {
		try {
			const url = new URL('api/rest/products', BACKEND_URL);
			url.searchParams.set("id", idProduct);
			const [data] = await fetchJson(url);
			return data;
		} catch(err) {
			this.dispatchEventError(err);
			throw err;
		}
	}

	async loadSubcategory() {
		try {
			const url = new URL('api/rest/categories', BACKEND_URL);
			url.searchParams.set("_sort", 'weight');
			url.searchParams.set("_refs", 'subcategory');
			const data = await fetchJson(url);
			return data;
		} catch(err) {
			this.dispatchEventError(err);
			throw err;
		}
	}

	renderStatusList(statusList) {
		this.subElements.productForm.status.innerHTML = '';
		this.subElements.productForm.status
			.append(...statusList.map(({ text, value }) => new Option(text, value)));
	}

	clearSortableList(){
		this.subElements.sortableList.innerHTML = '';
	}

	renderNewElementToSortableList = ({source, url}) => {
		this.subElements.sortableList.append(HTMLBulder.getElementFromString(`
			<li class="products-edit__imagelist-item sortable-list__item" style="">
				<span>
					<img src="./icon-grab.svg" data-grab-handle="" alt="grab"/>
					<img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}"/>
					<span>${escapeHtml(source)}</span>
				</span>
				<button type="button">
					<img src="./icon-trash.svg" data-delete-handle="" alt="delete"/>
				</button>
			</li>`));
	}

	uploadImage = () => {
		HTMLBulder.createUploadImageInput(async ({ target }) => {
			let [...files] = target.files;
			if (!files || !files.length) return;

			this.subElements.uploadImage.classList.add("is-loading");
			this.subElements.uploadImage.disabled = true;

			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				const { result: url } = await ImageUploader.uploadLocaly(file);
				// OR
				// const { data: { link: url } } = await ImageUploader.upload(file);

				this.renderNewElementToSortableList({
					url,
					source: file.name
				});
			}
			
			this.subElements.uploadImage.classList.remove("is-loading");
			this.subElements.uploadImage.disabled = false;

			target.remove();
		});
	};

	dispatchEvent(formData) {
		const event = formData.id 
			? "product-updated"
			: "product-saved";

		this.element.dispatchEvent(new CustomEvent(event, {
			detail: {
				formData,
			},
			bubbles: true,
		}));
	}

	dispatchEventError(e) {
		this.element.dispatchEvent(new CustomEvent("product-error", {
			detail: e,
			bubbles: true,
		}));
	}

	getFormData() {
		const formData = new FormData(productForm.subElements.productForm);
		const imagesElementArray = Array.from(this.subElements.sortableList.querySelectorAll(".sortable-table__cell-img"))
		return {
			...Object.fromEntries(formData),
			images: imagesElementArray.map(({src, alt}) => ({
				url: src,
				source: alt,
			})),
		};
	}

	initEventListeners() {
		this.subElements.productForm.addEventListener('submit', this.onSubmit);
		this.subElements.uploadImage.addEventListener('click', this.onUploadImage);
		this.subElements.sortableList.addEventListener('click', this.onRemoveImage);
	}

	removeEventListeners() {
		this.subElements.productForm.removeEventListeners('submit', this.onSubmit);
		this.subElements.uploadImage.removeEventListeners('click', this.onUploadImage);
		this.subElements.sortableList.removeEventListeners('click', this.onRemoveImage);
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();
		this.removeEventListeners();
		this.element = null;
		this.subElements = null;
	}

	onSubmit = async (event) => {
		event.preventDefault();
		const formData = this.getFormData();
		const url = new URL('api/rest/products', BACKEND_URL);

		try {
			const product = await fetchJson(url, {
				method:"PATCH",
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
	
			console.log(product);
			
			this.dispatchEvent(formData);
		} catch(err) {
			this.dispatchEventError(err);
		}
	};
	
	onUploadImage = () => {
		this.uploadImage();
	};

	onRemoveImage = ({ target }) => {
		const image = target.closest('li');
		if("deleteHandle" in target.dataset && image) {
			image.remove();
		}
	}
}
