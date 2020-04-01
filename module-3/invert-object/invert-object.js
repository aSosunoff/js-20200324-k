export function invertObj(obj) {
    if (!obj) {
        return;
    }

	Object.entries(obj).forEach(([key, value]) => {
		obj[value] = key;
		delete obj[key];
    });
    
    return obj;
}
