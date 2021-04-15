// 8 lights are arranged in a straight line. The lights can be represented as an array of integers where 1 is on and 0 is off.

// Depending on today's configuration of the lights we can determine tomorrow's lights configuration.

// For each light, you can determine whether the light will be on or off tomorrow by looking to the left and to the right of the light (it's direct neighbors). If a light's direct neighbors are both on, or both off, the light will turn off tomorrow, otherwise the light will turn on tomorrow.

// The left and right-most lights only have one direct neighbor so the missing neighbor light is always considered to be off.

// Function Description:
// Complete the function lightsAfterNDays in the editor below.
// lightsAfterNDays has the following parameter(s):
// lights: an array of integers
// days: an integer

// Returns: an array of integers

// Sample Case 0
// Sample Input For Custom Testing
//    lights = [1, 0, 0, 0, 0, 1, 0, 0]
//    days = 1

// Sample Output
// [0, 1, 0, 0, 1, 0, 1, 0]

function fn(lights) {
	return lights.map((light, index, arr) => {
		const next = arr[index + 1] || 0;
		const prev = arr[index - 1] || 0;

		// if (next === 0 && prev === 0 || next === 1 && prev === 1) {
		if (next === prev) {
			return 0;
		} else {
			return 1;
		}
	});
}

function lightsAfterNDays(lights, days) {
	for (let day = 0; day < days; day++) {
		lights = fn(lights);
	}

	return lights;
}
