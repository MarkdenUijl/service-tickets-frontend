import { createI18n } from 'vue-i18n';
import enAuth from './lang/en/en-auth.json';
import nlAuth from './lang/nl/nl-auth.json';

import enDash from './lang/en/en-dash.json';
import nlDash from './lang/nl/nl-dash.json';

import enTicket from './lang/en/en-ticket.json';
import nlTicket from './lang/nl/nl-ticket.json';

const messages = {
  en: {
    auth: enAuth,
    dash: enDash,
    ticket: enTicket
  },
  nl: {
    auth: nlAuth,
    dash: nlDash,
    ticket: nlTicket
  }
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'en',
  fallbackLocale: 'en',
  messages
});

export default i18n;