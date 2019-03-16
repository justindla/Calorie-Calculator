'use strict'


let state = {
    manage: {
        pressed: false,
        date: "",
        exerciseText: "",
        foodText: ""
    }

};


let calculate = document.querySelector("#calculate");
let calcform = document.querySelector("#calcform");
let result = document.querySelector("#total");
let calcbutton = document.querySelector("#calcbutton");
let exercise = document.querySelector("#exercisetext");
let food = document.querySelector("#foodtext");

// date picker date goes into state.manage.date
let dateinput = document.querySelector("#dateInput");
dateinput.addEventListener("input", function (input) {
    // if user leaves datepicker, then that is the value of state.manage.date
    dateinput.addEventListener("blur", function () {
        state[input.target.value] = {};
        state.manage.date = input.target.value;
    })
})

// disables button until all inputs are filled
exercise.addEventListener("input", function (input) {
    state.manage.exerciseText = input.target.value;
    if (state.manage.exerciseText == "" || state.manage.foodText == "" || state.manage.date == "") {
        calcbutton.setAttribute("disabled", "true");
    } else {
        calcbutton.removeAttribute("disabled");
    }
})
food.addEventListener("input", function (input) {
    state.manage.foodText = input.target.value;
    if (state.manage.exerciseText == "" || state.manage.foodText == "" || state.manage.date == "") {
        calcbutton.setAttribute("disabled", "true");
    } else {
        calcbutton.removeAttribute("disabled");
    }
})
dateinput.addEventListener("input", function (input) {
    state.manage.date = input.target.value;
    if (state.manage.exerciseText == "" || state.manage.foodText == "" || state.manage.date == "") {
        calcbutton.setAttribute("disabled", "true");
    } else {
        calcbutton.removeAttribute("disabled");
    }
})
if (state.manage.exerciseText == "" || state.manage.foodText == "" || state.manage.date == "") {
    calcbutton.setAttribute("disabled", "true");
}

// when you press calculate
// loads page that shows result
let jumbo = document.querySelector("#jumbo");
calcbutton.addEventListener("click", function () {
    // remove a new way to track calories
    if (state.manage.pressed == false) {
        jumbo.classList.add("d-none");
        // remove what do you want to calculate?
        calculate.classList.add("d-none");
        calcform.classList.add("d-none");
        // show results
        result.classList.replace("d-none", "d-block");
    }
    // puts kcal into state and display on page
    getExercise(exercise.value);
    getFood(food.value);
    // resets textarea
    state.manage.exerciseText = "";
    state.manage.foodText = "";

})

// redirect to home
function backToHome() {
    calculate.classList.remove("d-none");
    calcform.classList.remove("d-none");
    jumbo.classList.remove("d-none");
    result.classList.replace("d-block", "d-none");
    cardList.classList.replace("d-block", "d-none");
    state.manage.pressed = false;
    exercise.value = "";
    food.value = "";
    dateinput.value = ""
    state.manage.exerciseText = "";
    state.manage.foodText = "";
    state.manage.date = "";
    if (state.manage.exerciseText == "" || state.manage.foodText == "" || state.manage.date == "") {
        calcbutton.setAttribute("disabled", "true");
    }
}

// when you press home icons
// icon goes back to main page
let apple = document.querySelector("#apple");
apple.addEventListener("click", backToHome);
let title = document.querySelector("#calorie");
title.addEventListener("click", backToHome);

// when you press add day to calendar
let addday = document.querySelector("#addday");
let cardList = document.querySelector("#cardList");
let cards = document.querySelector("#cards");
addday.addEventListener("click", function () {
    // show cards
    cardList.classList.replace("d-none", "d-block");
    // remove results
    result.classList.replace("d-block", "d-none");
    // render card
    while (cards.firstChild) {
        cards.removeChild(cards.firstChild);
    }
    renderCards();

})

let addMore = document.querySelector("#addMore");
addMore.addEventListener("click", backToHome);

function renderCards() {
    let stateLength = Object.keys(state).length;
    for (let i = 1; i <= stateLength - 1; i++) {
        if (state[Object.keys(state)[i]].consumed == null) {
            i++;
        }
        renderCard(i);
    }
}

function renderCard(card) {
    let container = document.createElement("div");
    container.setAttribute("class", "container");
    container.innerHTML =
        `<div class="container mt-4">
            <div class="card">
                <div class="card-header">
            <p id="cardDate" class="align">${Object.keys(state)[card]}</p>

        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">Burned: ${state[Object.keys(state)[card]].burned}</li>
            <li class="list-group-item">Consumed: ${state[Object.keys(state)[card]].consumed}</li>
            <li class="list-group-item">Net: ${state[Object.keys(state)[card]].net}</li>
        </ul>
        </div>
        </div>`;
    cards.appendChild(container);

}

function renderError(error) {
    let errorMsg = document.createElement("p");
    errorMsg.setAttribute("class", "alert alert-danger");
    errorMsg.textContent = error.message;
    calcform.appendChild(errorMsg);
}

function togglerSpinner() {
    let spinner = document.querySelector(".fa-cog");
    spinner.classList.toggle("d-none");
}

function getExercise(activity) {
    togglerSpinner();
    return (fetch("https://trackapi.nutritionix.com/v2/natural/exercise", {
        method: "POST",
        headers: {
            "x-app-id": "28eec23c",
            "x-app-key": "fe7d03b88cb2fc0375724fbeab5287f9",
            "x-remote-user-id": "0",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "query": activity
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;

        })
        .catch(function (error) {
            return renderError(error);
        })
    ).then(function (data) {
        togglerSpinner();
        let count = 0;
        if (data.exercises.length == 0) {
            let modalButton = document.querySelector("#modalButton");
            modalButton.addEventListener("click", backToHome());
            modalButton.click();
        } else {
            for (let i = 0; i < data.exercises.length; i++) {
                count += data.exercises[i].nf_calories;
            }
            count = Math.round(count);
            if (state[state.manage.date] == null) {
                state[state.manage.date] = { burned: count };
            } else {
                state[state.manage.date].burned = count;
            }
            if (state[state.manage.date].net == null) {
                state[state.manage.date].net = count * -1;
            } else {
                state[state.manage.date].net -= count;
            }
            let burned = document.querySelector("#burned");
            burned.textContent = state[state.manage.date].burned + " kcal";
        }
    })
}

function getFood(food) {
    return (fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
        method: "POST",
        headers: {
            "x-app-id": "28eec23c",
            "x-app-key": "fe7d03b88cb2fc0375724fbeab5287f9",
            "x-remote-user-id": "0",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "query": food
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;

        })
        .catch(function (error) {
            return renderError(error);
        })
    ).then(function (data) {
        let count = 0;
        if (data.foods.length == 0) {
            let modalButton = document.querySelector("#modalButton");
            modalButton.addEventListener("click", backToHome());
            modalButton.click();
        } else {
            for (let i = 0; i < data.foods.length; i++) {
                count += data.foods[i].nf_calories;
            }
            count = Math.round(count);
            if (state[state.manage.date] == null) {
                state[state.manage.date] = { consumed: count };
            } else {
                state[state.manage.date].consumed = count;
            }
            if (state[state.manage.date].net == null) {
                state[state.manage.date].net = count;
            } else {
                state[state.manage.date].net += count;
            }
            let consumed = document.querySelector("#consumed");
            consumed.textContent = state[state.manage.date].consumed + " kcal";
            let net = document.querySelector("#net");
            net.textContent = state[state.manage.date].net + " kcal";
        }
    })
}

