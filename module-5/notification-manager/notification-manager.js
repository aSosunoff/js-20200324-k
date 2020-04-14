import { NotificationMessage } from './notification.js';

export default class NotificationManager {
	element;

	constructor(target, stackLimit = 4) {
        this.target = target || document.body;
        this.stackLimit = stackLimit;
        this.notificationsList = new Map();
	}

	show(message, { duration = 1000, type = "success" } = {}) {
		/* let container = target && "append" in target ? target : document.body;

		container.append(this.element);
		
		clearTimeout(this.timer);

        this.timer = setTimeout(this.remove.bind(this), this.duration); */
        const notification = new NotificationMessage(message, { duration, type });

        const key = `f${(+new Date()).toString(16)}`;

        notification.show({
            target: this.target,
			callbackAfterRemove: ((key) => {
                return (e) => {
                    this.removeMessageByKey(key);
                }
            })(key)
        });

        if (this.notificationsList.size >= this.stackLimit) {
            this.removeOldMessage();
        }

        this.notificationsList.set(key, notification);
    }
    
    removeMessageByKey(key) {
        if (this.notificationsList.has(key)) {
            this.notificationsList.get(key).remove();
            this.notificationsList.delete(key);
        }
    }

    removeOldMessage() {
        const key = Array.from(this.notificationsList)[0][0];
        this.removeMessageByKey(key);
    }
    
	// initEventListeners() {}

	render() {
		/* this.element = createElementFromHTML(this.template);
		NotificationMessage.activeNotice = this; */
	}

	remove() {
		/* this.element.remove();
		clearTimeout(this.timer);
		this.timer = null; */
	}

	destroy() {
		/* this.remove();
		NotificationMessage.activeNotice = null; */
	}
}
