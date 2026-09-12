document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const allLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  const backToTop = document.querySelector('.back-to-top');
  const stickyBookBar = document.querySelector('.sticky-book-bar');
  const roomPills = document.querySelectorAll('.room-pill');
  const roomSelect = document.getElementById('roomtype');
  const bookingForm = document.getElementById('bookingForm');
  const bookingToast = document.getElementById('bookingToast');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  roomPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const room = pill.getAttribute('data-room');
      if (roomSelect) roomSelect.value = room;
      roomPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      const roomtype = document.getElementById('roomtype').value;
      const guests = document.getElementById('guests').value;
      const msg = 'Hi Mailala! I want to book ' + roomtype + ' from ' + checkin + ' to ' + checkout + ' for ' + guests + ' guests.';
      window.open('https://wa.me/84768701106?text=' + encodeURIComponent(msg), '_blank');
      if (bookingToast) {
        bookingToast.style.display = 'flex';
        setTimeout(() => { bookingToast.style.display = 'none'; }, 4000);
      }
    });
  }

  const header = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 100) {
      header.style.boxShadow = '0 2px 0 rgba(45,43,40,.15)';
    } else {
      header.style.boxShadow = 'none';
    }
    if (backToTop) {
      if (current > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    if (stickyBookBar) {
      const bookSection = document.querySelector('#book');
      if (bookSection) {
        const bookBottom = bookSection.offsetTop + bookSection.offsetHeight;
        if (current > bookSection.offsetTop - 200 && current < bookBottom) {
          stickyBookBar.style.opacity = '0';
          stickyBookBar.style.pointerEvents = 'none';
        } else if (current > bookBottom) {
          stickyBookBar.style.opacity = '1';
          stickyBookBar.style.pointerEvents = 'auto';
        } else {
          stickyBookBar.style.opacity = '0';
          stickyBookBar.style.pointerEvents = 'none';
        }
      }
    }
  }, { passive: true });

  const observerOptions = { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.vibe-card, .room-card, .story-card, .amenity-card, .menu-category, .feature-card, .lesson-card, .proof-card, .method-steps li, .reveal, .faq-item').forEach(el => {
    observer.observe(el);
  });

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -80% 0px' });

  sections.forEach(section => navObserver.observe(section));
});
