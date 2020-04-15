import { NotificationMessage } from "./notification.js";

export class NotificationError extends NotificationMessage {
	constructor(title = "" , message = "", { duration, isClose } = {}) {

		super(title, message, { duration, isClose, type: "error" });
	}
}
