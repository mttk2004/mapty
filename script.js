'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {
    #date = Date.now();
    #id = Date.now().toString().slice(-10);
    #name;
    #distance;
    #duration;
    #coords;
    
    constructor(distance, duration, coords) {
        this.distance = distance; // in km
        this.duration = duration; // in min
        this.coords = coords; // [lat, lng]
    }
    
    get distance() { return this.#distance }
    get duration() { return this.#duration }
    get coords() { return this.#coords }

    set distance(distance) { this.#distance = distance }
    set duration(duration) { this.#duration = duration }
    set coords(coords) { this.#coords = coords }
}

class Running extends Workout {
    #cadence;
    #pace;
    #type = 'running';
    
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence; // in steps/min
        this.calcPace(); // min/km
    }
    
    get cadence() { return this.#cadence }
    get pace() { return this.#pace }
    get type() { return this.#type }
    
    set cadence(cadence) { this.#cadence = cadence }
    set pace(pace) { this.#pace = pace }
    
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}


class Cycling extends Workout {
    #elevationGain;
    #speed;
    #type = 'cycling';
    
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain; // in meters
        this.calcSpeed(); // km/h
    }
    
    get elevationGain() { return this.#elevationGain }
    get speed() { return this.#speed }
    get type() { return this.#type }

    set elevationGain(elevationGain) { this.#elevationGain = elevationGain }
    set speed(speed) { this.#speed = speed }
    
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


class App {
    #map;
    #mapEvent;
    #workouts = []; // Array of workouts
    
    constructor() {
        this._getPosition();
        
        // Submit form
        form.addEventListener('submit', this._newWorkout.bind(this))
        
        // Toggle elevation field
        inputType.addEventListener('change', this._toggleEleventField)
    }
    
    get map() { return this.#map }
    get mapEvent() { return this.#mapEvent }
    get workouts() { return this.#workouts }
    
    set map(map) { this.#map = map }
    set mapEvent(mapEvent) { this.#mapEvent = mapEvent }
    set workouts(workouts) { this.#workouts = workouts }
    
    _getPosition() {
        navigator.geolocation?.getCurrentPosition(
            this._loadMap.bind(this), function () {
                alert('No position found!')
            }
        )
    }
    
    _loadMap(position) {
        const {latitude, longitude} = position.coords;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
        
        const coords = [latitude, longitude];
        this.map = L.map('map').setView(coords, 13);
        
        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        this.map.on('click', this._showForm.bind(this))
    }
    
    _showForm(mapEvt) {
        this.mapEvent = mapEvt
        form.classList.remove('hidden')
        inputDistance.focus()
    }
    
    _toggleEleventField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    }
    
    _displayMarker(workout) {
        console.log(workout.type)
        L.marker(workout.coords).addTo(this.map)
         .bindPopup(L.popup({
                                maxWidth: 250,
                                minWidth: 100,
                                autoClose: false,
                                closeOnClick: false,
                                // className: `${workout.type}-popup`,
                                className: `${workout.type}-popup`,
                            }))
         .setPopupContent('Workout')
         .openPopup();
    }
    
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
        
        // Render workout on map as marker
        this._displayMarker.call(this, workout)
        
        // Render workout on list
        
        
        // Clear input fields
        inputCadence.value = inputDuration.value = inputDistance.value = inputElevation.value = '';
    }
    
}


////////////////////////////
const app = new App();

