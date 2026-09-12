document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const allLinks = document.querySelectorAll('.nav-links a');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('active');
    });

    allLinks.forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const header = document.querySelector('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 100) {
      header.style.boxShadow = '0 2px 0 rgba(45,43,40,.15)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastScroll = current;
  }, { passive: true });

  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });
  }

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) checkinInput.setAttribute('min', today);
    if (checkoutInput) checkoutInput.setAttribute('min', today);

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const room = document.getElementById('room').value;
      const guests = document.getElementById('guests').value;

      if (!checkin || !checkout || !room || !guests) {
        alert('Please fill in all fields.');
        return;
      }

      if (checkout <= checkin) {
        alert('Check-out must be after check-in.');
        return;
      }

      const message = `Hi Mailala! I want to book ${room} from ${checkin} to ${checkout} for ${guests} guests.`;
      const url = `https://wa.me/84768701106?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  }
});
