function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div.firstElementChild;
}

export class NotificationMessage {
	element;
	duration;
	type;
	message;
	title;
	isClose;
	timer = null;
	get template() {
		return `
		<div 
			class="notification 
			${this.type} 
			${!this.isClose ? "notification-fade-out" : ""}" 
			style="--value: ${this.duration}ms;">
			${!this.isClose ? '<div class="timer"></div>' : ""}
				<div class="inner-wrapper">
					<div class="notification-header">
						${this.title}
						${this.isClose ? '<span class="close">×</span>' : ""}
					</div>
					<div class="notification-body">${this.message}</div>
				</div>
		</div>`;
	}

	constructor(
		title,
		message,
		{ duration = 1000, type = "success", isClose = false } = {}
	) {
		this.title = title;
		this.duration = duration;
		this.type = type;
		this.message = message;
		this.isClose = isClose;
		this.element = createElementFromHTML(this.template);
		this.initEventListeners();
	}

	onClickRemove = (e) => {
		if (!e.target.closest(".close")) {
			return;
		}

		this.remove();
	}

	initEventListeners() {
		if (this.isClose) {
			this.element.addEventListener("click", this.onClickRemove);
		}
	}

	destroyEventListeners() {
		this.element.removeEventListener("click", this.onClickRemove);
	}

	show(target = document.body) {
		target.append(this.element);

		if (this.isClose) {
			return;
		}

		clearTimeout(this.timer);

		this.timer = setTimeout(() => {
			this.remove();
		}, this.duration);
	}

	remove() {
		this.element.remove();
		clearTimeout(this.timer);
		this.timer = null;
	}

	destroy() {
		this.remove();
		this.destroyEventListeners();
	}
}
