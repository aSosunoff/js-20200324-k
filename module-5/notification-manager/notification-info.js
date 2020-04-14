import { NotificationMessage } from "./notification.js";

export class NotificationInfo extends NotificationMessage {
	constructor(title, message, { duration = null, isClose = null } = {}) {
		super(title, message, { duration, isClose, type: "info" });
	}
}
