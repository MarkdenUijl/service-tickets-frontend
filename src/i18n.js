import { createI18n } from 'vue-i18n';
import enAuth from './lang/en/en-auth.json';
import nlAuth from './lang/nl/nl-auth.json';

import enBase from './lang/en/en-base.json';
import nlBase from './lang/nl/nl-base.json';

import enDash from './lang/en/en-dash.json';
import nlDash from './lang/nl/nl-dash.json';

import enTicket from './lang/en/en-ticket.json';
import nlTicket from './lang/nl/nl-ticket.json';

const messages = {
  en: {
    auth: enAuth,
    base: enBase,
    dash: enDash,
    ticket: enTicket
  },
  nl: {
    auth: nlAuth,
    base: nlBase,
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