import ImageUploader from '../../../utils/ImageUploader.js';
import HTMLBulder from '../../../utils/HTMLBulder.js';
import SubElements from '../../../utils/SubElements.js';

export default class ProductFormComponent {
	element;
	subElements = {};
	defaultFormData = {
		title: "",
		description: "",
		subcategory: "",
		price: "",
		discount: "",
		quantity: "",
		status: "",
		images: [],
		categories: [],
	};

	get template() {
		return `
		<div class="product-form">
			<form data-elem="productForm" class="form-grid">
				<div class="form-group form-group__half_left">
					<fieldset>
						<label class="form-label">Название товара</label>
						<input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${this.formData.title}"/>
					</fieldset>
				</div>
				<div class="form-group form-group__wide">
					<fieldset>
						<label class="form-label">Описание</label>
						<textarea required="" class="form-control" name="description" placeholder="Описание товара">${this.formData.description}</textarea>
					</fieldset>
				</div>
				<div class="form-group form-group__wide">
					<label class="form-label">Фото</label>
					<ul data-elem="sortableList" class="sortable-list"></ul>
					<button type="button" name="uploadImage" class="button-primary-outline">
						<span>Загрузить</span>
					</button>
					</div>
				<div class="form-group form-group__half_left">
					<fieldset>
						<label class="form-label">Категория</label>
						<select data-elem="categoryList" class="form-control" name="category"></select>
					</fieldset>
				</div>
				<div class="form-group form-group__half_left form-group__two-col">
					<fieldset>
						<label class="form-label">Цена ($)</label>
						<input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.formData.price}"/>
					</fieldset>
					<fieldset>
						<label class="form-label">Скидка ($)</label>
						<input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.formData.discount}"/>
					</fieldset>
				</div>
				<div class="form-group form-group__part-half">
					<label class="form-label">Количество</label>
					<input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.formData.quantity}"/>
				</div>
				<div class="form-group form-group__part-half">
					<label class="form-label">Статус</label>
					<select class="form-control" name="status">
						<option value="1">Активен</option>
						<option value="0">Неактивен</option>
					</select>
				</div>
				<div class="form-buttons">
					<button type="submit" name="save" class="button-primary-outline">
						Сохранить товар
					</button>
				</div>
			</form>
		</div>`;
	}

	constructor(formData = {}) {
		this.formData = { ...this.defaultFormData, ...formData };

		this.render();
	}

	render() {
		this.element = HTMLBulder.getElementFromString(this.template);

		this.subElements = new SubElements(this.element).subElements("[data-elem]");

		this.renderCategoryList();

		this.formData.images.forEach(this.renderNewElementToSortableList.bind(this));

		this.initEventListeners();
	}

	renderCategoryList() {
		this.subElements.categoryList.innerHTML = '';
		this.subElements.categoryList
			.append(...this.formData.categories
				.map(e => HTMLBulder.getElementFromString(`<option value="${e.value}">${e.text}</option>`)));
	}

	renderNewElementToSortableList(img) {
		this.subElements.sortableList.append(HTMLBulder.getElementFromString(`
			<li class="products-edit__imagelist-item sortable-list__item" style="">
				<input type="hidden" name="url" value="https://i.imgur.com/MWorX2R.jpg"/>
				<input type="hidden" name="source" value="75462242_3746019958756848_838491213769211904_n.jpg"/>
				<span>
					<img src="./icon-grab.svg" data-grab-handle="" alt="grab"/>
					<img class="sortable-table__cell-img" alt="${img.name}" src="${img.url}"/>
					<span>${img.name}</span>
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

			this.subElements.productForm.uploadImage.classList.add("is-loading");
			this.subElements.productForm.uploadImage.disabled = true;

			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				const { result: url } = await ImageUploader.uploadLocaly(file);
				// OR
				// const { data: { link: url } } = await ImageUploader.upload(file);

				this.renderNewElementToSortableList({
					url,
					name: file.name
				});
			}
			
			this.subElements.productForm.uploadImage.classList.remove("is-loading");
			this.subElements.productForm.uploadImage.disabled = false;

			target.remove();
		});
	};

	dispatchEvent() {
		this.element.dispatchEvent(new CustomEvent("product-saved", {
			detail: {
				formData: this.getFormData(),
			},
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
		this.subElements.productForm.uploadImage.addEventListener('click', this.onUploadImage);
	}

	removeEventListeners() {
		this.subElements.productForm.removeEventListeners('submit', this.onSubmit);
		this.subElements.productForm.uploadImage.removeEventListeners('click', this.onUploadImage);
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

	onSubmit = (event) => {
		event.preventDefault();
		this.dispatchEvent();
	};
	
	onUploadImage = () => {
		this.uploadImage();
	};
}
