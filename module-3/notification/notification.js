function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

export default class NotificationMessage {
	element;
	duration;
	type;
	message;
	timer = null;
	get template() {
		return `<div class="notification ${this.type}" style="--value: ${
			this.duration / 1000
		}s;">
			<div class="timer"></div>
			<div class="inner-wrapper">
				<div class="notification-header">${this.type}</div>
				<div class="notification-body">${this.message}</div>
			</div>
		</div>`;
	}
	static activeNotice = null;

	constructor(message, { duration = 1000, type = "success" } = {}) {
		NotificationMessage.activeNotice &&
			NotificationMessage.activeNotice.remove();

		this.duration = duration;
		this.type = type;
		this.message = message;
		this.render();
		this.initEventListeners();
	}

	show(target) {
		let container = target && "append" in target ? target : document.body;

		container.append(this.element);
		
		clearTimeout(this.timer);

		//this.timer = setTimeout(this.remove.bind(this), this.duration);
	}

	initEventListeners() {}

	render() {
		this.element = createElementFromHTML(this.template);
		NotificationMessage.activeNotice = this;
	}

	remove() {
		this.element.remove();
		clearTimeout(this.timer);
		this.timer = null;
	}

	destroy() {
		this.remove();
		this.activeNotice = null;
	}
}
