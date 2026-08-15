// ═══════════════════════════════════════════════════════════════
// NET GitHub — App Router & Interactivity
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  var views = {
    home: 'view-home',
    issues: 'view-issues',
    marketplace: 'view-marketplace',
    explore: 'view-explore',
    profile: 'view-profile',
    repositories: 'view-repositories',
    programs: 'view-programs',
    students: 'view-students',
    'program-tigers': 'view-program-tigers',
    'program-professionals': 'view-program-professionals',
    'program-cubs': 'view-program-cubs',
    'program-career': 'view-program-career',
    'program-university': 'view-program-university'
  };

  var viewTitles = {
    'view-home': 'Dashboard',
    'view-issues': 'Issues',
    'view-marketplace': 'Marketplace',
    'view-explore': 'Explore',
    'view-profile': 'Profile',
    'view-repositories': 'Repositories',
    'view-programs': 'Programs',
    'view-students': 'Students',
    'view-program-tigers': 'NET-Tigers',
    'view-program-professionals': 'NET-Professionals',
    'view-program-cubs': 'NET-Cubs',
    'view-program-career': 'NET-Career',
    'view-program-university': 'NET-University'
  };

  function showView(viewId) {
    var currentActive = document.querySelector('.view.active');
    if (currentActive && currentActive.id !== viewId) {
      currentActive.style.opacity = '0';
      currentActive.style.transform = 'translateY(6px)';
    }

    setTimeout(function() {
      document.querySelectorAll('.view').forEach(function(v) {
        v.classList.remove('active');
        v.style.opacity = '';
        v.style.transform = '';
      });

      var target = document.getElementById(viewId);
      if (target) {
        target.classList.add('active');
        target.style.opacity = '0';
        target.style.transform = 'translateY(6px)';
        requestAnimationFrame(function() {
          target.style.transition = 'opacity .2s ease, transform .2s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
          setTimeout(function() {
            target.style.transition = '';
          }, 200);
        });
      } else {
        var defaultView = document.getElementById('view-default');
        if (defaultView) defaultView.classList.add('active');
      }

      updateActiveNav(viewId);
      updateBreadcrumbs(viewId);
      updateJumpPills(viewId);
      generateTOC();
      animateStats();
    }, currentActive ? 100 : 0);
  }

  function updateActiveNav(viewId) {
    document.querySelectorAll('.header-nav-link, .sidebar-item, .repo-tab, .jump-pill').forEach(function(el) {
      el.classList.remove('active');
    });

    var mapping = {
      'view-home': ['header-nav-link[data-view="home"]', '.sidebar-item[data-view="home"]', '.repo-tab[data-view="home"]', '.jump-pill[href="#/"]'],
      'view-issues': ['header-nav-link[data-view="issues"]', '.repo-tab[data-view="issues"]', '.jump-pill[href="#/issues"]'],
      'view-marketplace': ['header-nav-link[data-view="marketplace"]', '.repo-tab[data-view="marketplace"]', '.jump-pill[href="#/marketplace"]'],
      'view-explore': ['header-nav-link[data-view="explore"]', '.repo-tab[data-view="explore"]', '.jump-pill[href="#/explore"]'],
      'view-profile': ['header-nav-link[data-view="profile"]', '.sidebar-item[data-view="profile"]'],
      'view-repositories': ['.sidebar-item[data-view="repositories"]', '.repo-tab[data-view="repositories"]', '.jump-pill[href="#/repositories"]'],
      'view-programs': ['.sidebar-item[data-view="programs"]', '.jump-pill[href="#/programs"]'],
      'view-students': ['.sidebar-item[data-view="students"]', '.jump-pill[href="#/students"]'],
      'view-program-tigers': ['.sidebar-item[data-view="program-tigers"]', '.repo-tab[data-view="program-tigers"]'],
      'view-program-professionals': ['.sidebar-item[data-view="program-professionals"]', '.repo-tab[data-view="program-professionals"]'],
      'view-program-cubs': ['.sidebar-item[data-view="program-cubs"]', '.repo-tab[data-view="program-cubs"]'],
      'view-program-career': ['.sidebar-item[data-view="program-career"]', '.repo-tab[data-view="program-career"]'],
      'view-program-university': ['.sidebar-item[data-view="program-university"]', '.repo-tab[data-view="program-university"]']
    };

    var selectors = mapping[viewId] || [];
    selectors.forEach(function(sel) {
      try {
        var el = document.querySelector(sel);
        if (el) el.classList.add('active');
      } catch(e) {}
    });
  }

  function updateBreadcrumbs(viewId) {
    var existing = document.querySelector('.breadcrumb');
    if (existing) existing.remove();

    var parts = [];
    if (viewId.indexOf('program-') === 0) {
      parts.push({ label: 'Home', href: '#/' });
      parts.push({ label: 'Programs', href: '#/programs' });
      var programName = viewId.replace('view-program-', '');
      parts.push({ label: programName.charAt(0).toUpperCase() + programName.slice(1), href: null });
    }

    if (parts.length === 0) return;

    var bc = document.createElement('nav');
    bc.className = 'breadcrumb';
    bc.setAttribute('aria-label', 'Breadcrumb');

    parts.forEach(function(part, i) {
      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = '/';
        bc.appendChild(sep);
      }
      if (part.href) {
        var a = document.createElement('a');
        a.href = part.href;
        a.textContent = part.label;
        bc.appendChild(a);
      } else {
        var span = document.createElement('span');
        span.textContent = part.label;
        span.style.color = 'var(--text-primary)';
        span.style.fontWeight = '500';
        bc.appendChild(span);
      }
    });

    var view = document.getElementById(viewId);
    if (view) {
      var firstChild = view.firstElementChild;
      if (firstChild) firstChild.insertBefore(bc, firstChild);
    }
  }

  function updateJumpPills(viewId) {
    document.querySelectorAll('.jump-pill').forEach(function(pill) {
      pill.classList.remove('active');
      if (pill.getAttribute('href') === '#' + window.location.hash.replace(/^#/, '').replace(/^\//, '/')) {
        pill.classList.add('active');
      }
    });
  }

  function getViewFromHash(hash) {
    if (!hash || hash === '#' || hash === '#/') return 'view-home';
    var clean = hash.replace(/^#\/?/, '').replace(/^#/, '');
    if (views[clean]) return views[clean];
    return 'view-default';
  }

  function handleRoute() {
    var hash = window.location.hash;
    var viewId = getViewFromHash(hash);
    showView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildContributionGraph() {
    var container = document.getElementById('contributionGraph');
    if (!container) return;

    var weeks = 26;
    var daysPerWeek = 7;
    var total = weeks * daysPerWeek;
    var html = '<div class="contribution-graph" role="img" aria-label="Contribution graph">';

    for (var i = 0; i < total; i++) {
      var level = Math.floor(Math.random() * 5);
      var count = level === 0 ? 0 : Math.floor(Math.random() * 8);
      var opacity = level === 0 ? '0.2' : '1';
      html += '<div class="contribution-day contribution-level-' + level + '" title="' + count + ' contributions" style="opacity:' + opacity + '"></div>';
    }

    html += '</div>';
    html += '<div class="contribution-graph-legend"><span>Less</span>';
    for (var l = 0; l < 4; l++) {
      html += '<div class="contribution-day contribution-level-' + (l + 1) + '" style="width:8px;height:8px;"></div>';
    }
    html += '<span>More</span></div>';

    container.innerHTML = html;
  }

  function buildActivityGraph() {
    var container = document.getElementById('activityGraph');
    if (!container) return;

    var days = 90;
    var html = '';

    for (var i = 0; i < days; i++) {
      var level = Math.floor(Math.random() * 5);
      var count = level === 0 ? 0 : Math.floor(Math.random() * 5);
      var opacity = level === 0 ? '0.2' : '1';
      html += '<div class="contribution-day contribution-level-' + level + '" title="' + count + ' events" style="opacity:' + opacity + '"></div>';
    }

    container.innerHTML = html;
  }

  function generateTOC() {
    var existing = document.querySelector('.toc');
    if (existing) existing.remove();

    var headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
    if (headings.length === 0) return;

    var toc = document.createElement('div');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'Table of contents');

    headings.forEach(function(h) {
      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.textContent = h.textContent;
      link.style.paddingLeft = h.tagName === 'H3' ? '16px' : '8px';
      link.style.fontSize = h.tagName === 'H3' ? '11px' : '12px';
      toc.appendChild(link);
    });

    var rightCard = document.querySelector('.right-card:last-child');
    if (rightCard) {
      rightCard.appendChild(toc);
    }
  }

  function animateStats() {
    document.querySelectorAll('.stat-number').forEach(function(el) {
      var text = el.textContent.trim();
      var match = text.match(/^(\d+)/);
      if (!match) return;

      var target = parseInt(match[1], 10);
      var suffix = text.replace(match[1], '');
      var current = 0;
      var step = Math.ceil(target / 30);
      var interval = setInterval(function() {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + suffix;
      }, 30);
    });
  }

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'opacity .3s ease, transform .3s ease';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  function openModal(title, bodyHtml, footerHtml) {
    var overlay = document.getElementById('modalOverlay');
    var titleEl = document.getElementById('modalTitle');
    var bodyEl = document.getElementById('modalBody');
    var footerEl = document.getElementById('modalFooter');

    if (!overlay || !titleEl || !bodyEl || !footerEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    footerEl.innerHTML = footerHtml || '';
    overlay.style.display = 'flex';

    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  function setupModals() {
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function setupSearchFilters() {
    var searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(function(input) {
      input.addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase().trim();
        var parent = e.target.closest('.page-header') || e.target.closest('.main-content');
        if (!parent) return;

        var cards = parent.querySelectorAll('.repo-card, .issue-item, .students-table-row');
        cards.forEach(function(card) {
          var text = card.textContent.toLowerCase();
          card.style.display = text.indexOf(query) === -1 ? 'none' : '';
        });
      });
    });
  }

  function setupQuickActions() {
    var buttons = document.querySelectorAll('.quick-actions');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var dropdown = btn.querySelector('.quick-actions-dropdown');
        if (dropdown) {
          var isOpen = dropdown.classList.contains('open');
          document.querySelectorAll('.quick-actions-dropdown.open').forEach(function(d) {
            d.classList.remove('open');
          });
          if (!isOpen) dropdown.classList.add('open');
        }
      });
    });

    document.addEventListener('click', function() {
      document.querySelectorAll('.quick-actions-dropdown.open').forEach(function(d) {
        d.classList.remove('open');
      });
    });
  }

  function setupSidebarToggle() {
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.querySelector('.sidebar-left');
    var rightSidebar = document.querySelector('.sidebar-right');

    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function() {
      sidebar.style.display = sidebar.style.display === 'none' ? '' : 'none';
      if (rightSidebar) {
        rightSidebar.style.display = rightSidebar.style.display === 'none' ? '' : 'none';
      }
      localStorage.setItem('sidebar-collapsed', sidebar.style.display === 'none' ? '1' : '0');
    });

    if (localStorage.getItem('sidebar-collapsed') === '1') {
      sidebar.style.display = 'none';
      if (rightSidebar) rightSidebar.style.display = 'none';
    }
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.querySelector('.header-search .search-input');
        if (searchInput) searchInput.focus();
      }

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        var slashActiveEl = document.activeElement;
        if (!slashActiveEl || (slashActiveEl.tagName !== 'INPUT' && slashActiveEl.tagName !== 'TEXTAREA')) {
          e.preventDefault();
          var searchInput = document.querySelector('.header-search .search-input');
          if (searchInput) searchInput.focus();
        }
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        var activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
        openModal('Keyboard Shortcuts',
          '<div style="display:grid;gap:8px;font-size:14px;">' +
          '<div><kbd>/</kbd> — Focus search</div>' +
          '<div><kbd>Ctrl+K</kbd> — Focus search</div>' +
          '<div><kbd>G</kbd> then <kbd>H</kbd> — Go home</div>' +
          '<div><kbd>G</kbd> then <kbd>I</kbd> — Go to issues</div>' +
          '<div><kbd>G</kbd> then <kbd>P</kbd> — Go to profile</div>' +
          '<div><kbd>G</kbd> then <kbd>R</kbd> — Go to repositories</div>' +
          '<div><kbd>?</kbd> — Show shortcuts</div>' +
          '<div><kbd>Esc</kbd> — Close modal</div>' +
          '</div>',
          '<button class="btn btn-secondary" onclick="document.getElementById(\'modalClose\').click()">Close</button>'
        );
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        var activeEl2 = document.activeElement;
        if (activeEl2 && (activeEl2.tagName === 'INPUT' || activeEl2.tagName === 'TEXTAREA')) return;
        window._gKeyPressed = true;
        setTimeout(function() { window._gKeyPressed = false; }, 1000);
      }

      if (window._gKeyPressed) {
        if (e.key === 'h' || e.key === 'H') { window.location.hash = '#/'; window._gKeyPressed = false; }
        if (e.key === 'i' || e.key === 'I') { window.location.hash = '#/issues'; window._gKeyPressed = false; }
        if (e.key === 'p' || e.key === 'P') { window.location.hash = '#/profile'; window._gKeyPressed = false; }
        if (e.key === 'r' || e.key === 'R') { window.location.hash = '#/repositories'; window._gKeyPressed = false; }
      }
    });
  }

  function setupFilterChips() {
    document.querySelectorAll('.filter-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var parent = chip.closest('.filter-chips');
        if (!parent) return;
        parent.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
      });
    });
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    buildContributionGraph();
    buildActivityGraph();
    setupModals();
    setupSearchFilters();
    setupQuickActions();
    setupSidebarToggle();
    setupKeyboardShortcuts();
    setupFilterChips();
    setupBackToTop();
    setupStarForkButtons();
    setupThemeToggle();
    setupEmptyStates();
    setupErrorHandling();
    setupPrefetch();
    setupNotificationButton();
    setupRepoTabs();
    setupCopyButtons();
    setupIssueFilters();
    setupHovercards();
    setupSearchModal();
  }

  function setupBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 600) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupStarForkButtons() {
    document.querySelectorAll('.repo-header-actions .btn').forEach(function(btn) {
      if (btn.dataset.starForkInitialized) return;
      btn.dataset.starForkInitialized = 'true';

      var key = btn.textContent.trim().toLowerCase().split(' ')[0];
      var storageKey = 'net-' + key + '-count';
      var count = parseInt(localStorage.getItem(storageKey) || '0', 10);

      var countSpan = btn.querySelector('.btn-count');
      var displayCount = count > 0 ? count : (key === 'star' ? 42 : 12);
      if (countSpan) countSpan.textContent = displayCount;

      btn.addEventListener('click', function() {
        count++;
        localStorage.setItem(storageKey, count);
        if (countSpan) countSpan.textContent = count;
        btn.style.transform = 'scale(1.1)';
        setTimeout(function() { btn.style.transform = ''; }, 150);
        showToast(key.charAt(0).toUpperCase() + key.slice(1) + 'd!', 'success');
      });
    });
  }

  function setupNotificationButton() {
    var btn = document.querySelector('.notification-btn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      showToast('Notification settings — coming soon', 'info');
    });
  }

  function setupRepoTabs() {
    document.querySelectorAll('.repo-tab').forEach(function(tab) {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        var view = tab.getAttribute('data-view');
        if (!view) return;
        document.querySelectorAll('.repo-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        if (view === 'home') {
          window.location.hash = '#/';
        } else if (views[view]) {
          window.location.hash = '#' + view;
        } else {
          window.location.hash = '#' + view;
        }
      });
    });
  }

  function setupThemeToggle() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    var current = localStorage.getItem('net-theme') || 'dark';
    if (current === 'light') document.documentElement.setAttribute('data-theme', 'light');

    toggle.addEventListener('click', function() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('net-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('net-theme', 'light');
      }
    });
  }

  function setupEmptyStates() {
    document.querySelectorAll('.repo-card, .issue-item, .students-table-row').forEach(function(el) {
      el.setAttribute('role', 'listitem');
    });
  }

  function setupErrorHandling() {
    window.addEventListener('error', function(e) {
      if (e.target && e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
      }
    }, true);

    try {
      var testView = getViewFromHash('#/nonexistent-route');
      if (testView === 'view-default') {
        var defaultView = document.getElementById('view-default');
        if (defaultView) {
          defaultView.innerHTML =
            '<div class="empty-state">' +
            '<div class="empty-state-icon">🔍</div>' +
            '<div class="empty-state-title">Page not found</div>' +
            '<div class="empty-state-desc">This view does not exist yet. Try Home, Programs, or Issues.</div>' +
            '<a href="#/" class="btn btn-primary" style="margin-top:12px;">Go home</a>' +
            '</div>';
        }
      }
    } catch(e) {}
  }

  function setupPrefetch() {
    document.querySelectorAll('.sidebar-item[data-view]').forEach(function(link) {
      link.addEventListener('mouseenter', function() {
        var view = link.getAttribute('data-view');
        if (view && views[view]) {
          var prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = '#' + view;
          document.head.appendChild(prefetch);
        }
      });
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll('.copy-code-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var pre = btn.closest('pre');
        var code = pre ? pre.querySelector('code') : null;
        var text = code ? code.textContent.replace('Copy', '').trim() : btn.textContent;
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(function() {
            btn.textContent = 'Copied!';
            setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
          });
        }
      });
    });
  }

  function setupIssueFilters() {
    var chips = document.querySelectorAll('.issue-filters .filter-chip');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        chips.forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var filter = chip.textContent.trim().toLowerCase();
        var issues = document.querySelectorAll('.issue-item');
        issues.forEach(function(issue) {
          var badge = issue.querySelector('.issue-status-badge');
          if (!badge) return;
          var status = badge.textContent.trim().toLowerCase();
          if (filter === 'all') {
            issue.style.display = '';
          } else if (filter === 'open' && status === 'open') {
            issue.style.display = '';
          } else if (filter === 'closed' && status === 'closed') {
            issue.style.display = '';
          } else if (filter !== 'all') {
            issue.style.display = 'none';
          }
        });
      });
    });
  }

  function setupHovercards() {
    var cards = document.querySelectorAll('.sidebar-item, .repo-card-title a, .issue-title');
    cards.forEach(function(el) {
      el.addEventListener('mouseenter', function(e) {
        var title = el.textContent.trim();
        if (!title || title.length < 2) return;
        var existing = document.querySelector('.hovercard');
        if (existing) existing.remove();
        var card = document.createElement('div');
        card.className = 'hovercard visible';
        card.textContent = title;
        card.style.left = e.pageX + 'px';
        card.style.top = (e.pageY + 20) + 'px';
        document.body.appendChild(card);
      });
      el.addEventListener('mouseleave', function() {
        var existing = document.querySelector('.hovercard');
        if (existing) existing.remove();
      });
    });
  }

  function setupSearchModal() {
    var overlay = document.getElementById('searchModalOverlay');
    var input = document.getElementById('searchModalInput');
    var closeBtn = document.getElementById('searchModalClose');
    if (!overlay || !input) return;

    function openSearch() {
      overlay.style.display = 'flex';
      input.value = '';
      input.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeSearch();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        closeSearch();
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        var activeEl = document.activeElement;
        if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
          e.preventDefault();
          openSearch();
        }
      }
    });

    document.querySelectorAll('.search-modal-item').forEach(function(item) {
      item.addEventListener('click', function() {
        closeSearch();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
