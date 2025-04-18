// Simulated Backend API
const api = {
    async fetchData() {
        return {
            destinations: [
                { name: 'Sao Beach', tags: ['beach'], img: 'https://via.placeholder.com/400x300?text=Sao+Beach', desc: { en: 'A serene escape with white sands.', vi: 'Nơi thư giãn yên bình với cát trắng.' }, lat: 10.1055, lng: 103.9666 },
                { name: 'An Thoi Islands', tags: ['tour'], img: 'https://via.placeholder.com/400x300?text=An+Thoi', desc: { en: 'Perfect for snorkeling and diving.', vi: 'Hoàn hảo để lặn ngắm san hô.' }, lat: 9.9481, lng: 104.0086 }
            ],
            cuisine: [
                { name: 'Gỏi Cá Trích', tags: ['food'], img: 'https://via.placeholder.com/300x200?text=Herring+Salad', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ', desc: { en: 'Fresh herring with coconut.', vi: 'Cá trích tươi với dừa.' } },
                { name: 'Phú Quốc Fish Sauce', tags: ['food'], img: 'https://via.placeholder.com/300x200?text=Fish+Sauce', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ', desc: { en: 'Island’s signature condiment.', vi: 'Nước mắm đặc trưng của đảo.' } }
            ],
            tours: [
                { name: 'Snorkeling Tour', price: 50, availableDates: ['2025-03-10', '2025-03-12'] },
                { name: 'Sunset Boat Tour', price: 30, availableDates: ['2025-03-11', '2025-03-13'] },
                { name: 'Pepper Farm Visit', price: 20, availableDates: ['2025-03-10', '2025-03-14'] }
            ]
        };
    },
    async fetchWeather() {
        return { temp: 28, condition: 'Sunny', humidity: 75 };
    }
};

// Request notification permission on page load
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});

// Send notification function
function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'https://via.placeholder.com/32?text=PQ' // Biểu tượng thông báo (thay bằng logo thực tế nếu có)
        });
    }
}

// Load dynamic content
async function loadContent() {
    try {
        const data = await api.fetchData();
        const lang = document.getElementById('language').value;

        const gallery = document.getElementById('destination-gallery');
        gallery.innerHTML = data.destinations.map(dest => `
            <div class="destination" data-tags="${dest.tags.join(' ')}">
                <img src="${dest.img}" alt="${dest.name}" onclick="openLightbox('${dest.img}')">
                <h3>${dest.name}</h3>
                <p>${dest.desc[lang]}</p>
            </div>`).join('');

        const cuisineList = document.getElementById('cuisine-list');
        cuisineList.innerHTML = data.cuisine.map(dish => `
            <div class="dish" data-tags="${dish.tags.join(' ')}">
                <h3>${dish.name}</h3>
                <div class="media">
                    <img src="${dish.img}" alt="${dish.name}" onclick="openLightbox('${dish.img}')">
                    <iframe width="300" height="200" src="${dish.video}" title="Video about ${dish.name}" frameborder="0" allowfullscreen></iframe>
                </div>
                <p>${dish.desc[lang]}</p>
            </div>`).join('');

        const tourSelect = document.getElementById('tour');
        tourSelect.innerHTML = data.tours.map(tour => `
            <option value="${tour.name}|${tour.price}|${tour.availableDates.join(',')}">${tour.name} - $${tour.price}</option>
        `).join('');
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

loadContent();

// Load weather
async function loadWeather() {
    const weather = await api.fetchWeather();
    const lang = document.getElementById('language').value;
    document.getElementById('weather').innerHTML = `
        <p>${lang === 'en' ? 'Phú Quốc Weather' : 'Thời tiết Phú Quốc'}: ${weather.temp}°C, ${weather.condition}</p>
        <p>${lang === 'en' ? 'Humidity' : 'Độ ẩm'}: ${weather.humidity}%</p>`;
}

loadWeather();

// Multilingual support
document.getElementById('language').addEventListener('change', () => {
    const lang = document.getElementById('language').value;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.dataset[lang];
    });
    document.querySelectorAll('.link-item').forEach(el => {
        el.dataset.tooltip = el.dataset[`tooltip-${lang}`];
    });
    loadContent();
    loadWeather();
    loadExperiences();
});

// Banner slideshow
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    const caption = slides[currentSlide].querySelector('.caption');
    caption.textContent = caption.dataset[document.getElementById('language').value];
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(showNextSlide, 6000);

// Search functionality
function search() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filters = Array.from(document.querySelectorAll('.filters input:checked')).map(input => input.value);

    const items = document.querySelectorAll('.destination, .dish');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const tags = item.dataset.tags.split(' ');
        const matchesQuery = query === '' || text.includes(query);
        const matchesFilter = filters.length === 0 || filters.some(filter => tags.includes(filter));

        item.style.display = matchesQuery && matchesFilter ? 'block' : 'none';
    });
}

// Booking form with notification
document.getElementById('booking-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const [tour, price, dates] = document.getElementById('tour').value.split('|');
    const availableDates = dates.split(',');
    const date = document.getElementById('date').value;
    const guests = document.getElementById('guests').value;
    const total = price * guests;
    const lang = document.getElementById('language').value;

    if (!availableDates.includes(date)) {
        alert(lang === 'en' ? 
            `Sorry, ${tour} is not available on ${date}.` : 
            `Xin lỗi, ${tour} không có sẵn vào ngày ${date}.`);
        return;
    }

    const booking = { tour, date, guests, total, timestamp: new Date().toISOString() };
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    const summary = document.getElementById('booking-summary');
    summary.innerHTML = `
        <p>${lang === 'en' ? 'Booked' : 'Đã đặt'}: ${tour} ${lang === 'en' ? 'on' : 'vào'} ${date} ${lang === 'en' ? 'for' : 'cho'} ${guests} ${lang === 'en' ? 'guest(s)' : 'khách'}. ${lang === 'en' ? 'Total' : 'Tổng'}: $${total}</p>`;
    summary.classList.add('notification');

    // Gửi thông báo
    sendNotification(
        lang === 'en' ? 'Booking Confirmed!' : 'Đặt chỗ thành công!',
        lang === 'en' ? `Your ${tour} for ${guests} guest(s) on ${date} is confirmed. Total: $${total}` : 
                        `Tour ${tour} cho ${guests} khách vào ngày ${date} đã được xác nhận. Tổng: $${total}`
    );

    setTimeout(() => summary.classList.remove('notification'), 3000); // Xóa hiệu ứng sau 3 giây
    this.reset();
});

// Itinerary planner
let itinerary = [];
function addToItinerary() {
    const lang = document.getElementById('language').value;
    const tourSelect = document.getElementById('tour');
    const selectedTour = tourSelect.options[tourSelect.selectedIndex].text;
    const date = document.getElementById('date').value;
    if (!date) {
        alert(lang === 'en' ? 'Please select a date!' : 'Vui lòng chọn ngày!');
        return;
    }
    itinerary.push({ activity: selectedTour, date });
    updateItinerary();
}

function updateItinerary() {
    const lang = document.getElementById('language').value;
    document.getElementById('itinerary-items').innerHTML = itinerary.map((item, index) => `
        <div class="itinerary-item">
            <span>${item.activity} - ${item.date}</span>
            <button onclick="removeFromItinerary(${index})" aria-label="${lang === 'en' ? 'Remove' : 'Xóa'}">${lang === 'en' ? 'Remove' : 'Xóa'}</button>
        </div>`).join('');
}

function removeFromItinerary(index) {
    itinerary.splice(index, 1);
    updateItinerary();
}

function shareItinerary() {
    const lang = document.getElementById('language').value;
    const text = itinerary.map(item => `${item.activity} on ${item.date}`).join('\n');
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${lang === 'en' ? 'My Phú Quốc Itinerary:\n' : 'Hành trình Phú Quốc của tôi:\n'}${text}`)}`;
    window.open(shareUrl, '_blank');
}

// Experience form with photo upload
document.getElementById('experience-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const lang = document.getElementById('language').value;
    const text = this.querySelector('textarea').value;
    const photo = this.querySelector('#photo-upload').files[0];
    const experience = { text, date: new Date().toISOString(), photo: photo ? URL.createObjectURL(photo) : null };
    let experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    experiences.push(experience);
    localStorage.setItem('experiences', JSON.stringify(experiences));

    const list = document.getElementById('experience-list');
    list.innerHTML = `<div class="experience"><p>"${text}" - User, ${new Date().getFullYear()}</p>${experience.photo ? `<img src="${experience.photo}" alt="User Photo">` : ''}</div>` + list.innerHTML;
    this.reset();
});

function loadExperiences() {
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const list = document.getElementById('experience-list');
    list.innerHTML = experiences.map(exp => `
        <div class="experience"><p>"${exp.text}" - User, ${new Date(exp.date).getFullYear()}</p>${exp.photo ? `<img src="${exp.photo}" alt="User Photo">` : ''}</div>
    `).join('');
}

loadExperiences();

// Google Maps
function initMap() {
    const phuQuoc = { lat: 10.224, lng: 103.965 };
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: phuQuoc,
        styles: [
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#20b2aa' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#e0ffff' }] }
        ]
    });

    api.fetchData().then(data => {
        data.destinations.forEach(dest => {
            new google.maps.Marker({
                position: { lat: dest.lat, lng: dest.lng },
                map: map,
                title: dest.name,
                icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
            });
        });
    });
}

// Lightbox
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = src;
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

window.onclick = function(event) {
    const lightbox = document.getElementById('lightbox');
    if (event.target === lightbox) {
        lightbox.style.display = 'none';
    }
};

// Chat simulation with notification
document.getElementById('chat-toggle').addEventListener('click', () => {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = chatBox.style.display === 'block' ? 'none' : 'block';
});

function sendChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const lang = document.getElementById('language').value;
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `<div class="chat-message">${lang === 'en' ? 'You' : 'Bạn'}: ${message}</div>`;
    input.value = '';

    // Simulated response with notification
    setTimeout(() => {
        const response = lang === 'en' ? 'How can I assist you today?' : 'Tôi có thể giúp gì cho bạn hôm nay?';
        messages.innerHTML += `<div class="chat-message notification">${lang === 'en' ? 'Support' : 'Hỗ trợ'}: ${response}</div>`;
        messages.scrollTop = messages.scrollHeight;

        sendNotification(
            lang === 'en' ? 'New Chat Response' : 'Phản hồi chat mới',
            response
        );
    }, 1000);
}

// Scroll to top
const scrollTopBtn = document.getElementById('scroll-top');
window.onscroll = () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
};

scrollTopBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});