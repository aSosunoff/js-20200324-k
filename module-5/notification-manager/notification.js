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
		return `<div class="notification 
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
		this.render();
		// this.initEventListeners();
	}

	show({ target = document.body, callbackAfterRemove = () => {} } = {}) {
		target.append(this.element);

		clearTimeout(this.timer);

		this.timer = setTimeout(() => {
			if (!this.isClose) {
				this.remove();
			}
			if (typeof callbackAfterRemove === "function") {
				callbackAfterRemove(this);
			}
		}, this.duration);
	}

	render() {
		this.element = createElementFromHTML(this.template);
	}

	remove() {
		this.element.remove();
		clearTimeout(this.timer);
		this.timer = null;
	}

	destroy() {
		this.remove();
	}
}
