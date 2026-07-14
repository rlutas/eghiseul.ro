/**
 * Old Romanian land units → m², shared by the client widget and the server
 * page (reference table). Historical values: Austro-Hungarian cadastral system
 * for Transylvania (jugăr = 1600 Viennese square stânjeni), pre-metric
 * Moldavian units (falce), and Wallachian units fixed by the 1875 metric law
 * (pogoane × 5012 / 10000 = ha).
 */
export interface LandUnit {
  id: string;
  label: string;
  region: string;
  /** Square meters per 1 unit. */
  mp: number;
  note: string;
}

export const LAND_UNITS: LandUnit[] = [
  {
    id: 'jugar-cadastral',
    label: 'Jugăr cadastral',
    region: 'Transilvania (sistem austro-ungar)',
    mp: 5754.64,
    note: '1.600 stânjeni pătrați vienezi ≈ 0,575464 ha',
  },
  {
    id: 'jugar-unguresc',
    label: 'Jugăr unguresc (arabil)',
    region: 'Transilvania',
    mp: 4316,
    note: '1.200 stânjeni pătrați vienezi',
  },
  {
    id: 'jugar-mic',
    label: 'Jugăr mic',
    region: 'Secuime',
    mp: 3596,
    note: '1.000 stânjeni pătrați vienezi',
  },
  {
    id: 'stanjen-vienez',
    label: 'Stânjen pătrat vienez',
    region: 'Transilvania',
    mp: 3.5957,
    note: 'stânjen liniar de 1,896 m',
  },
  {
    id: 'stanjen-serban-voda',
    label: 'Stânjen pătrat Șerban Vodă',
    region: 'Muntenia',
    mp: 3.867,
    note: 'stânjen liniar de ~1,9665 m',
  },
  {
    id: 'stanjen-moldovenesc',
    label: 'Stânjen pătrat moldovenesc',
    region: 'Moldova',
    mp: 4.9729,
    note: 'stânjen liniar de 2,23 m',
  },
  {
    id: 'falce',
    label: 'Falce',
    region: 'Moldova',
    mp: 14321.9,
    note: '2.880 stânjeni pătrați moldovenești ≈ 1,43 ha',
  },
  {
    id: 'prajina-falceasca',
    label: 'Prăjină fălcească',
    region: 'Moldova',
    mp: 179.02,
    note: '1/80 dintr-o falce',
  },
  {
    id: 'pogon',
    label: 'Pogon',
    region: 'Muntenia',
    mp: 5011.79,
    note: '1.296 stânjeni pătrați Șerban Vodă ≈ 0,5 ha (legea metrică din 1875)',
  },
  {
    id: 'ar',
    label: 'Ar',
    region: 'unitate metrică',
    mp: 100,
    note: '100 m²',
  },
  {
    id: 'hectar',
    label: 'Hectar',
    region: 'unitate metrică',
    mp: 10000,
    note: '10.000 m² = 100 ari',
  },
];
