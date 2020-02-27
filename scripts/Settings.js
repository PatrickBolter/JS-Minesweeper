/*
 *  Settings.js 
 *  
 *  Manages the settings elements to allow the user to change the game settings.
 * 
 */

var fade = 0;
var timer = null;
var maxMines = 0;

// Sets up the event listeners and input events for settings
function bindSettingButton() {

    // Makes the settings frame open when the settings button is clicked
    let element = document.getElementById("settings-button");
    element.addEventListener('click', (e) => {openSettings()})

    // Closes the settings frame when the user clicks outside of the settings frame
    element = document.getElementById("settings");
    element.addEventListener('click', (e) => {closeSettings()});

    // Prevents the event listener for settings closing the window when we click in the settings frame
    element = document.getElementById("settings-inner");
    element.addEventListener('click', (e) => {e.stopPropagation()});

    // Set up the size slider to update on input change
    element = document.getElementById("size-slider");
    element.oninput = function() {
        // Max mines is the size of the board
        maxMines = this.value * this.value;

        // Set the max of the mine slider so it doesn't go over the max mines
        element = document.getElementById("mine-slider");
        element.max = maxMines;
        if (element.value > maxMines)
            element.value = maxMines;
        let mines = element.value;
        
        // Update the number input for mine count to show the actual value
        element = document.getElementById("mine-count");
        element.value = mines;

        // Update the number input for size count to show the actual value
        element = document.getElementById("size-count");
        element.value = this.value;
    }

    // Set up the mine slider to update on input change
    element = document.getElementById("mine-slider");
    element.oninput = function() {
        // Update hte number input for mine count to show the actual value
        element = document.getElementById("mine-count");
        element.value = this.value;
    }

}

// Fade in. Blurs the rest of the screen
function openSettings() {
    if (fade == 0)
        timer = setInterval(fadeIn, 10);
}

// Fade out. Unblurs the rest of the screen
function closeSettings() {
    if (fade > 0)
        timer = setInterval(fadeOut, 10);
}

function fadeIn() {

    let settings = document.getElementById("settings");
    let game = document.getElementById("game-container");

    fade += 1;
    settings.style.display = 'block';
    game.style.webkitFilter = 'blur('+fade/2+'px)';
    if (fade >= 10) {
        clearInterval(timer);
    }
        
}

function fadeOut() {
    let settings = document.getElementById("settings");
    let game = document.getElementById("game-container");
    
    fade -= 1;
    game.style.webkitFilter = 'blur('+fade/2+'px)';

    if (fade <= 0) {
        clearInterval(timer);
        game.style.webkitFilter = 'blur(0px)';
        settings.style.display = 'none';
    }
}