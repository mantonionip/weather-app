function Weather() {}

// Given a search, returns a promise with the resolved results from the weather API
Weather.prototype.fetchResults = function (val) {
	return new Promise(async (resolve, reject) => {
		// Calls the API with the search input and parses the response with the .json() function
		const res = await fetch(
			'https://jsonmock.hackerrank.com/api/weather/?name=' + val
		);
		const cities = await res.json();

		if (cities.error) {
			reject(cities.error);
		}

		resolve(cities.data);
	});
};

// Used on search input keyup event
Weather.prototype.onKeyup = function (event) {
	// Gets input value from event object
	const value = event.target.value;

	// Cancel previous debounced API call
	clearTimeout(this.timer);

	// If input is empty, end the function here
	if (!value.trim()) {
		return;
	}

	// Call updateSuggestions after 1 second;
	// save the timeoutOut id to cancel if input changes in less than 1 sec
	this.timer = setTimeout(() => {
		this.updateSuggestions(value);
	}, 1000);
};

// Given a city and its weather status, shows the information
Weather.prototype.updatecitySelect = async function (city) {
	// this.weatherResults[cityIndex]

	// Get the city name, status and weather
	const { name, status, weather } = city;

	// Remove previous suggestions
	this.$suggestions.innerHTML = '';

	// Complete city input and box information
	this.$city.value = name;
	this.$selectedCity.innerHTML = name;
	this.$selectedStatus.innerHTML = status;
	this.$selctedWeather.innerHTML = weather;
};

// Given an input value/search, search using the API and show the city suggestions
Weather.prototype.updateSuggestions = async function (value) {
	let cities;

	try {
		cities = await this.fetchResults(value);
	} catch (error) {
		return console.warn('Error', error);
	}

	// Saves weatherResults. Not being used in this implementation!
	this.weatherResults = cities;

	// Clear previous suggestions
	this.$suggestions.innerHTML = '';

	// For each city
	cities.forEach((city, index) => {
		// Create a new empty div
		const suggestion = document.createElement('div');

		// Put the city name inside of the div
		suggestion.innerHTML = city.name;

		// Add suggestionItem class
		suggestion.classList.add('suggestionItem');

		// Bind click event => show city info on click
		suggestion.addEventListener('click', () => this.updatecitySelect(city));

		// Finally, append div to container
		this.$suggestions.appendChild(suggestion);
	});

	// If there is no match for the search, then show a "No results" red message
	if (!data.length) {
		this.$suggestions.innerHTML = `<div class="suggestionItem red">No results</div>`;
	}
};

// Clear input and box info
Weather.prototype.reset = function () {
	this.$city.value = '';
	this.$suggestions.innerHTML = '';
	this.$selectedCity.innerHTML = '';
	this.$selectedStatus.innerHTML = '';
	this.$selctedWeather.innerHTML = '';
};

// Initializes the instance by creating elements references
// This code could be moved to the constructor (Weather function) instead
Weather.prototype.init = function () {
	// Define timer for debounce
	this.timer = null;
	// Define empty weather reuslts array
	this.weatherResults = [];

	// Save references to useful elements
	this.$city = document.getElementById('city');
	this.$suggestions = document.getElementById('suggestions');
	this.$selectedInfo = document.getElementById('selectedCityInfo');
	this.$selectedCity = document.getElementById('selectedCity');
	this.$selctedWeather = document.getElementById('selctedWeather');
	this.$selectedStatus = document.getElementById('selectedStatus');
	this.$resetBtn = document.getElementById('resetBtn');

	// Bind keyupevent for search input
	this.$city.addEventListener('keyup', this.onKeyup.bind(this));
	//  Bind click event for reset
	this.$resetBtn.addEventListener('click', this.reset.bind(this));
};

var weatherApp = new Weather();
weatherApp.init();
