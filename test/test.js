const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;
chai.use(chaiHttp);
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { Builder, By, Key, until, WebDriver } = require('selenium-webdriver'),
	chrome = require('selenium-webdriver/chrome');
var driver;
let $city,
	$suggestions,
	$selectedCityInfo,
	$selectedCity,
	$selctedWeather,
	$selectedStatus,
	$resetBtn;

const options = new chrome.Options();
options.addArguments('headless');
var request = require('request');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Weather app \n', function () {
	this.timeout(100000);

	before(function (done) {
		driver = new Builder()
			.forBrowser('chrome')
			.setChromeOptions(options)
			.build();
		driver.get('http://localhost:8001').then(() => {
			console.log('Got page');
			done();
		});
	});

	after(function () {
		driver.quit();
	});

	beforeEach(async function () {
		driver.navigate().refresh();
		$city = await driver.findElement(By.id('city'));
		$suggestions = await driver.findElement(By.id('suggestions'));
		$selectedCityInfo = await driver.findElement(By.id('selectedCityInfo'));
		$selectedCity = await driver.findElement(By.id('selectedCity'));
		$selctedWeather = await driver.findElement(By.id('selctedWeather'));
		$selectedStatus = await driver.findElement(By.id('selectedStatus'));
		$resetBtn = await driver.findElement(By.id('resetBtn'));
	});

	it('should suggest items on typing city name', async function () {
		$city.sendKeys('da');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=da',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;
		let data = JSON.parse(response).data;
		await wait(2000);

		const suggestion1 = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		const suggestion2 = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[1].innerText"
		);
		const suggestion3 = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[2].innerText"
		);
		expect(suggestion1).to.equal(data[0].name);
		expect(suggestion2).to.equal(data[1].name);
		expect(suggestion3).to.equal(data[2].name);
	});

	it("selecting a suggestion should change the input field value to the selected city's name", async function () {
		$city.sendKeys('dall');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=dall',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;
		let data = JSON.parse(response).data;
		await wait(2000);
		await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].click()"
		);
		const nameVal = await driver.executeScript(
			"return document.querySelector('#city').value"
		);
		expect(nameVal).to.equal(data[0].name);
	});

	it('should add the contents to the selected section on selecting an option', async function () {
		$city.sendKeys('dall');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=dall',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;
		let data = JSON.parse(response).data;

		await wait(2000);
		await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].click()"
		);
		const selectedCityval = await driver.executeScript(
			"return document.querySelector('#selectedCity').innerText"
		);
		expect(selectedCityval).to.equal(data[0].name);
		const selctedWeatherVal = await driver.executeScript(
			"return document.querySelector('#selctedWeather').innerText"
		);
		expect(selctedWeatherVal).to.equal(data[0].weather);
		const selectedStatusVal = await driver.executeScript(
			"return document.querySelector('#selectedStatus').innerText"
		);
		//expect(selectedStatusVal).to.equal('Wind: 2Kmph,Humidity: 5%');
	});

	it('should debounce before making API calls - no result found', async function () {
		$city.sendKeys('x');
		$city.sendKeys('xy');
		$city.sendKeys('xyz');
		$city.sendKeys('xyzz');
		const text = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(text).to.equal('No Info available!');
		await wait(5000);
		const finalText = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(finalText).to.equal('No results');
	});

	it('should debounce before making API calls - result should have final call results', async function () {
		$city.sendKeys('a');
		$city.sendKeys('ab');
		$city.sendKeys('abe');
		$city.sendKeys('aber');
		const text = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(text).to.equal('No Info available!');
		await wait(2000);
		let finalText = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(finalText).to.equal('No results');

		await $city.clear();
		$city.sendKeys('aber');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				`https://jsonmock.hackerrank.com/api/weather?name=aber`,
				(err, response, body) => {
					resolve(body);
				}
			);
		});
		await wait(2000);

		let response = await responsePromise;
		// Data is loaded and now the first suggestion should be Aberdeen
		let data = JSON.parse(response).data;
		finalText = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(finalText).to.equal('Aberdeen');

		await $city.clear();
		await $city.sendKeys('dall');
		await wait(1);
		finalText = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(finalText).to.equal('Aberdeen');
	});

	it('should show "No results" message if the data is empty', async function () {
		$city.sendKeys('xyz');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=xyz',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		await responsePromise;
		await wait(2000);
		const text = await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].innerText"
		);
		expect(text).to.equal('No results');
		const isRed = await driver.executeScript(
			`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
		);
		expect(isRed).to.be.true;
	});

	it('should show "No results" message in red color', async function () {
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=xyz',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		await responsePromise;
		$city.sendKeys('xyz');
		await wait(2000);
		const isRed = await driver.executeScript(
			`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
		);
		expect(isRed).to.be.true;
	});

	it('should have a reset button which resets all entries', async function () {
		$city.sendKeys('dall');
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				'https://jsonmock.hackerrank.com/api/weather?name=dall',
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		await responsePromise;
		await wait(2000);
		await driver.executeScript(
			"return document.getElementsByClassName('suggestionItem')[0].click()"
		);
		await $resetBtn.click();
		const cityFieldContent = await driver.executeScript(
			"return document.querySelector('#city').value"
		);
		const selectedCityContent = await driver.executeScript(
			"return document.querySelector('#selectedCity').innerText"
		);
		const selctedWeatherContent = await driver.executeScript(
			"return document.querySelector('#selctedWeather').innerText"
		);
		const selectedStatusContent = await driver.executeScript(
			"return document.querySelector('#selectedStatus').innerText"
		);
		expect(cityFieldContent).to.equal('');
		expect(selectedCityContent).to.equal('');
		expect(selctedWeatherContent).to.equal('');
		expect(selectedStatusContent).to.equal('');
	});

	it('make sure api is hit - test 1', async function () {
		let randomString = makeid(2);
		$city.sendKeys(randomString);
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				`https://jsonmock.hackerrank.com/api/weather?name=${randomString}`,
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;

		let data = JSON.parse(response).data;

		await wait(2000);

		if (data.length > 0) {
			if (data[0]) {
				const suggestion1 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[0].innerText"
				);
				expect(suggestion1).to.equal(data[0].name);
			}
			if (data[1]) {
				const suggestion2 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[1].innerText"
				);
				expect(suggestion2).to.equal(data[1].name);
			}
			if (data[2]) {
				const suggestion3 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[2].innerText"
				);
				expect(suggestion3).to.equal(data[2].name);
			}
		} else {
			const text = await driver.executeScript(
				"return document.getElementsByClassName('suggestionItem')[0].innerText"
			);
			expect(text).to.equal('No results');
			const isRed = await driver.executeScript(
				`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
			);
			expect(isRed).to.be.true;
		}
	});

	it('make sure api is hit - test 2', async function () {
		let randomString = makeid(2);
		$city.sendKeys(randomString);
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				`https://jsonmock.hackerrank.com/api/weather?name=${randomString}`,
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;

		let data = JSON.parse(response).data;
		await wait(2000);

		if (data.length > 0) {
			if (data[0]) {
				const suggestion1 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[0].innerText"
				);
				expect(suggestion1).to.equal(data[0].name);
			}
			if (data[1]) {
				const suggestion2 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[1].innerText"
				);
				expect(suggestion2).to.equal(data[1].name);
			}
			if (data[2]) {
				const suggestion3 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[2].innerText"
				);
				expect(suggestion3).to.equal(data[2].name);
			}
		} else {
			const text = await driver.executeScript(
				"return document.getElementsByClassName('suggestionItem')[0].innerText"
			);
			expect(text).to.equal('No results');
			const isRed = await driver.executeScript(
				`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
			);
			expect(isRed).to.be.true;
		}
	});

	it('make sure api is hit - test 3', async function () {
		let randomString = makeid(1);
		$city.sendKeys(randomString);
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				`https://jsonmock.hackerrank.com/api/weather?name=${randomString}`,
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;

		let data = JSON.parse(response).data;

		await wait(2000);

		if (data.length > 0) {
			if (data[0]) {
				const suggestion1 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[0].innerText"
				);
				expect(suggestion1).to.equal(data[0].name);
			}
			if (data[1]) {
				const suggestion2 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[1].innerText"
				);
				expect(suggestion2).to.equal(data[1].name);
			}
			if (data[2]) {
				const suggestion3 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[2].innerText"
				);
				expect(suggestion3).to.equal(data[2].name);
			}
		} else {
			const text = await driver.executeScript(
				"return document.getElementsByClassName('suggestionItem')[0].innerText"
			);
			expect(text).to.equal('No results');
			const isRed = await driver.executeScript(
				`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
			);
			expect(isRed).to.be.true;
		}
	});

	it('make sure api is hit - test 4', async function () {
		let randomString = makeid(1);
		$city.sendKeys(randomString);
		const responsePromise = new Promise((resolve, reject) => {
			request.get(
				`https://jsonmock.hackerrank.com/api/weather?name=${randomString}`,
				(err, response, body) => {
					resolve(body);
				}
			);
		});

		let response = await responsePromise;

		let data = JSON.parse(response).data;

		await wait(2000);

		if (data.length > 0) {
			if (data[0]) {
				const suggestion1 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[0].innerText"
				);
				expect(suggestion1).to.equal(data[0].name);
			}
			if (data[1]) {
				const suggestion2 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[1].innerText"
				);
				expect(suggestion2).to.equal(data[1].name);
			}
			if (data[2]) {
				const suggestion3 = await driver.executeScript(
					"return document.getElementsByClassName('suggestionItem')[2].innerText"
				);
				expect(suggestion3).to.equal(data[2].name);
			}
		} else {
			const text = await driver.executeScript(
				"return document.getElementsByClassName('suggestionItem')[0].innerText"
			);
			expect(text).to.equal('No results');
			const isRed = await driver.executeScript(
				`return getComputedStyle(document.querySelectorAll(".suggestionItem")[0]).color === "rgb(255, 0, 0)"`
			);
			expect(isRed).to.be.true;
		}
	});

	function makeid(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * charactersLength)
			);
		}
		return result;
	}
});
