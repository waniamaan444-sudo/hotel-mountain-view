const menuBtn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav-links');
menuBtn?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const lightbox=document.querySelector('.lightbox');
const lightboxImg=lightbox.querySelector('img');
document.querySelectorAll('.gallery-item').forEach(item=>{
  item.addEventListener('click',()=>{
    lightboxImg.src=item.dataset.full;
    lightboxImg.alt=item.querySelector('img').alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImg.src='';
}
document.querySelector('.close-lightbox').addEventListener('click',closeLightbox);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});


const bookingForm = document.getElementById('bookingForm');
const checkin = document.getElementById('checkin');
const checkout = document.getElementById('checkout');
const rooms = document.getElementById('rooms');
const totalEl = document.getElementById('bookingTotal');
const nightsEl = document.getElementById('bookingNights');
const RATE = 2000;

const today = new Date().toISOString().split('T')[0];
if (checkin) checkin.min = today;
if (checkout) checkout.min = today;

function calculateBooking() {
  const start = new Date(checkin.value);
  const end = new Date(checkout.value);
  let nights = 1;
  if (checkin.value && checkout.value && end > start) {
    nights = Math.ceil((end - start) / 86400000);
  }
  const roomCount = Math.max(1, Number(rooms.value || 1));
  const total = nights * roomCount * RATE;
  totalEl.textContent = `Estimated total: ₹${total.toLocaleString('en-IN')}`;
  nightsEl.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'} × ${roomCount} ${roomCount === 1 ? 'room' : 'rooms'}`;
  return {nights, roomCount, total};
}

[checkin, checkout, rooms].forEach(el => el?.addEventListener('input', calculateBooking));
calculateBooking();

bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(bookingForm);
  const calc = calculateBooking();

  if (checkin.value && checkout.value && new Date(checkout.value) <= new Date(checkin.value)) {
    alert('Please select a check-out date after the check-in date.');
    return;
  }

  const msg = [
    'Hello Hotel Mountain View, I would like to make a booking enquiry.',
    '',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Check-in: ${data.get('checkin')}`,
    `Check-out: ${data.get('checkout')}`,
    `Nights: ${calc.nights}`,
    `Rooms: ${calc.roomCount}`,
    `Guests: ${data.get('guests')}`,
    `Room preference: ${data.get('room')}`,
    `Estimated total: ₹${calc.total.toLocaleString('en-IN')}`,
    `Message: ${data.get('message') || 'No special request'}`
  ].join('\n');

  window.open('https://wa.me/917006847688?text=' + encodeURIComponent(msg), '_blank');
});
