(() => {
  const GA_MEASUREMENT_ID = 'G-XV5B4ZYY4J';
  const CONSENT_KEY = 'shtogryn_analytics_consent';
  const lang = document.documentElement.lang || 'en';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  };

  const writeConsent = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
  };

  const loadAnalytics = () => {
    if (document.querySelector(`script[data-ga4="${GA_MEASUREMENT_ID}"]`)) return;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    gaScript.dataset.ga4 = GA_MEASUREMENT_ID;
    document.head.appendChild(gaScript);
  };

  const trackEvent = (name, params = {}) => {
    if (readConsent() !== 'granted') return;
    if (!document.querySelector(`script[data-ga4="${GA_MEASUREMENT_ID}"]`)) return;
    window.gtag('event', name, params);
  };

  document.querySelectorAll('a[href*="/services/"], a[href*="/tjanster/"]').forEach((link) => {
    link.addEventListener('click', () => trackEvent('service_cta', {
      link_url: link.href,
      link_text: (link.textContent || '').trim().slice(0, 100)
    }));
  });

  document.querySelectorAll('a.project, [data-project-link]').forEach((link) => {
    link.addEventListener('click', () => trackEvent('project_click', {
      project_url: link.href,
      project_name: (link.querySelector('h3')?.textContent || link.textContent || '').trim().slice(0, 100)
    }));
  });

  const consentCopy = {
    en: {
      title: 'Analytics cookies',
      text: 'Allow privacy-conscious analytics so I can understand how this site is used and improve it. No advertising cookies are enabled.',
      accept: 'Accept analytics',
      reject: 'Reject',
      settings: 'Cookie settings',
      privacy: 'Privacy'
    },
    sv: {
      title: 'Analyscookies',
      text: 'Tillåt integritetsmedveten analys så att jag kan förstå hur webbplatsen används och förbättra den. Inga annonscookies aktiveras.',
      accept: 'Tillåt analys',
      reject: 'Avvisa',
      settings: 'Cookieinställningar',
      privacy: 'Integritet'
    },
    uk: {
      title: 'Аналітичні cookies',
      text: 'Дозвольте аналітику, щоб я міг бачити, як використовується сайт, і покращувати його. Рекламні cookies не вмикаються.',
      accept: 'Дозволити аналітику',
      reject: 'Відхилити',
      settings: 'Налаштування cookies',
      privacy: 'Конфіденційність'
    },
    ru: {
      title: 'Аналитические cookies',
      text: 'Разрешите аналитику, чтобы я мог понимать, как используется сайт, и улучшать его. Рекламные cookies не включаются.',
      accept: 'Разрешить аналитику',
      reject: 'Отклонить',
      settings: 'Настройки cookies',
      privacy: 'Конфиденциальность'
    }
  };

  const consentText = consentCopy[lang] || consentCopy.en;

  const removeConsentBanner = () => {
    const current = document.querySelector('.cookie-consent');
    if (current) current.remove();
  };

  const showConsentBanner = () => {
    removeConsentBanner();
    const banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', consentText.title);

    const inner = document.createElement('div');
    inner.className = 'cookie-consent-inner';

    const copy = document.createElement('div');
    copy.className = 'cookie-consent-copy';
    const title = document.createElement('strong');
    title.textContent = consentText.title;
    const text = document.createElement('p');
    text.textContent = consentText.text;
    const privacy = document.createElement('a');
    privacy.href = '/privacy';
    privacy.textContent = consentText.privacy;
    copy.append(title, text, privacy);

    const actions = document.createElement('div');
    actions.className = 'cookie-consent-actions';
    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'btn';
    reject.textContent = consentText.reject;
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'btn primary';
    accept.textContent = consentText.accept;

    reject.addEventListener('click', () => {
      writeConsent('denied');
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      removeConsentBanner();
    });

    accept.addEventListener('click', () => {
      writeConsent('granted');
      loadAnalytics();
      removeConsentBanner();
    });

    actions.append(reject, accept);
    inner.append(copy, actions);
    banner.appendChild(inner);
    document.body.appendChild(banner);
  };

  const savedConsent = readConsent();
  if (savedConsent === 'granted') {
    loadAnalytics();
  } else if (savedConsent !== 'denied') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showConsentBanner, { once: true });
    } else {
      showConsentBanner();
    }
  }

  const ensureLink = (rel, href, attrs = {}) => {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  };

  const ensureMeta = (name, content) => {
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  };

  ensureLink('icon', '/favicon.svg', { type: 'image/svg+xml' });
  ensureLink('manifest', '/site.webmanifest');
  ensureMeta('theme-color', '#0a0c0f');
  ensureMeta('color-scheme', 'dark');
  ensureMeta('referrer', 'strict-origin-when-cross-origin');

  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav nav');
  if (menu && nav) {
    nav.id = nav.id || 'primary-navigation';
    menu.setAttribute('aria-controls', nav.id);
    menu.setAttribute('aria-expanded', 'false');

    const closeMenu = () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    };

    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const languageButton = document.querySelector('.lang button');
  const languageMenu = document.querySelector('.langmenu');
  if (languageButton && languageMenu) {
    languageMenu.id = languageMenu.id || 'language-menu';
    languageButton.setAttribute('aria-controls', languageMenu.id);
    languageButton.setAttribute('aria-expanded', 'false');

    const closeLanguageMenu = () => {
      languageMenu.classList.remove('show');
      languageButton.setAttribute('aria-expanded', 'false');
    };

    languageButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = languageMenu.classList.toggle('show');
      languageButton.setAttribute('aria-expanded', String(open));
    });
    languageMenu.addEventListener('click', (event) => event.stopPropagation());
    document.addEventListener('click', closeLanguageMenu);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLanguageMenu();
    });
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
    link.setAttribute('referrerpolicy', 'no-referrer');
  });

  const copy = {
    en: {
      eyebrow: 'Process',
      title: 'Clear work. Clear responsibility.',
      lead: 'A practical delivery process with visible decisions, controlled changes and a working result.',
      steps: [
        ['01', 'Understand', 'Scope the real problem, constraints and desired outcome before choosing technology.'],
        ['02', 'Design', 'Define the architecture, UX or technical solution with maintainability and security in mind.'],
        ['03', 'Build', 'Implement in small verifiable steps, keeping the system understandable and recoverable.'],
        ['04', 'Verify', 'Test the result, review edge cases and confirm the delivered system works in production.']
      ],
      trust: [
        ['Security-minded', 'No secrets in frontend code'],
        ['Production-first', 'Real deployment and readback'],
        ['Multilingual', 'EN · SV · UK · RU'],
        ['Sweden-based', 'Local technical context']
      ]
    },
    uk: {
      eyebrow: 'Процес',
      title: 'Чітка робота. Чітка відповідальність.',
      lead: 'Практичний процес виконання з прозорими рішеннями, контрольованими змінами та перевіреним результатом.',
      steps: [
        ['01', 'Зрозуміти', 'Спочатку визначаю реальну задачу, обмеження та бажаний результат — і лише потім обираю технологію.'],
        ['02', 'Спроєктувати', 'Формую архітектуру, UX або технічне рішення з урахуванням підтримки, безпеки та розвитку.'],
        ['03', 'Реалізувати', 'Впроваджую невеликими перевірюваними кроками, щоб система залишалась зрозумілою та відновлюваною.'],
        ['04', 'Перевірити', 'Тестую результат, граничні сценарії та підтверджую роботу рішення у production.']
      ],
      trust: [
        ['Безпека', 'Жодних секретів у frontend'],
        ['Production-first', 'Реальний deploy і readback'],
        ['4 мови', 'EN · SV · UK · RU'],
        ['Швеція', 'Локальний технічний контекст']
      ]
    },
    sv: {
      eyebrow: 'Arbetssätt',
      title: 'Tydligt arbete. Tydligt ansvar.',
      lead: 'En praktisk leveransprocess med synliga beslut, kontrollerade ändringar och ett verifierat resultat.',
      steps: [
        ['01', 'Förstå', 'Jag klargör det verkliga problemet, begränsningarna och målet innan teknik väljs.'],
        ['02', 'Designa', 'Jag definierar arkitektur, UX eller teknisk lösning med säkerhet och förvaltning i åtanke.'],
        ['03', 'Bygga', 'Jag genomför i små verifierbara steg så att systemet förblir begripligt och återställningsbart.'],
        ['04', 'Verifiera', 'Jag testar resultatet, granskar gränsfall och bekräftar att lösningen fungerar i produktion.']
      ],
      trust: [
        ['Säkerhet', 'Inga hemligheter i frontend'],
        ['Production-first', 'Riktig deploy och readback'],
        ['Flerspråkigt', 'EN · SV · UK · RU'],
        ['Sverige', 'Lokal teknisk kontext']
      ]
    },
    ru: {
      eyebrow: 'Процесс',
      title: 'Чёткая работа. Чёткая ответственность.',
      lead: 'Практический процесс с прозрачными решениями, контролируемыми изменениями и проверенным результатом.',
      steps: [
        ['01', 'Понять', 'Сначала определяю реальную задачу, ограничения и желаемый результат — затем выбираю технологию.'],
        ['02', 'Спроектировать', 'Формирую архитектуру, UX или техническое решение с учётом поддержки, безопасности и развития.'],
        ['03', 'Реализовать', 'Внедряю небольшими проверяемыми шагами, чтобы система оставалась понятной и восстанавливаемой.'],
        ['04', 'Проверить', 'Тестирую результат, пограничные сценарии и подтверждаю работу решения в production.']
      ],
      trust: [
        ['Безопасность', 'Никаких секретов во frontend'],
        ['Production-first', 'Реальный deploy и readback'],
        ['4 языка', 'EN · SV · UK · RU'],
        ['Швеция', 'Локальный технический контекст']
      ]
    }
  };

  const t = copy[lang] || copy.en;
  const services = document.getElementById('services');
  const experience = document.getElementById('experience');

  if (services && experience && !document.getElementById('process')) {
    const section = document.createElement('section');
    section.id = 'process';
    section.className = 'section process-section dark';

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const head = document.createElement('div');
    head.className = 'section-head';

    const headLeft = document.createElement('div');
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = t.eyebrow;

    const h2 = document.createElement('h2');
    h2.textContent = t.title;
    headLeft.append(eyebrow, h2);

    const lead = document.createElement('p');
    lead.textContent = t.lead;
    head.append(headLeft, lead);

    const grid = document.createElement('div');
    grid.className = 'process-grid';
    t.steps.forEach(([num, title, text]) => {
      const card = document.createElement('article');
      card.className = 'process-step';
      const n = document.createElement('span');
      n.textContent = num;
      const h3 = document.createElement('h3');
      h3.textContent = title;
      const p = document.createElement('p');
      p.textContent = text;
      card.append(n, h3, p);
      grid.appendChild(card);
    });

    wrap.append(head, grid);
    section.appendChild(wrap);
    experience.parentNode.insertBefore(section, experience);
  }

  const projects = document.getElementById('projects');
  const contact = document.getElementById('contact');
  if (projects && contact && !document.querySelector('.trust-strip')) {
    const section = document.createElement('section');
    section.className = 'trust-strip';

    const wrap = document.createElement('div');
    wrap.className = 'wrap trust-grid';

    t.trust.forEach(([title, text]) => {
      const item = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = title;
      const span = document.createElement('span');
      span.textContent = text;
      item.append(strong, span);
      wrap.appendChild(item);
    });

    section.appendChild(wrap);
    contact.parentNode.insertBefore(section, contact);
  }

  const contactActions = document.querySelector('.contact-actions');
  if (contactActions && !contactActions.querySelector('[data-privacy-link]')) {
    const labels = { uk: 'Конфіденційність', ru: 'Конфиденциальность', sv: 'Integritet', en: 'Privacy' };
    const privacy = document.createElement('a');
    privacy.className = 'btn';
    privacy.href = '/privacy';
    privacy.dataset.privacyLink = '1';
    privacy.textContent = labels[lang] || labels.en;
    contactActions.appendChild(privacy);
  }

  const footer = document.querySelector('.footer-grid');
  if (footer && !footer.querySelector('.footer-links')) {
    const labels = { uk: 'Конфіденційність', ru: 'Конфиденциальность', sv: 'Integritet', en: 'Privacy' };
    const links = document.createElement('span');
    links.className = 'footer-links';

    const privacy = document.createElement('a');
    privacy.href = '/privacy';
    privacy.textContent = labels[lang] || labels.en;

    const separator = document.createTextNode(' · ');
    const security = document.createElement('a');
    security.href = '/.well-known/security.txt';
    security.textContent = 'Security';

    links.append(privacy, separator, security);
    footer.appendChild(links);
  }

  if (footer && !footer.querySelector('[data-cookie-settings]')) {
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cookie-settings-link';
    settings.dataset.cookieSettings = '1';
    settings.textContent = consentText.settings;
    settings.addEventListener('click', showConsentBanner);
    footer.appendChild(settings);
  }

  const LEAD_SERVICE_KEY = 'shtogryn_lead_service';
  const form = document.querySelector('.contact-form');
  if (form) {
    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const message = form.querySelector('textarea[name="message"]');
    const service = form.querySelector('select[name="service"]');
    const submit = form.querySelector('button[type="submit"]');

    if (name) {
      name.maxLength = 80;
      name.minLength = 2;
    }
    if (email) email.maxLength = 160;
    if (message) {
      message.maxLength = 3000;
      message.minLength = 10;
    }

    form.setAttribute('accept-charset', 'UTF-8');
    form.addEventListener('submit', () => {
      const selectedService = (service?.value || '').slice(0, 120);
      try { sessionStorage.setItem(LEAD_SERVICE_KEY, selectedService); } catch (_) {}
      trackEvent('contact_submit', {
        form_id: 'contact',
        service: selectedService,
        page_path: location.pathname
      });
      if (submit) {
        submit.disabled = true;
        submit.setAttribute('aria-busy', 'true');
      }
    });
  }

  document.querySelectorAll('a.email-link, a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', () => trackEvent('contact_intent', {
      contact_method: 'email',
      page_path: location.pathname
    }));
  });

  const params = new URLSearchParams(location.search);
  if (params.get('sent') === '1' && form) {
    const messages = {
      uk: 'Дякую. Повідомлення відправлено — я відповім на вказану вами електронну адресу.',
      ru: 'Спасибо. Сообщение отправлено — я отвечу на указанный вами адрес электронной почты.',
      sv: 'Tack. Meddelandet har skickats — jag svarar till den e-postadress du angav.',
      en: 'Thank you. Your message was sent — I will reply to the email address you provided.'
    };

    const box = document.createElement('div');
    box.className = 'form-success';
    box.setAttribute('role', 'status');
    box.textContent = messages[lang] || messages.en;
    form.parentNode.insertBefore(box, form);

    let selectedService = '';
    try {
      selectedService = sessionStorage.getItem(LEAD_SERVICE_KEY) || '';
      sessionStorage.removeItem(LEAD_SERVICE_KEY);
    } catch (_) {}
    trackEvent('generate_lead', {
      form_id: 'contact',
      service: selectedService.slice(0, 120),
      page_path: location.pathname
    });

    params.delete('sent');
    const query = params.toString();
    history.replaceState({}, '', location.pathname + (query ? `?${query}` : '') + '#contact');
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (target) setTimeout(() => target.setAttribute('tabindex', '-1'), 0);
    });
  });
})();
