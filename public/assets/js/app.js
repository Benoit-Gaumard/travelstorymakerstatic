/* TravelStoryMaker - progressive enhancement only. All content is in the HTML. */
(function () {
  'use strict';

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    /*
     * Below 900px the menu is a fixed panel that is only *visually* closed. Hiding it with
     * opacity and pointer-events left its seven links in the tab order and in the
     * accessibility tree, so a keyboard or screen-reader user traversed the entire closed
     * menu before reaching any content - invisible to mouse testing, which is why it survived
     * a Lighthouse accessibility score of 96. `inert` is what actually removes them.
     *
     * Above 900px the same element is an ordinary horizontal nav bar and must never be inert,
     * so the state is recomputed whenever the breakpoint is crossed, not just on click.
     */
    var mobile = window.matchMedia('(max-width: 900px)');

    var syncNav = function () {
      var open = nav.getAttribute('data-open') === 'true';
      if (mobile.matches && !open) nav.setAttribute('inert', '');
      else nav.removeAttribute('inert');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      nav.setAttribute('data-open', String(nav.getAttribute('data-open') !== 'true'));
      syncNav();
    });

    if (mobile.addEventListener) mobile.addEventListener('change', syncNav);
    else if (mobile.addListener) mobile.addListener(syncNav);
    syncNav();
  }

  /* ---- Story filtering (client-side, over already-rendered HTML) ---- */
  var list = document.getElementById('entry-list');
  if (list) {
    var entries = Array.prototype.slice.call(list.querySelectorAll('.entry'));
    var input = document.getElementById('entry-search');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
    var counter = document.getElementById('entry-count');
    var empty = document.getElementById('entry-empty');
    var activeType = 'all';
    var query = '';

    var haystacks = entries.map(function (el) {
      return (el.textContent || '').toLowerCase();
    });

    var COLLECTION = {
      story: { href: '/travelstories/stories/', label: 'travel stories' },
      quote: { href: '/travelstories/quotes/', label: 'travel quotes' },
      fact: { href: '/travelstories/fun-facts/', label: 'fun facts' }
    };

    function emptyMessage() {
      var target = COLLECTION[activeType];
      if (target && query === '') {
        return 'No ' + target.label + ' on this page. Read <a href="' + target.href + '">all ' + target.label + '</a> instead.';
      }
      if (target) {
        return 'No ' + target.label + ' matched that search here. Try <a href="' + target.href + '">all ' + target.label + '</a>, or a shorter word.';
      }
      return 'Nothing matched that search on this page. Try a shorter word, or browse <a href="/destinations/">by destination</a>.';
    }

    function apply() {
      var shown = 0;
      for (var i = 0; i < entries.length; i++) {
        var el = entries[i];
        var okType = activeType === 'all' || el.getAttribute('data-type') === activeType;
        var okText = query === '' || haystacks[i].indexOf(query) !== -1;
        var visible = okType && okText;
        if (visible) shown++;
        if (el.hidden !== !visible) el.hidden = !visible;
      }
      if (counter) counter.textContent = String(shown);
      if (empty) {
        empty.setAttribute('data-visible', shown === 0 ? 'true' : 'false');
        if (shown === 0) empty.innerHTML = emptyMessage();
      }
    }

    if (input) {
      var timer = null;
      input.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          query = input.value.trim().toLowerCase();
          apply();
        }, 120);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeType = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        apply();
      });
    });

    var shuffleBtn = document.getElementById('entry-shuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', function () {
        var visible = entries.filter(function (el) { return !el.hidden; });
        if (!visible.length) return;
        var pick = visible[Math.floor(Math.random() * visible.length)];
        pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pick.style.outline = '3px solid rgba(47,132,255,.55)';
        pick.style.outlineOffset = '3px';
        window.setTimeout(function () { pick.style.outline = ''; }, 1600);
      });
    }
  }

  /* ---- Back to top ---- */
  var toTop = document.querySelector('.back-to-top');
  if (toTop) {
    var shown = null;
    var sync = function () {
      var next = window.scrollY > 700;
      if (next === shown) return;
      shown = next;
      toTop.setAttribute('data-visible', next ? 'true' : 'false');
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();

    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var header = document.getElementById('top');
      if (header) {
        header.setAttribute('tabindex', '-1');
        header.focus({ preventScroll: true });
      }
    });
  }

  /* ---- Current year ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
