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


// echo "# mapty" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin git@github.com:mttk2004/mapty.git
// git push -u origin main
navigator.geolocation?.getCurrentPosition(
    function (position) {
        // console.log(position);
        const {latitude, longitude} = position.coords;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
        
        const coords = [latitude, longitude];
        const map = L.map('map').setView(coords, 13);
        
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            L.marker([lat, lng]).addTo(map)
             .bindPopup(L.popup({
                 maxWidth: 250,
                 minWidth: 100,
                 autoClose: false,
                 closeOnClick: false,
                 className: 'running-popup'
                                }))
             .setPopupContent('Workout')
             .openPopup();
        })
    },
    function () {
        alert('No position found!')
    }
)
