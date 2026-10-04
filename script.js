const SUPABASE_URL = "https://dbtbedwlzvxpgerdvuko.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ieBCUpH-QXINaYWDJfQJEg_tGiA6JNA";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
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

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(bookingForm);
  const calc = calculateBooking();

  if (checkin.value && checkout.value && new Date(checkout.value) <= new Date(checkin.value)) {
    alert('Please select a check-out date after the check-in date.');
    return;
  }

  const guestName = data.get('name');
  const phone = data.get('phone');
  const checkIn = data.get('checkin');
  const checkOut = data.get('checkout');
  const roomCount = calc.roomCount;
  const guests = parseInt(data.get('guests')) || 1;
  const roomPreference = data.get('room');
  const message = data.get('message') || 'No special request';

 // Save booking enquiry to Supabase
const { data: bookingId, error: bookingError } = await supabaseClient
  .rpc('create_public_booking', {
    p_full_name: guestName,
    p_phone: phone,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_rooms_requested: roomCount,
    p_guests_count: guests,
    p_message: `${message} | Room preference: ${roomPreference}`
  });

if (bookingError) {
  console.error('Booking save error:', bookingError);
  alert('Could not save your booking enquiry. Please try again.');
  return;
}

  // Prepare WhatsApp message
  const msg = [
    'Hello Hotel Mountain View, I would like to make a booking enquiry.',
    '',
    `Name: ${guestName}`,
    `Phone: ${phone}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Nights: ${calc.nights}`,
    `Rooms: ${roomCount}`,
    `Guests: ${data.get('guests')}`,
    `Room preference: ${roomPreference}`,
    `Estimated total: ₹${calc.total.toLocaleString('en-IN')}`,
    `Message: ${message}`
  ].join('\n');

  // Open WhatsApp after successfully saving the booking
  window.open(
    'https://wa.me/917006847688?text=' + encodeURIComponent(msg),
    '_blank'
  );
});
