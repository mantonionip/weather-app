class Weather {
	constructor() {
		this.timer = null;
		this.weatherResults = [];
		this.$city = document.getElementById('city');
		this.$suggestions = document.getElementById('suggestions');
		this.$selectedInfo = document.getElementById('selectedCityInfo');
		this.$selectedCity = document.getElementById('selectedCity');
		this.$selctedWeather = document.getElementById('selctedWeather');
		this.$selectedStatus = document.getElementById('selectedStatus');
		this.$resetBtn = document.getElementById('resetBtn');
		this.$city.addEventListener('keyup', this.onKeyup.bind(this));
		this.$resetBtn.addEventListener('click', this.reset.bind(this));
	}

	fetchResults(val) {
		const promise = fetch(
			'https://jsonmock.hackerrank.com/api/weather/?name=' + val
		).then((res) => res.json());

		return promise;
	}

	onKeyup(event) {
		const value = event.target.value;

		clearTimeout(this.timer);

		if (!value.trim()) {
			return;
		}

		this.timer = setTimeout(() => {
			this.updateSuggestions(value);
		}, 1000);
	}

	updatecitySelect(city) {
		const { name, status, weather } = city;

		this.$suggestions.innerHTML = '';

		this.$city.value = name;
		this.$selectedCity.innerHTML = name;
		this.$selectedStatus.innerHTML = status;
		this.$selctedWeather.innerHTML = weather;
	}

	async updateSuggestions(value) {
		const res = await this.fetchResults(value);

		if (res.error) {
			return alert(res.error);
		}

		const { data: cities } = res;

		this.weatherResults = cities;

		this.$suggestions.innerHTML = '';

		cities.forEach((city, index) => {
			const suggestion = document.createElement('div');
			suggestion.innerHTML = city.name;
			suggestion.classList.add('suggestionItem');
			suggestion.addEventListener('click', () =>
				this.updatecitySelect(city)
			);

			this.$suggestions.appendChild(suggestion);
		});

		if (!cities.length) {
			this.$suggestions.innerHTML = `<div class="suggestionItem red">No results</div>`;
		}
	}

	reset() {
		this.$city.value = '';
		this.$suggestions.innerHTML = '';
		this.$selectedCity.innerHTML = '';
		this.$selectedStatus.innerHTML = '';
		this.$selctedWeather.innerHTML = '';
	}

	init() {}
}

var weatherApp = new Weather();
// weatherApp.init();
