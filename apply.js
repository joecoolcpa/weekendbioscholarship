(function () {
  'use strict';

  var MIN_WORDS = 10;
  var CONTACT_EMAIL = 'scholarship@weekendbio.com';

  var form = document.getElementById('application');
  if (!form) return;

  var nameInput = document.getElementById('name');
  var classInput = document.getElementById('class_of');
  var emailInput = document.getElementById('email');
  var essayInput = document.getElementById('essay');
  var certifyInput = document.getElementById('certify');
  var agreeInput = document.getElementById('agree');
  var countText = document.getElementById('essay-count');
  var meter = document.getElementById('essay-meter');
  var segments = meter.querySelectorAll('span');
  var status = document.getElementById('form-status');
  var confirmation = document.getElementById('confirmation');
  var submitButton = form.querySelector('button[type="submit"]');

  // Follows the counting rules published on essay.html: words are separated
  // by whitespace, and a token only counts if it has a letter or a number.
  function countWords(text) {
    return text.split(/\s+/).filter(function (token) {
      return /[\p{L}\p{N}]/u.test(token);
    }).length;
  }

  function updateCounter() {
    var n = countWords(essayInput.value);
    var state = n >= MIN_WORDS ? 'ok' : n > 0 ? 'short' : 'empty';

    for (var i = 0; i < segments.length; i++) {
      segments[i].classList.toggle('filled', i < n);
    }
    meter.setAttribute('data-state', state);
    countText.setAttribute('data-state', state);

    if (state === 'ok') {
      countText.textContent = n + ' words. Your essay meets the ten-word minimum.';
    } else if (state === 'short') {
      var needed = MIN_WORDS - n;
      countText.textContent = n + ' of ' + MIN_WORDS + ' required words. Add ' + needed + ' more or your essay will be disqualified.';
    } else {
      countText.textContent = '0 of ' + MIN_WORDS + ' required words';
    }
  }

  function showError(input, message) {
    var error = document.getElementById(input.id + '-error');
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.closest('.field, .check').classList.add('has-error');
  }

  function clearError(input) {
    if (!input.hasAttribute('aria-invalid')) return;
    var error = document.getElementById(input.id + '-error');
    error.textContent = '';
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    input.closest('.field, .check').classList.remove('has-error');
  }

  function validate() {
    var problems = [];
    var words = countWords(essayInput.value);

    if (!nameInput.value.trim()) {
      problems.push([nameInput, 'Enter your full name.']);
    }
    if (!classInput.value) {
      problems.push([classInput, 'Select the year you expect to graduate.']);
    }
    if (!emailInput.value.trim()) {
      problems.push([emailInput, 'Enter your email address.']);
    } else if (!emailInput.validity.valid) {
      problems.push([emailInput, 'Enter a valid email address, such as name@example.com.']);
    }
    if (words === 0) {
      problems.push([essayInput, 'Enter your essay.']);
    } else if (words < MIN_WORDS) {
      problems.push([essayInput, 'Your essay has ' + words + (words === 1 ? ' word' : ' words') + '. Essays under ten words are disqualified. Add at least ' + (MIN_WORDS - words) + ' more.']);
    }
    if (!certifyInput.checked) {
      problems.push([certifyInput, 'You must certify that the essay is your own original work.']);
    }
    if (!agreeInput.checked) {
      problems.push([agreeInput, 'You must agree to the Terms of Service and Privacy Policy.']);
    }
    return problems;
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Submitting…' : 'Submit application';
  }

  function showConfirmation() {
    document.getElementById('confirm-name').textContent = ', ' + nameInput.value.trim().split(/\s+/)[0];
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  }

  essayInput.addEventListener('input', updateCounter);

  form.addEventListener('input', function (event) { clearError(event.target); });
  form.addEventListener('change', function (event) { clearError(event.target); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(clearError);

    var problems = validate();
    if (problems.length) {
      problems.forEach(function (problem) { showError(problem[0], problem[1]); });
      problems[0][0].focus();
      return;
    }

    setSubmitting(true);
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Submission failed with status ' + response.status);
        showConfirmation();
      })
      .catch(function () {
        status.textContent = 'Your application could not be submitted. Check your internet connection and try again. If the problem continues, email ' + CONTACT_EMAIL + '.';
        status.hidden = false;
        setSubmitting(false);
      });
  });

  updateCounter();
})();
