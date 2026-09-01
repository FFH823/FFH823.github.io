(function () {
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var banner = document.querySelector('.banner');
  var navStrip = document.querySelector('.nav-strip');
  var scrollContainer = document.querySelector('.nav-strip-scroll');
  var arrow = document.querySelector('.nav-arrow');
  var shareBtn = document.getElementById('share-btn');

  function setActive(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // Scrollspy: highlight whichever section's top edge is the last one to have
  // crossed just below the fixed banner + nav strip. Recomputed every scroll
  // frame so the highlight tracks the visitor immediately in both directions.
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function fixedOffset() {
    return (banner ? banner.offsetHeight : 0) + (navStrip ? navStrip.offsetHeight : 0);
  }

  // Matches the CSS scroll-margin-top used for anchor-jump landing, so a
  // section activates its own nav pill the instant a jump lands on it.
  function activationLine() {
    var smt = sections.length ? parseFloat(getComputedStyle(sections[0]).scrollMarginTop) : NaN;
    return (isNaN(smt) ? fixedOffset() : smt) + 2;
  }

  function updateActiveSection() {
    if (!sections.length) return;

    // At the bottom of the page there may not be enough room left to scroll
    // the last section's top past the activation line, so force it active.
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }

    var line = activationLine();
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) {
        current = sections[i];
      } else {
        break;
      }
    }
    setActive(current.id);
  }

  var scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      updateActiveSection();
      scrollTicking = false;
    });
  }

  if (sections.length) {
    updateActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // Fading right-edge arrow hinting the nav strip is horizontally scrollable.
  function updateArrow() {
    if (!scrollContainer || !arrow) return;
    var hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1;
    var atEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 4;
    arrow.classList.toggle('is-hidden', !hasOverflow || atEnd);
  }

  if (scrollContainer) {
    updateArrow();
    scrollContainer.addEventListener('scroll', updateArrow, { passive: true });
    window.addEventListener('resize', updateArrow);
  }

  // Share PDF: only revealed when the browser can actually share files, so it
  // hands the PDF straight to the OS share sheet (Gmail, Outlook, etc.).
  var pdfPath = 'files/Frank_Han.pdf';
  var pdfFileName = 'Frank_Han.pdf';

  if (shareBtn && navigator.canShare) {
    try {
      var probeFile = new File([''], pdfFileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [probeFile] })) {
        shareBtn.hidden = false;
        shareBtn.addEventListener('click', function () {
          fetch(pdfPath)
            .then(function (res) { return res.blob(); })
            .then(function (blob) {
              var file = new File([blob], pdfFileName, { type: 'application/pdf' });
              if (navigator.canShare({ files: [file] })) {
                return navigator.share({ files: [file], title: pdfFileName });
              }
            })
            .catch(function () {});
        });
      }
    } catch (e) {}
  }
})();
