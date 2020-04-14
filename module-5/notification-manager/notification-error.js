import { NotificationMessage } from "./notification.js";

export class NotificationError extends NotificationMessage {
	constructor(title, message, { duration = null, isClose = null } = {}) {
		super(title, message, { duration, isClose, type: "error" });
	}
}
