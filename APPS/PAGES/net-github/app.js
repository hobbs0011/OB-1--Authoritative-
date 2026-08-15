// ═══════════════════════════════════════════════════════════════
// NET GitHub — App Router & Interactivity
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const views = {
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

  function showView(viewId) {
    document.querySelectorAll('.view').forEach(function(v) {
      v.classList.remove('active');
    });
    var target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    } else {
      var defaultView = document.getElementById('view-default');
      if (defaultView) defaultView.classList.add('active');
    }
    updateActiveNav(viewId);
  }

  function updateActiveNav(viewId) {
    document.querySelectorAll('.header-nav-link, .sidebar-item, .repo-tab').forEach(function(el) {
      el.classList.remove('active');
    });

    var mapping = {
      'view-home': ['header-nav-link[data-view="home"]', '.sidebar-item[data-view="home"]', '.repo-tab[data-view="home"]'],
      'view-issues': ['header-nav-link[data-view="issues"]', '.repo-tab[data-view="issues"]'],
      'view-marketplace': ['header-nav-link[data-view="marketplace"]', '.repo-tab[data-view="marketplace"]'],
      'view-explore': ['header-nav-link[data-view="explore"]', '.repo-tab[data-view="explore"]'],
      'view-profile': ['header-nav-link[data-view="profile"]', '.sidebar-item[data-view="profile"]'],
      'view-repositories': ['.sidebar-item[data-view="repositories"]', '.repo-tab[data-view="repositories"]'],
      'view-programs': ['.sidebar-item[data-view="programs"]'],
      'view-students': ['.sidebar-item[data-view="students"]'],
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
  }

  function buildContributionGraph() {
    var container = document.getElementById('contributionGraph');
    if (!container) return;

    var weeks = 26;
    var daysPerWeek = 7;
    var total = weeks * daysPerWeek;
    var html = '';

    for (var i = 0; i < total; i++) {
      var level = Math.floor(Math.random() * 5);
      var opacity = level === 0 ? '0.2' : '1';
      html += '<div class="contribution-day contribution-level-' + level + '" title="' + Math.floor(Math.random() * 8) + ' contributions" style="opacity:' + opacity + '"></div>';
    }

    container.innerHTML = html;
  }

  function buildActivityGraph() {
    var container = document.getElementById('activityGraph');
    if (!container) return;

    var days = 90;
    var html = '';

    for (var i = 0; i < days; i++) {
      var level = Math.floor(Math.random() * 5);
      var opacity = level === 0 ? '0.2' : '1';
      html += '<div class="contribution-day contribution-level-' + level + '" title="' + Math.floor(Math.random() * 5) + ' events" style="opacity:' + opacity + '"></div>';
    }

    container.innerHTML = html;
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    buildContributionGraph();
    buildActivityGraph();

    // Search focus shortcut
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        var searchInput = document.querySelector('.header-search .search-input');
        if (searchInput) searchInput.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
