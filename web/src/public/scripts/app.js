let $searchTerm = null;
let $searchTermType = null;
let $resultsList = null;
let $resultTemplate = null;
let $modalToggleButton = null;
let $modal = null;

/**
 * Trigger API to search for businesses.
 * 
 * @param {'businessAddress'|'businessName'} termType Term type that will be used for search.
 * @param {string} term Actual search term
 * @returns {Promise<object>}
 */
const SearchForBusiness = async (termType, term) => {
	return new Promise((resolve) => {
		const request = new XMLHttpRequest();

		request.addEventListener('load', function () {
			try {
				resolve(JSON.parse(this.responseText));
			} catch (error) {
				console.error(error);

				return resolve(null);
			}
		});

		request.open('POST', `/api/business/search?type=${termType}`);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify({ term }));
	});
};

/**
 * Handle search trigger, and execute actual search
 */
const PerformSearch = async () => {
	if ($searchTerm.value && $searchTermType.value) {
		const results = await SearchForBusiness($searchTermType.value, $searchTerm.value);

		$resultsList.innerHTML = '';

		if (Array.isArray(results) && results.length) {
			results.forEach((result) => {
				const $resultCard = $resultTemplate.content.cloneNode(true);
				const $element = document.createElement('div');

				$resultCard.getElementById('result-name').innerHTML = result.name;
				$resultCard.getElementById('result-address').innerHTML = result.address;

				$element.style = 'cursor: pointer;';
				$element.classList = 'column column-offset-10';
				$element.appendChild($resultCard);
				$element.onclick = () => {
					$modal.querySelector('#result-preview-name').innerHTML = result.name;
					$modal.querySelector('#result-preview-phone').innerHTML = result.phone;
					$modal.querySelector('#result-preview-address').innerHTML = result.address;
					$modal.querySelector('#result-preview-website').innerHTML = result.website;

					$modalToggleButton.click();
				};

				$resultsList.appendChild($element);
			});
		}
	}
}

window.onload = () => {
	$resultTemplate = document.getElementById('search-result-card');
	$searchTerm = document.getElementById('search-term');
	$searchTermType = document.getElementById('search-term-type');
	$modalToggleButton = document.getElementById('toggle-modal');
	$modal = document.getElementById('result-preview-modal');
	$resultsList = document.getElementById('results-container');

	const $searchButton = document.getElementById('search-perform');
	const $searchForm = document.getElementById('search-form');

	$searchButton.onclick = PerformSearch;
	$searchForm.onsubmit = (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		PerformSearch();
	};
};