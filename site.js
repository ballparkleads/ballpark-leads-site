// Ballpark Leads — site scripts: menu, demo Install calculator, demo Maintenance widget, sign-up form
(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function r50(n) { return Math.round(n / 50) * 50; }

  // ---------- Install calculator (demo prices) ----------
  // Good-tier prices for a 3-ton system. Every real calculator uses the contractor's own price book.
  var BASE = {
    ac_handler: { whole: 8500, outdoor: 7000 },
    ac_furnace: { whole: 10750, outdoor: 7000 },
    heatpump:   { whole: 9000, outdoor: 7500 }
  };
  var SIZE_STEP = { '2': -850, '2.5': -450, '3': 0, '3.5': 450, '4': 950, '5': 2150 };
  var OPTION_MULT = { good: 1, better: 1.126, best: 1.3 };
  var FURNACE = { good: 3750, better: 6100, best: 6800 };
  var ADDONS = { lineset: 650, thermostat: 350, condpump: 300 };
  var SYS_LABEL = { ac_furnace: 'AC with a gas furnace', ac_handler: 'AC with an air handler', heatpump: 'Heat pump', furnace: 'Gas furnace only' };
  var ADD_LABEL = { lineset: 'new line set', thermostat: 'smart thermostat', condpump: 'condensate pump' };
  var OPT_LINE = {
    good: 'Good: single-stage',
    better: 'Better: two-stage, about 16–17 SEER2',
    best: 'Best: variable speed, highest efficiency'
  };
  var FURN_LINE = { good: 'Good: 80% efficiency', better: 'Better: 96% efficiency, new venting included', best: 'Best: 96%+ efficiency, variable speed' };

  function val(root, name, fallback) {
    var el = root.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : fallback;
  }
  function zipOf(root) {
    var a = root.querySelector('[name="addr"]');
    var m = a && a.value.match(/\b(\d{5})\b/);
    return m ? m[1] : null;
  }

  function estimate(root) {
    var zip = zipOf(root);
    var sys = val(root, 'sys', 'ac_handler');
    var size = val(root, 'size', '3');
    var rep = val(root, 'rep', 'whole');
    var opt = val(root, 'opt', 'better');
    var loc = val(root, 'loc', 'closet');
    var notes = [], maybe = [], lines = [];

    if (sys === 'notsure') {
      var fl = zip && /^3[234]/.test(zip);
      sys = fl || !zip ? 'ac_handler' : 'ac_furnace';
      notes.push('System not sure: priced as the most common setup' + (zip ? ' for ZIP ' + zip : '') + '.');
    }
    if (size === 'notsure') { size = '3'; notes.push('Size not sure: priced as 3 ton, the most common size.'); }
    if (rep === 'notsure') { rep = 'whole'; notes.push('Not sure what to replace: priced as a whole system.'); }

    var point;
    if (sys === 'furnace') {
      point = FURNACE[opt];
      lines.push('Gas furnace only, sized by BTU at the visit');
      lines.push(FURN_LINE[opt]);
      maybe.push('chimney liner');
    } else {
      point = (BASE[sys][rep] + (SIZE_STEP[size] || 0)) * OPTION_MULT[opt];
      lines.push(SYS_LABEL[sys] + ', ' + size + ' ton, ' + (rep === 'whole' ? 'whole system' : 'outdoor unit + coil'));
      lines.push(OPT_LINE[opt]);
    }
    lines.push('Permit and old unit removal included');

    var adds = [];
    root.querySelectorAll('input[name="add"]:checked').forEach(function (c) {
      if (sys === 'furnace' && c.value === 'lineset') return; // a line set never applies to a furnace-only job
      point += ADDONS[c.value]; adds.push(ADD_LABEL[c.value]);
    });
    if (adds.length) lines.push('Includes ' + adds.join(', '));
    if (sys !== 'furnace' && opt !== 'good') lines.push('May qualify for a local utility rebate (15.2+ SEER2)');
    if (loc === 'attic' || loc === 'notsure') maybe.push('attic or crawlspace access work');

    return { low: r50(point * 0.955), high: r50(point * 1.045), lines: lines, notes: notes, maybe: maybe };
  }

  document.querySelectorAll('[data-install]').forEach(function (calc) {
    var amt = calc.querySelector('[data-amt]');
    var list = calc.querySelector('[data-lines]');
    var maybeEl = calc.querySelector('[data-maybe]');
    var zipMsg = calc.querySelector('[data-zip-msg]');
    var modelMsg = calc.querySelector('[data-model-msg]');
    var model = calc.querySelector('[name="model"]');
    var photo = calc.querySelector('[data-photo]');
    var photoInput = calc.querySelector('[data-photo-input]');
    var skip = calc.querySelector('[data-skip]');

    function update() {
      // Gas furnace only: no size, no "what to replace", no line set
      var furnaceOnly = val(calc, 'sys', '') === 'furnace';
      calc.querySelectorAll('[data-hide-furnace]').forEach(function (el) {
        el.hidden = furnaceOnly;
        el.querySelectorAll('input').forEach(function (i) { i.disabled = furnaceOnly; });
        if (furnaceOnly && el.matches('label')) { var cb = el.querySelector('input'); if (cb) cb.checked = false; }
      });
      var fNote = calc.querySelector('[data-furnace-note]');
      if (fNote) fNote.hidden = !furnaceOnly;

      var e = estimate(calc);
      amt.textContent = money(e.low) + ' – ' + money(e.high);
      if (list) {
        list.innerHTML = '';
        e.lines.concat(e.notes).forEach(function (t) { var li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
      }
      if (maybeEl) {
        maybeEl.textContent = e.maybe.length ? 'May be needed after the visit: ' + e.maybe.join(', ') : '';
        maybeEl.hidden = !e.maybe.length;
      }
      if (zipMsg) {
        var z = zipOf(calc);
        zipMsg.textContent = z ? 'ZIP ' + z + ' found. The contractor’s price zone and permit office come from this.' : 'Type an address or a 5-digit ZIP code.';
      }
    }
    if (model) {
      model.addEventListener('input', function () {
        var m = model.value.toUpperCase().match(/(018|024|030|036|042|048|060)/);
        if (m && m[1] === '018') {
          modelMsg.textContent = 'That looks like 1.5 tons. Pick the closest size below.';
        } else if (m) {
          var tons = String(parseInt(m[1], 10) / 12);
          var r = calc.querySelector('input[name="size"][value="' + tons + '"]');
          if (r) r.checked = true;
          modelMsg.textContent = 'We read ' + m[1] + ' = ' + tons + ' tons. Change the size below if that looks wrong.';
        } else {
          modelMsg.textContent = model.value ? 'We couldn’t read a size from that. Pick it below.' : '';
        }
        update();
      });
    }
    if (photo && photoInput) {
      photo.addEventListener('click', function () { photoInput.click(); });
      photoInput.addEventListener('change', function () {
        if (photoInput.files.length) modelMsg.textContent = 'Got it. Your live calculator reads the size and age from the photo. In this demo, type the model number or pick the size below.';
      });
    }
    if (skip) skip.addEventListener('click', function () { var s = calc.querySelector('[data-size-q]'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    update();
  });

  // ---------- Maintenance widget (demo prices) ----------
  document.querySelectorAll('[data-maint]').forEach(function (w) {
    var tabs = w.querySelectorAll('[role="tab"]');
    var panes = w.querySelectorAll('[role="tabpanel"]');
    var amt = w.querySelector('[data-m-amt]');
    var lbl = w.querySelector('[data-m-lbl]');
    var sub = w.querySelector('[data-m-sub]');
    var cta = w.querySelector('[data-m-cta]');
    var PLAN = { basic: 10, standard: 22, premium: 33 };
    var EXTRA = 8, TUNEUP = 139, EXTRA_TUNE = 99, DIAG = 89;
    var state = 'plan';

    function show(name) {
      state = name;
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === name ? 'true' : 'false'); });
      panes.forEach(function (p) { p.hidden = p.dataset.pane !== name; });
      update();
    }
    var msg = w.querySelector('[data-m-msg]');
    var ageNote = w.querySelector('[data-age-note]');
    if (cta && msg) cta.addEventListener('click', function () { msg.hidden = false; });
    function update() {
      var n = parseInt(val(w, 'systems', '1'), 10);
      var extra = Math.max(0, n - 1);
      var sysLabel = n === 1 ? '1 SYSTEM' : (n >= 3 ? '3+ SYSTEMS' : n + ' SYSTEMS');
      if (ageNote) ageNote.hidden = val(w, 'age', '') !== '15plus';
      if (msg) msg.hidden = true;
      if (state === 'plan') {
        var plan = val(w, 'plan', 'standard');
        lbl.textContent = plan.toUpperCase() + ' PLAN · ' + sysLabel;
        amt.textContent = money(PLAN[plan] + EXTRA * extra) + ' a month';
        sub.textContent = 'Billed monthly, renews automatically, cancel any time.';
        cta.textContent = 'Join + book my tune-up';
      } else if (state === 'tune') {
        lbl.textContent = 'TUNE-UP · ' + sysLabel;
        amt.textContent = money(TUNEUP + EXTRA_TUNE * extra);
        sub.textContent = 'Plan members get tune-ups included.';
        cta.textContent = 'Book my tune-up';
      } else {
        lbl.textContent = 'DIAGNOSTIC VISIT';
        amt.textContent = money(DIAG);
        sub.textContent = 'A technician finds the problem and gives you a written price before any repair.';
        cta.textContent = 'Book a diagnostic visit';
      }
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.tab); }); });
    w.addEventListener('change', update);
    show('plan');
  });

  // ---------- Sign-up form ----------
  var params = new URLSearchParams(location.search);
  // Netlify strips data-netlify when it deploys, so find the form by its name
  document.querySelectorAll('form[name="signup"]').forEach(function (form) {
    var want = params.get('calc');
    if (want) { var r = form.querySelector('input[name="calculator"][value="' + want + '"]'); if (r) r.checked = true; }
    if (form.referrer) form.referrer.value = document.referrer || 'direct';
  });
})();
