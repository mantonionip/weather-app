function r(num) {
	console.log(num);

	// Base case
	if (num === 0) {
		return 'End!';
	} else {
		num--;
		return r(num);
	}
}

r(10);

function fibonacci(num) {
	var a = 1,
		b = 0,
		temp;

	while (num >= 0) {
		temp = a;
		a = a + b;
		b = temp;
		num--;
	}

	return b;
}

function fibonacci(num) {
	if (num <= 1) return 1;

	return fibonacci(num - 1) + fibonacci(num - 2);
}
