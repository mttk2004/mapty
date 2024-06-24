'use strict';

// Array of month names for use in description
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


// Elements
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


// Base class for all workouts
class Workout {
    // Private fields
    #date = new Date();
    #id = Date.now().toString().slice(-10);
    #type;
    #distance;
    #duration;
    #coords;
    #description;
    // clicks = 0;
    
    constructor(distance, duration, coords) {
        this.distance = distance; // in km
        this.duration = duration; // in min
        this.coords = coords; // [lat, lng]
    }
    
    // Getters and setters for private fields
    get distance() { return this.#distance }
    get duration() { return this.#duration }
    get coords() { return this.#coords }
    get date() { return this.#date }
    get id() { return this.#id }
    get type() { return this.#type }
    get description() { return this.#description }

    set distance(distance) { this.#distance = distance }
    set duration(duration) { this.#duration = duration }
    set coords(coords) { this.#coords = coords }
    set type(type) { this.#type = type }
    set description(description) { this.#description = description }
    
    // Method to set description of workout
    _setDescription() {
        // prettier-ignore
        this.#description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${new Date(this.date).getDate()} ${months[new Date(this.date).getMonth()]}`
    }
    
    // _click() {
    //     this.clicks++;
    //     console.log(this.clicks)
    // }
    
    // Method to convert object to JSON
    toJSON() {
        return {
            id: this.id,
            date: this.date,
            type: this.type,
            distance: this.distance,
            duration: this.duration,
            coords: this.coords,
            description: this.description,
        };
    }
}

// Class for running workouts
class Running extends Workout {
    // Private fields
    #cadence;
    #pace;
    
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence; // in steps/min
        this.calcPace(); // min/km
        this.type = 'running';
        this._setDescription();
    }
    
    // Getters and setters for private fields
    get cadence() { return this.#cadence }
    get pace() { return this.#pace }
    
    set cadence(cadence) { this.#cadence = cadence }
    set pace(pace) { this.#pace = pace }
    
    // Method to calculate pace
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
    
    // Method to convert object to JSON
    toJSON() {
        return {
            ...super.toJSON(),
            cadence: this.cadence,
            pace: this.pace,
        };
    }
}

// Class for cycling workouts
class Cycling extends Workout {
    // Private fields
    #elevationGain;
    #speed;
    
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain; // in meters
        this.calcSpeed(); // km/h
        this.type = 'cycling';
        this._setDescription();
    }
    
    // Getters and setters for private fields
    get elevationGain() { return this.#elevationGain }
    get speed() { return this.#speed }

    set elevationGain(elevationGain) { this.#elevationGain = elevationGain }
    set speed(speed) { this.#speed = speed }
    
    // Method to calculate speed
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
    
    // Method to convert object to JSON
    toJSON() {
        return {
            ...super.toJSON(),
            elevationGain: this.elevationGain,
            speed: this.speed,
        };
    }
}


// Main app class
class App {
    // Private fields
    #map;
    #mapEvent;
    #workouts = []; // Array of workouts
    
    constructor() {
        // Get user's position
        this._getPosition();
        
        // Get data from local storage
        this._getLocalStorage()
        
        // Submit form
        form.addEventListener('submit', this._newWorkout.bind(this))
        
        // Toggle elevation field
        inputType.addEventListener('change', this._toggleEleventField)

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
    }
    
    // Getters and setters for private fields
    get map() { return this.#map }
    get mapEvent() { return this.#mapEvent }
    get workouts() { return this.#workouts }
    
    set map(map) { this.#map = map }
    set mapEvent(mapEvent) { this.#mapEvent = mapEvent }
    set workouts(workouts) { this.#workouts = workouts }
    
    // Method to get user's position
    _getPosition() {
        navigator.geolocation?.getCurrentPosition(
            this._loadMap.bind(this), function () {
                alert('No position found!')
            }
        )
    }
    
    // Method to load map
    _loadMap(position) {
        const {latitude, longitude} = position.coords;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
        
        const coords = [latitude, longitude];
        this.map = L.map('map').setView(coords, 15);
        
        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        this.map.on('click', this._showForm.bind(this))
        
        this.workouts.forEach(work => {
            this._displayMarker(work)
        })
    }
    
    // Method to show form
    _showForm(mapEvt) {
        this.mapEvent = mapEvt
        form.classList.remove('hidden')
        inputDistance.focus()
    }
    
    // Method to hide form
    _hideForm() {
        inputCadence.value = inputDuration.value = inputDistance.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
    }
    
    // Method to toggle elevation field
    _toggleEleventField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    }
    
    // Method to display marker on map
    _displayMarker(workout) {
        L.marker(workout.coords).addTo(this.map)
         .bindPopup(L.popup({
                                maxWidth: 250,
                                minWidth: 100,
                                autoClose: false,
                                closeOnClick: false,
                                className: `${workout.type}-popup`,
                            }))
         .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`)
         .openPopup();
    }
    
    // Method to render workout on list
    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;
        
        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
              </div>
            </li>
            `;
        }
        
        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
                <span class="workout__icon">⛰ </span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            </li>
            `;
        }
        
        form.insertAdjacentHTML('afterend', html);
    }
    
    // Method to create new workout
    _newWorkout(e) {
        e.preventDefault()
        
        // Helper functions
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const allPositive = (...inputs) => inputs.every(inp => inp > 0)
        
        
        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.mapEvent.latlng;
        
        let workout;
        
        // If workout running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            
            // Check if data is valid
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert('Inputs have to be positive numbers!')
            }
            
            workout = new Running(distance, duration, [lat, lng], cadence);
        }
        
        // If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            
            // Check if data is valid
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
                return alert('Inputs have to be positive numbers!')
            }
            
            workout = new Cycling(distance, duration, [lat, lng], elevation);
        }
        
        
        // Add new object to workout array
        this.#workouts.push(workout);
        
        // Set local storage to all workouts
        this._setLocalStorage()
        
        // Render workout on map as marker
        this._displayMarker.call(this, workout)
        
        // Render workout on list
        this._renderWorkout(workout)
     
        // Hide form + clear input fields
        this._hideForm();
    }
    
    // Method to move to popup
    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        if (!workoutEl) return;
        
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        this.map.setView(workout.coords, 15, {
            animate: true,
            pan: {
                duration: 1
            }
        })
        
        // Using the public interface
        // workout._click()
    }
    
    // Method to set local storage
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts))
    }
    
    // Method to get local storage
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'))
        
        if (!data) return;
        
        this.#workouts = data;
        
        this.#workouts.forEach(work => {
            this._renderWorkout(work)
        })
    }
    
    // Method to reset local storage
    reset() {
        localStorage.removeItem('workouts')
        location.reload()
    }
}


////////////////////////////
const app = new App(); // Create new app instance

