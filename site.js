// Ballpark Leads — site scripts: mobile nav, demo calculators, form prefill
(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Year in footer
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Demo pricing (illustrative only — each contractor's calculator uses their own prices)
  var MODELS = {
    roofing: function (f) {
      var sqft = +f.sqft.value, stories = +f.stories.value;
      var mat = (f.querySelector('input[name="material"]:checked') || {}).value || 'asphalt';
      var rates = { asphalt: [450, 650], metal: [900, 1400], tile: [1000, 1600] };
      var squares = (sqft / stories) * 1.2 / 100;
      var storyBump = stories > 1 ? 1.08 : 1;
      var r = rates[mat];
      return [squares * r[0] * storyBump, squares * r[1] * storyBump, Math.round(squares) + ' roofing squares'];
    },
    hvac: function (f) {
      var sqft = +f.sqft.value;
      var sys = (f.querySelector('input[name="system"]:checked') || {}).value || 'ac';
      var eff = (f.querySelector('input[name="efficiency"]:checked') || {}).value || 'standard';
      var rates = { ac: [1600, 2400], heatpump: [2000, 3000], full: [2600, 3800] };
      var tons = Math.max(1.5, Math.round((sqft / 550) * 2) / 2);
      var m = eff === 'high' ? 1.22 : 1;
      var r = rates[sys];
      return [tons * r[0] * m + 1500, tons * r[1] * m + 2500, tons + '-ton system'];
    }
  };

  document.querySelectorAll('[data-calc]').forEach(function (calc) {
    var tabs = calc.querySelectorAll('.calc-tabs button');
    var panes = calc.querySelectorAll('[data-pane]');
    function show(name) {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === name ? 'true' : 'false'); });
      panes.forEach(function (p) { p.hidden = p.dataset.pane !== name; });
      calc.dataset.active = name;
      update();
    }
    function update() {
      var name = calc.dataset.active || panes[0].dataset.pane;
      var pane = calc.querySelector('[data-pane="' + name + '"]');
      var out = MODELS[name](pane);
      var sq = pane.querySelector('[data-sqft-out]');
      if (sq) sq.textContent = (+pane.sqft.value).toLocaleString('en-US') + ' sq ft';
      calc.querySelector('[data-amount]').textContent =
        '$' + (Math.round(out[0] / 100) * 100).toLocaleString('en-US') + ' – $' + (Math.round(out[1] / 100) * 100).toLocaleString('en-US');
      calc.querySelector('[data-detail]').textContent = 'Based on a ' + out[2] + '. Demo prices — your calculator uses yours.';
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.tab); }); });
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    show(calc.dataset.start || panes[0].dataset.pane);
  });

  // Prefill trade from ?trade= and remember the page the visitor came from
  var params = new URLSearchParams(location.search);
  var trade = params.get('trade');
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    if (trade && form.trade) {
      for (var i = 0; i < form.trade.options.length; i++) {
        if (form.trade.options[i].value.toLowerCase() === trade.toLowerCase()) form.trade.selectedIndex = i;
      }
    }
    if (form.plan && params.get('plan')) form.plan.value = params.get('plan');
    if (form.referrer) form.referrer.value = document.referrer || 'direct';
  });
})();
