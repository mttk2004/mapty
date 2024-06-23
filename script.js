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
    
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence; // in steps/min
        this.calcPace(); // min/km
    }
    
    get cadence() { return this.#cadence }
    get pace() { return this.#pace }
    
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
    
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain; // in meters
        this.calcSpeed(); // km/h
    }
    
    get elevationGain() { return this.#elevationGain }
    get speed() { return this.#speed }

    set elevationGain(elevationGain) { this.#elevationGain = elevationGain }
    set speed(speed) { this.#speed = speed }
    
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

console.log(new Running(5.2, 24, [39, -12], 178))
console.log(new Cycling(27, 95, [39, -12], 523))


class App {
    #map;
    #mapEvent;
    
    constructor() {
        this._getPosition();
        
        // Submit form
        form.addEventListener('submit', this._newWorkout.bind(this))
        
        // Toggle elevation field
        inputType.addEventListener('change', this._toggleEleventField)
    }
    
    get map() { return this.#map }
    get mapEvent() { return this.#mapEvent }
    
    set map(map) { this.#map = map }
    set mapEvent(mapEvent) { this.#mapEvent = mapEvent }
    
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
        this.map = L.map('map').setView(coords, 15);
        
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
    
    _displayMarker() {
        const { lat, lng } = this.mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.map)
         .bindPopup(L.popup({
                                maxWidth: 250,
                                minWidth: 100,
                                autoClose: false,
                                closeOnClick: false,
                                className: 'running-popup'
                            }))
         .setPopupContent('Workout')
         .openPopup();
    }
    
    _newWorkout(e) {
        e.preventDefault()
        
        // Clear input fields
        inputCadence.value = inputDuration.value = inputDistance.value = inputElevation.value = '';
        
        // Display marker
        this._displayMarker.call(this)
    }
    
}


////////////////////////////
const app = new App();

