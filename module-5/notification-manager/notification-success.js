import { NotificationMessage } from "./notification.js";

export class NotificationSuccess extends NotificationMessage {
	constructor(title = "" , message = "", { duration, isClose } = {}) {
		super(title, message, { duration, isClose, type: "success" });
	}
}
