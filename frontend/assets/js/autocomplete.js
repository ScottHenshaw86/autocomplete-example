let selectedIndex = -1;
const selectedColor = "#eee";
let initialValue = "";

const getMatches = (query) => {
    if (!query) {
        // NO CHARACTERS TYPED
        hideResults();
        return;
    }

    // const baseURL = "http://localhost/sites/autocomplete/backend/cities_api.php";
    const baseURL = "https://scotthenshaw86.github.io/autocomplete-example/backend/cities_api.php";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${baseURL}?query=${query}`);
    xhr.addEventListener("load", (e) => {
        resultsContainer.innerHTML = "";
        const response = e.currentTarget.responseText;
        if (e.currentTarget.status === 200 && response.length > 0) {
            const results = response.split("|");
            displayResults(results);
        } else if (e.currentTarget.status !== 200) {
            handleError(e.currentTarget.status);
        } else {
            hideResults();
        }
    });
    xhr.send(null);
}

const sendRequest = (query) => {
    console.log("SEND REQUEST:", query);
    hideResults();

    const apiKey = "IgloaVH0wkO8Qtl9m8On62vRx3MDV8C8Ae247Br1hqCJqFOZ4tcFORfRzJE9yVDF";
    const baseURL = "https://capitalzipcodes.vercel.app";

    const cityState = query.split(" - ");
    const city = cityState[0].replaceAll(" ", "+");
    const state = cityState[1];

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${baseURL}/?api_key=${apiKey}&city=${city}&state=${state}`);
    xhr.addEventListener('load', () => {
        zipcodeContainer.innerHTML = `<h2>Zipcodes for ${cityState[0]} ${state ? " - " + state : ""}`;
        if (xhr.status === 200) {
            const zipcodes = JSON.parse(xhr.responseText).zip_codes;
            console.log(zipcodes);
            zipcodes.forEach(zip => {
                const p = document.createElement('p');
                p.textContent = zip;
                zipcodeContainer.appendChild(p);
            })
        } else {
            const p = document.createElement('p');
            p.textContent = "No zipcodes found";
            zipcodeContainer.appendChild(p);
        }
    });
    xhr.send(null);
}

const displayResults = (results) => {
    resultsContainer.style.display = "block";
    input.dataset.open = true;
    results.forEach((result, index) => {
        const p = document.createElement("p");
        p.textContent = result;
        p.dataset.index = index;
        p.addEventListener('click', handleResultClick, true);
        p.addEventListener('mouseenter', handleMouseEnter);
        p.addEventListener('mouseleave', handleMouseLeave);
        resultsContainer.appendChild(p);
    });
}

const handleError = (status) => {
    console.error(status);
}

const handleResultClick = (e) => {
    console.log("handleResultClick:", Date.now());

    input.value = e.currentTarget.textContent;
    sendRequest(input.value);
    hideResults();
}

input.addEventListener('keydown', (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
})

input.addEventListener('keyup', e => {
    const value = e.currentTarget.value
    if (e.key === "Enter" && value) {
        sendRequest(value);
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleArrowDown(value);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleArrowUp(value);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        input.value = initialValue;
        if (resultsContainer.children[selectedIndex]) {
            resultsContainer.children[selectedIndex].style.backgroundColor = 'initial';
        }
        selectedIndex = -1;
    } else {
        initialValue = value;
        getMatches(value);
    }
});

const handleArrowUp = (value) => {
    const results = resultsContainer.children;
    if (results.length === 0) return; // no results

    selectedIndex--;

    if (results[selectedIndex + 1]) {
        results[selectedIndex + 1].style.backgroundColor = "initial";
    }
    if (selectedIndex >= 0) {
        results[selectedIndex].style.backgroundColor = selectedColor;
        input.value = results[selectedIndex].textContent;
    } else if (selectedIndex === -1) {
        input.value = initialValue;
    } else if (selectedIndex <= -2) {
        selectedIndex = results.length - 1;
        results[selectedIndex].style.backgroundColor = selectedColor;
        input.value = results[selectedIndex].textContent;
    }
}
const handleArrowDown = (value) => {
    const results = resultsContainer.children;
    if (results.length === 0) return; // no results

    selectedIndex++;

    if (results[selectedIndex - 1]) {
        results[selectedIndex - 1].style.backgroundColor = "initial";
    }
    if (selectedIndex >= 0 && selectedIndex < results.length) {
        results[selectedIndex].style.backgroundColor = selectedColor;
        input.value = results[selectedIndex].textContent;
    } else if (selectedIndex >= results.length) {
        selectedIndex = - 1;
        input.value = initialValue;
    }
}

const hideResults = () => {
    input.dataset.open = false;
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "none";
    selectedIndex = -1;
}

// prevent the input's blur event if clicking on a result
// needed because blur fires before click
// don't prevent default if clicking on the input,
// or else can't select text or move cursor
autocomplete.addEventListener('mousedown', (e) => {
    if (e.target !== input) {
        e.preventDefault();
    }
});

autocomplete.addEventListener("click", (e) => {
    if (e.currentTarget === e.target) {
        input.focus();
        input.placeholder = "City Name";
    }
});

input.addEventListener("blur", (e) => {
    if (input.value === "") {
        input.placeholder = " ";
    }
    hideResults();
});

// If the input still has text in it, get matches when re-focusing
input.addEventListener("focus", () => {
    getMatches(input.value);
})

const handleMouseEnter = (e) => {
    if (selectedIndex > -1) {
        resultsContainer.children[selectedIndex].style.backgroundColor = "initial";
    }
    selectedIndex = e.currentTarget.dataset.index;
    e.currentTarget.style.backgroundColor = selectedColor;
}
const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "initial";
}