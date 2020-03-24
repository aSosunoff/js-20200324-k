function checkAge(age) {
	if (age > 18) {
		return true;
	} else {
		return confirm("Родители разрешили?");
	}
}


const checkAge_1 = (age > 18) || confirm("Родители разрешили?");

const checkAge_2 = (age > 18) ? true : confirm("Родители разрешили?");


