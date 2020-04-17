import { NotificationMessage } from './notification.js';

export class NotificationManager {
    target;
    stackLimit;
    notificationsList;

	constructor({ target = document.body, stackLimit = 4 } = {}, ...notifications) {
        this.target = target;
        this.stackLimit = stackLimit;
        this.notificationsList = [];

        notifications.forEach((e) => {
            const { 
                nameMethod = this._getNameMethod(e.defaultSetting),
                defaultSetting, 
            } = e;

            if(!defaultSetting) {
                throw new Error("You need set default instance");
            }

            if (!(defaultSetting instanceof NotificationMessage)) {
                throw new Error("Notification is not extends from NotificationMessage");
            }

            const {
                title: titleDefault,
                message: messageDefault,
                duration: durationDefault,
                isClose: isCloseDefault,
            } = defaultSetting;

            this[nameMethod] = (
                title = titleDefault, 
                message = messageDefault,
                {
                    duration = durationDefault, 
                    isClose = isCloseDefault 
                } = {}) => 
            {
                const notification = new defaultSetting.constructor(title, message, { duration, isClose });
                
                notification.show(this.target);

                if (this.notificationsList.length >= this.stackLimit) {
                    this.notificationsList.shift().remove()
                }

                if (!isClose) {
                    this.notificationsList.push(notification);
                }
            };
        });
    }
    
    _getNameMethod(instanceNotification) {
        return instanceNotification.type[0].toLocaleUpperCase() + instanceNotification.type.slice(1).toLocaleLowerCase()
    }

	destroy() {
		this.notificationsList = [];
	}
}
