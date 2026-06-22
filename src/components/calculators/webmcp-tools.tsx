'use client';

import { useEffect } from 'react';

/**
 * WebMCP — expune câteva calculatoare ca „tools" pentru agenții AI din browser
 * (navigator.modelContext, propunere Chrome, experimental). Progressive enhancement:
 * dacă API-ul nu există (majoritatea browserelor azi), nu se întâmplă nimic.
 * Vezi https://developer.chrome.com/docs/ai/webmcp
 */

const W = 4050; // salariu minim de referință CASS 2026
function cassDividende(base: number): number {
  if (base < 6 * W) return 0;
  if (base < 12 * W) return 0.1 * 6 * W;
  if (base < 24 * W) return 0.1 * 12 * W;
  return 0.1 * 24 * W;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, number | string>) => Promise<{ content: { type: string; text: string }[] }>;
}

const ok = (text: string) => ({ content: [{ type: 'text', text }] });
const num = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(n);

const TOOLS: McpTool[] = [
  {
    name: 'calculeaza_tva',
    description: 'Calculează TVA în România 2026 (cotă standard 21% sau redusă 11%). Adaugă TVA la o sumă fără TVA sau extrage TVA dintr-o sumă cu TVA.',
    inputSchema: {
      type: 'object',
      properties: {
        suma: { type: 'number', description: 'Suma în lei' },
        cota: { type: 'number', description: 'Cota TVA (21 sau 11)', default: 21 },
        mod: { type: 'string', enum: ['adauga', 'extrage'], description: 'adauga = suma e fără TVA; extrage = suma include TVA', default: 'adauga' },
      },
      required: ['suma'],
    },
    execute: async (a) => {
      const suma = Number(a.suma);
      const cota = Number(a.cota ?? 21);
      if (a.mod === 'extrage') {
        const baza = suma / (1 + cota / 100);
        return ok(`Din ${num(suma)} lei (cu TVA ${cota}%): bază ${num(baza)} lei + TVA ${num(suma - baza)} lei.`);
      }
      const tva = (suma * cota) / 100;
      return ok(`${num(suma)} lei + TVA ${cota}% = ${num(suma + tva)} lei (TVA ${num(tva)} lei).`);
    },
  },
  {
    name: 'calculeaza_dividende',
    description: 'Calculează impozitul pe dividende în România 2026 (16%) plus CASS pe plafoane și suma netă încasată.',
    inputSchema: {
      type: 'object',
      properties: {
        dividende_brute: { type: 'number', description: 'Dividende brute în lei' },
        alte_venituri: { type: 'number', description: 'Alte venituri extra-salariale anuale (pentru plafonul CASS)', default: 0 },
      },
      required: ['dividende_brute'],
    },
    execute: async (a) => {
      const brut = Number(a.dividende_brute);
      const alte = Number(a.alte_venituri ?? 0);
      const impozit = Math.round(brut * 0.16);
      const cass = cassDividende(brut + alte);
      return ok(`Dividende ${num(brut)} lei: impozit 16% = ${num(impozit)} lei, CASS = ${num(cass)} lei, net = ${num(brut - impozit - cass)} lei.`);
    },
  },
  {
    name: 'calculeaza_rata_credit',
    description: 'Calculează rata lunară a unui credit (ipotecar/consum) cu rate egale (anuitate) în România.',
    inputSchema: {
      type: 'object',
      properties: {
        suma: { type: 'number', description: 'Suma creditului în lei' },
        dobanda_anuala: { type: 'number', description: 'Dobânda anuală (%)' },
        ani: { type: 'number', description: 'Perioada în ani' },
      },
      required: ['suma', 'dobanda_anuala', 'ani'],
    },
    execute: async (a) => {
      const P = Number(a.suma);
      const i = Number(a.dobanda_anuala) / 12 / 100;
      const n = Math.round(Number(a.ani) * 12);
      const rata = i > 0 ? (P * i) / (1 - Math.pow(1 + i, -n)) : P / n;
      return ok(`Credit ${num(P)} lei, ${a.dobanda_anuala}%, ${a.ani} ani: rată ${num(rata)} lei/lună, total ${num(rata * n)} lei (dobândă ${num(rata * n - P)} lei).`);
    },
  },
  {
    name: 'calculeaza_procent',
    description: 'Calculează X% dintr-o valoare.',
    inputSchema: {
      type: 'object',
      properties: {
        procent: { type: 'number', description: 'Procentul (ex. 20 pentru 20%)' },
        valoare: { type: 'number', description: 'Valoarea' },
      },
      required: ['procent', 'valoare'],
    },
    execute: async (a) => ok(`${a.procent}% din ${num(Number(a.valoare))} = ${num((Number(a.procent) * Number(a.valoare)) / 100)}.`),
  },
];

export function WebMcpTools() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mc = (navigator as any)?.modelContext;
    if (!mc || typeof mc.registerTool !== 'function') return;
    const handles: unknown[] = [];
    for (const tool of TOOLS) {
      try {
        handles.push(mc.registerTool(tool));
      } catch {
        /* API experimentală — ignoră dacă forma diferă */
      }
    }
    return () => {
      for (const h of handles) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (h as any)?.unregister?.();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);
  return null;
}
