import { describe, expect, it } from 'vitest';
import {
  LAWYER_SERVICE_SLUGS,
  isLawyerService,
  isNoLawyerService,
} from '@/lib/documents/no-lawyer-services';

/**
 * Which services get the lawyer document set (contract de asistență +
 * împuternicire + cerere + numere de Barou) and which get ONLY
 * contract-prestari.
 *
 * Regression: E-260810-EP896 (Plan de Amplasament și Delimitare, serviciu prin
 * topograf) a primit contract de asistență juridică și a ars numărul de Barou
 * 006024 din registrul central.
 */
describe('no-lawyer-services', () => {
  const LAWYER = [
    'cazier-judiciar',
    'cazier-judiciar-persoana-fizica',
    'cazier-judiciar-persoana-juridica',
    'cazier-auto',
    'cazier-fiscal',
    'certificat-nastere',
    'certificat-casatorie',
    'certificat-celibat',
    'certificat-integritate',
    'extras-multilingv-certificat-nastere',
    'extras-multilingv-certificat-casatorie',
  ];

  // Catalogul real (DB `services.slug`), 2026-08-12 — tot ce NU trece prin avocat.
  const NO_LAWYER = [
    // ONRC
    'certificat-constatator',
    // ANCPI automat
    'extras-carte-funciara',
    'extras-plan-cadastral',
    'identificare-imobil',
    'identificare-imobile-proprietar',
    // imobiliare prin topograf (colaborator)
    'plan-amplasament-delimitare',
    'actualizare-adresa-cf',
    'certificat-detineri-imobile',
    'certificat-sarcini',
    'certificat-urbanism-informare',
    'copie-arhiva-ocpi',
    'copie-carte-funciara',
    'copie-contract-vanzare',
    'copie-intabulare',
    'copie-inventar-coordonate',
    'copie-plan-cadastral',
    'copie-plan-incadrare',
    'copie-releveu',
    'extras-cf-colectiv',
    // altele
    'rovinieta',
  ];

  it.each(LAWYER)('%s trece prin avocat', (slug) => {
    expect(isLawyerService(slug)).toBe(true);
    expect(isNoLawyerService(slug)).toBe(false);
  });

  it.each(NO_LAWYER)('%s NU trece prin avocat (doar contract prestări)', (slug) => {
    expect(isNoLawyerService(slug)).toBe(true);
  });

  it('lista de servicii cu avocat nu conține duplicate', () => {
    expect(new Set(LAWYER_SERVICE_SLUGS).size).toBe(LAWYER_SERVICE_SLUGS.length);
  });

  it('slug lipsă NU e tratat ca serviciu fără avocat (fail-safe)', () => {
    expect(isNoLawyerService(null)).toBe(false);
    expect(isNoLawyerService(undefined)).toBe(false);
    expect(isNoLawyerService('')).toBe(false);
  });

  it('serviciu necunoscut = fără avocat (catalogul imobiliar crește)', () => {
    expect(isNoLawyerService('serviciu-nou-imobiliar')).toBe(true);
  });
});
