import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'tabel-varsta-pensionare-anticipata-femei';
const TITLE = 'Tabel Vârstă Pensionare Anticipată Femei (actualizat)';
const DESCRIPTION =
  'Tabelul complet cu vârsta de pensionare anticipată pentru femei, conform Legii 360/2023: ' +
  'luna și anul nașterii, stagiul complet de cotizare, luna pensionării anticipate și vârsta la ieșirea la pensie.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
});

// Anexa 5, Legea 360/2023 — pensionare anticipată femei.
// [birthMonthYear, contributionPeriod, earlyRetirementMonthYear, retirementAge]
const TABLE_ROWS: [string, string, string, string][] = [
  ['Aprilie 1944', '25/0', 'Aprilie 1996', '52/0'],
  ['Mai 1944', '25/0', 'Mai 1996', '52/0'],
  ['Iunie 1944', '25/0', 'Iunie 1996', '52/0'],
  ['Iulie 1944', '25/0', 'Iulie 1996', '52/0'],
  ['August 1944', '25/0', 'August 1996', '52/0'],
  ['Septembrie 1944', '25/0', 'Septembrie 1996', '52/0'],
  ['Octombrie 1944', '25/0', 'Octombrie 1996', '52/0'],
  ['Noiembrie 1944', '25/0', 'Noiembrie 1996', '52/0'],
  ['Decembrie 1944', '25/0', 'Decembrie 1996', '52/0'],
  ['Ianuarie 1945', '25/0', 'Ianuarie 1997', '52/0'],
  ['Februarie 1945', '25/0', 'Februarie 1997', '52/0'],
  ['Martie 1945', '25/0', 'Martie 1997', '52/0'],
  ['Aprilie 1945', '25/1', 'Mai 1997', '52/1'],
  ['Mai 1945', '25/1', 'Iunie 1997', '52/1'],
  ['Iunie 1945', '25/1', 'Iulie 1997', '52/1'],
  ['Iulie 1945', '25/1', 'August 1997', '52/1'],
  ['August 1945', '25/1', 'Septembrie 1997', '52/1'],
  ['Septembrie 1945', '25/2', 'Noiembrie 1997', '52/2'],
  ['Octombrie 1945', '25/2', 'Decembrie 1997', '52/2'],
  ['Noiembrie 1945', '25/2', 'Ianuarie 1998', '52/2'],
  ['Decembrie 1945', '25/2', 'Februarie 1998', '52/2'],
  ['Ianuarie 1946', '25/2', 'Martie 1998', '52/2'],
  ['Februarie 1946', '25/3', 'Mai 1998', '52/3'],
  ['Martie 1946', '25/3', 'Iunie 1998', '52/3'],
  ['Aprilie 1946', '25/3', 'Iulie 1998', '52/3'],
  ['Mai 1946', '25/3', 'August 1998', '52/3'],
  ['Iunie 1946', '25/3', 'Septembrie 1998', '52/3'],
  ['Iulie 1946', '25/4', 'Noiembrie 1998', '52/4'],
  ['August 1946', '25/4', 'Decembrie 1998', '52/4'],
  ['Septembrie 1946', '25/4', 'Ianuarie 1999', '52/4'],
  ['Octombrie 1946', '25/4', 'Februarie 1999', '52/4'],
  ['Noiembrie 1946', '25/4', 'Martie 1999', '52/4'],
  ['Decembrie 1946', '25/5', 'Mai 1999', '52/5'],
  ['Ianuarie 1947', '25/5', 'Iunie 1999', '52/5'],
  ['Februarie 1947', '25/5', 'Iulie 1999', '52/5'],
  ['Martie 1947', '25/5', 'August 1999', '52/5'],
  ['Aprilie 1947', '25/5', 'Septembrie 1999', '52/5'],
  ['Mai 1947', '25/6', 'Noiembrie 1999', '52/6'],
  ['Iunie 1947', '25/6', 'Decembrie 1999', '52/6'],
  ['Iulie 1947', '25/6', 'Ianuarie 2000', '52/6'],
  ['August 1947', '25/6', 'Februarie 2000', '52/6'],
  ['Septembrie 1947', '25/6', 'Martie 2000', '52/6'],
  ['Octombrie 1947', '25/7', 'Mai 2000', '52/7'],
  ['Noiembrie 1947', '25/7', 'Iunie 2000', '52/7'],
  ['Decembrie 1947', '25/7', 'Iulie 2000', '52/7'],
  ['Ianuarie 1948', '25/8', 'Septembrie 2000', '52/8'],
  ['Februarie 1948', '25/8', 'Octombrie 2000', '52/8'],
  ['Martie 1948', '25/8', 'Noiembrie 2000', '52/8'],
  ['Aprilie 1948', '25/9', 'Ianuarie 2001', '52/9'],
  ['Mai 1948', '25/9', 'Februarie 2001', '52/9'],
  ['Iunie 1948', '25/9', 'Martie 2001', '52/9'],
  ['Iulie 1948', '25/10', 'Mai 2001', '52/10'],
  ['August 1948', '25/10', 'Iunie 2001', '52/10'],
  ['Septembrie 1948', '25/10', 'Iulie 2001', '52/10'],
  ['Octombrie 1948', '25/11', 'Septembrie 2001', '52/11'],
  ['Noiembrie 1948', '25/11', 'Octombrie 2001', '52/11'],
  ['Decembrie 1948', '25/11', 'Noiembrie 2001', '52/11'],
  ['Ianuarie 1949', '26/0', 'Ianuarie 2002', '53/0'],
  ['Februarie 1949', '26/0', 'Februarie 2002', '53/0'],
  ['Martie 1949', '26/0', 'Martie 2002', '53/0'],
  ['Aprilie 1949', '26/2', 'Mai 2002', '53/1'],
  ['Mai 1949', '26/2', 'Iunie 2002', '53/1'],
  ['Iunie 1949', '26/2', 'Iulie 2002', '53/1'],
  ['Iulie 1949', '26/4', 'Septembrie 2002', '53/2'],
  ['August 1949', '26/4', 'Octombrie 2002', '53/2'],
  ['Septembrie 1949', '26/4', 'Noiembrie 2002', '53/2'],
  ['Octombrie 1949', '26/6', 'Ianuarie 2003', '53/3'],
  ['Noiembrie 1949', '26/6', 'Februarie 2003', '53/3'],
  ['Decembrie 1949', '26/6', 'Martie 2003', '53/3'],
  ['Ianuarie 1950', '26/8', 'Mai 2003', '53/4'],
  ['Februarie 1950', '26/8', 'Iunie 2003', '53/4'],
  ['Martie 1950', '26/8', 'Iulie 2003', '53/4'],
  ['Aprilie 1950', '26/10', 'Septembrie 2003', '53/5'],
  ['Mai 1950', '26/10', 'Octombrie 2003', '53/5'],
  ['Iunie 1950', '26/10', 'Noiembrie 2003', '53/5'],
  ['Iulie 1950', '27/0', 'Ianuarie 2004', '53/6'],
  ['August 1950', '27/0', 'Februarie 2004', '53/6'],
  ['Septembrie 1950', '27/0', 'Martie 2004', '53/6'],
  ['Octombrie 1950', '27/2', 'Mai 2004', '53/7'],
  ['Noiembrie 1950', '27/2', 'Iunie 2004', '53/7'],
  ['Decembrie 1950', '27/2', 'Iulie 2004', '53/7'],
  ['Ianuarie 1951', '27/4', 'Septembrie 2004', '53/8'],
  ['Februarie 1951', '27/4', 'Octombrie 2004', '53/8'],
  ['Martie 1951', '27/4', 'Noiembrie 2004', '53/8'],
  ['Aprilie 1951', '27/6', 'Ianuarie 2005', '53/9'],
  ['Mai 1951', '27/6', 'Februarie 2005', '53/9'],
  ['Iunie 1951', '27/6', 'Martie 2005', '53/9'],
  ['Iulie 1951', '27/8', 'Mai 2005', '53/10'],
  ['August 1951', '27/8', 'Iunie 2005', '53/10'],
  ['Septembrie 1951', '27/8', 'Iulie 2005', '53/10'],
  ['Octombrie 1951', '27/10', 'Septembrie 2005', '53/11'],
  ['Noiembrie 1951', '27/10', 'Octombrie 2005', '53/11'],
  ['Decembrie 1951', '27/10', 'Noiembrie 2005', '53/11'],
  ['Ianuarie 1952', '28/0', 'Ianuarie 2006', '54/0'],
  ['Februarie 1952', '28/0', 'Februarie 2006', '54/0'],
  ['Martie 1952', '28/0', 'Martie 2006', '54/0'],
  ['Aprilie 1952', '28/2', 'Mai 2006', '54/1'],
  ['Mai 1952', '28/2', 'Iunie 2006', '54/1'],
  ['Iunie 1952', '28/2', 'Iulie 2006', '54/1'],
  ['Iulie 1952', '28/4', 'Septembrie 2006', '54/2'],
  ['August 1952', '28/4', 'Octombrie 2006', '54/2'],
  ['Septembrie 1952', '28/4', 'Noiembrie 2006', '54/2'],
  ['Octombrie 1952', '28/6', 'Ianuarie 2007', '54/3'],
  ['Noiembrie 1952', '28/6', 'Februarie 2007', '54/3'],
  ['Decembrie 1952', '28/6', 'Martie 2007', '54/3'],
  ['Ianuarie 1953', '28/8', 'Mai 2007', '54/4'],
  ['Februarie 1953', '28/8', 'Iunie 2007', '54/4'],
  ['Martie 1953', '28/8', 'Iulie 2007', '54/4'],
  ['Aprilie 1953', '28/10', 'Septembrie 2007', '54/5'],
  ['Mai 1953', '28/10', 'Octombrie 2007', '54/5'],
  ['Iunie 1953', '28/10', 'Noiembrie 2007', '54/5'],
  ['Iulie 1953', '29/0', 'Ianuarie 2008', '54/6'],
  ['August 1953', '29/0', 'Februarie 2008', '54/6'],
  ['Septembrie 1953', '29/0', 'Martie 2008', '54/6'],
  ['Octombrie 1953', '29/2', 'Mai 2008', '54/7'],
  ['Noiembrie 1953', '29/2', 'Iunie 2008', '54/7'],
  ['Decembrie 1953', '29/2', 'Iulie 2008', '54/7'],
  ['Ianuarie 1954', '29/4', 'Septembrie 2008', '54/8'],
  ['Februarie 1954', '29/4', 'Octombrie 2008', '54/8'],
  ['Martie 1954', '29/4', 'Noiembrie 2008', '54/8'],
  ['Aprilie 1954', '29/6', 'Ianuarie 2009', '54/9'],
  ['Mai 1954', '29/6', 'Februarie 2009', '54/9'],
  ['Iunie 1954', '29/6', 'Martie 2009', '54/9'],
  ['Iulie 1954', '29/8', 'Mai 2009', '54/10'],
  ['August 1954', '29/8', 'Iunie 2009', '54/10'],
  ['Septembrie 1954', '29/8', 'Iulie 2009', '54/10'],
  ['Octombrie 1954', '29/10', 'Septembrie 2009', '54/11'],
  ['Noiembrie 1954', '29/10', 'Octombrie 2009', '54/11'],
  ['Decembrie 1954', '29/10', 'Noiembrie 2009', '54/11'],
  ['Ianuarie 1955', '30/0', 'Ianuarie 2010', '55/0'],
  ['Februarie 1955', '30/0', 'Februarie 2010', '55/0'],
  ['Martie 1955', '30/0', 'Martie 2010', '55/0'],
  ['Aprilie 1955', '30/1', 'Mai 2010', '55/1'],
  ['Mai 1955', '30/1', 'Iunie 2010', '55/1'],
  ['Iunie 1955', '30/1', 'Iulie 2010', '55/1'],
  ['Iulie 1955', '30/2', 'Septembrie 2010', '55/2'],
  ['August 1955', '30/2', 'Octombrie 2010', '55/2'],
  ['Septembrie 1955', '30/2', 'Noiembrie 2010', '55/2'],
  ['Octombrie 1955', '30/3', 'Ianuarie 2011', '55/3'],
  ['Noiembrie 1955', '30/3', 'Februarie 2011', '55/3'],
  ['Decembrie 1955', '30/3', 'Martie 2011', '55/3'],
  ['Ianuarie 1956', '30/4', 'Mai 2011', '55/4'],
  ['Februarie 1956', '30/4', 'Iunie 2011', '55/4'],
  ['Martie 1956', '30/4', 'Iulie 2011', '55/4'],
  ['Aprilie 1956', '30/5', 'Septembrie 2011', '55/5'],
  ['Mai 1956', '30/5', 'Octombrie 2011', '55/5'],
  ['Iunie 1956', '30/5', 'Noiembrie 2011', '55/5'],
  ['Iulie 1956', '30/6', 'Ianuarie 2012', '55/6'],
  ['August 1956', '30/6', 'Februarie 2012', '55/6'],
  ['Septembrie 1956', '30/6', 'Martie 2012', '55/6'],
  ['Octombrie 1956', '30/7', 'Mai 2012', '55/7'],
  ['Noiembrie 1956', '30/7', 'Iunie 2012', '55/7'],
  ['Decembrie 1956', '30/7', 'Iulie 2012', '55/7'],
  ['Ianuarie 1957', '30/8', 'Septembrie 2012', '55/8'],
  ['Februarie 1957', '30/8', 'Octombrie 2012', '55/8'],
  ['Martie 1957', '30/8', 'Noiembrie 2012', '55/8'],
  ['Aprilie 1957', '30/9', 'Ianuarie 2013', '55/9'],
  ['Mai 1957', '30/9', 'Februarie 2013', '55/9'],
  ['Iunie 1957', '30/9', 'Martie 2013', '55/9'],
  ['Iulie 1957', '30/10', 'Mai 2013', '55/10'],
  ['August 1957', '30/10', 'Iunie 2013', '55/10'],
  ['Septembrie 1957', '30/10', 'Iulie 2013', '55/10'],
  ['Octombrie 1957', '30/11', 'Septembrie 2013', '55/11'],
  ['Noiembrie 1957', '30/11', 'Octombrie 2013', '55/11'],
  ['Decembrie 1957', '30/11', 'Noiembrie 2013', '55/11'],
  ['Ianuarie 1958', '31/0', 'Ianuarie 2014', '56/0'],
  ['Februarie 1958', '31/0', 'Februarie 2014', '56/0'],
  ['Martie 1958', '31/0', 'Martie 2014', '56/0'],
  ['Aprilie 1958', '31/1', 'Mai 2014', '56/1'],
  ['Mai 1958', '31/1', 'Iunie 2014', '56/1'],
  ['Iunie 1958', '31/1', 'Iulie 2014', '56/1'],
  ['Iulie 1958', '31/2', 'Septembrie 2014', '56/2'],
  ['August 1958', '31/2', 'Octombrie 2014', '56/2'],
  ['Septembrie 1958', '31/2', 'Noiembrie 2014', '56/2'],
  ['Octombrie 1958', '31/3', 'Ianuarie 2015', '56/3'],
  ['Noiembrie 1958', '31/3', 'Februarie 2015', '56/3'],
  ['Decembrie 1958', '31/3', 'Martie 2015', '56/3'],
  ['Ianuarie 1959', '31/4', 'Mai 2015', '56/4'],
  ['Februarie 1959', '31/4', 'Iunie 2015', '56/4'],
  ['Martie 1959', '31/4', 'Iulie 2015', '56/4'],
  ['Aprilie 1959', '31/5', 'Septembrie 2015', '56/5'],
  ['Mai 1959', '31/5', 'Octombrie 2015', '56/5'],
  ['Iunie 1959', '31/5', 'Noiembrie 2015', '56/5'],
  ['Iulie 1959', '31/6', 'Ianuarie 2016', '56/6'],
  ['August 1959', '31/6', 'Februarie 2016', '56/6'],
  ['Septembrie 1959', '31/6', 'Martie 2016', '56/6'],
  ['Octombrie 1959', '31/7', 'Mai 2016', '56/7'],
  ['Noiembrie 1959', '31/7', 'Iunie 2016', '56/7'],
  ['Decembrie 1959', '31/7', 'Iulie 2016', '56/7'],
  ['Ianuarie 1960', '31/8', 'Septembrie 2016', '56/8'],
  ['Februarie 1960', '31/8', 'Octombrie 2016', '56/8'],
  ['Martie 1960', '31/8', 'Noiembrie 2016', '56/8'],
  ['Aprilie 1960', '31/9', 'Ianuarie 2017', '56/9'],
  ['Mai 1960', '31/9', 'Februarie 2017', '56/9'],
  ['Iunie 1960', '31/9', 'Martie 2017', '56/9'],
  ['Iulie 1960', '31/10', 'Mai 2017', '56/10'],
  ['August 1960', '31/10', 'Iunie 2017', '56/10'],
  ['Septembrie 1960', '31/10', 'Iulie 2017', '56/10'],
  ['Octombrie 1960', '31/11', 'Septembrie 2017', '56/11'],
  ['Noiembrie 1960', '31/11', 'Octombrie 2017', '56/11'],
  ['Decembrie 1960', '31/11', 'Noiembrie 2017', '56/11'],
  ['Ianuarie 1961', '32/0', 'Ianuarie 2018', '57/0'],
  ['Februarie 1961', '32/0', 'Februarie 2018', '57/0'],
  ['Martie 1961', '32/1', 'Martie 2018', '57/0'],
  ['Aprilie 1961', '32/1', 'Aprilie 2018', '57/0'],
  ['Mai 1961', '32/2', 'Mai 2018', '57/0'],
  ['Iunie 1961', '32/2', 'Iulie 2018', '57/1'],
  ['Iulie 1961', '32/3', 'August 2018', '57/1'],
  ['August 1961', '32/3', 'Septembrie 2018', '57/1'],
  ['Septembrie 1961', '32/4', 'Octombrie 2018', '57/1'],
  ['Octombrie 1961', '32/4', 'Noiembrie 2018', '57/1'],
  ['Noiembrie 1961', '32/5', 'Ianuarie 2019', '57/2'],
  ['Decembrie 1961', '32/5', 'Februarie 2019', '57/2'],
  ['Ianuarie 1962', '32/6', 'Martie 2019', '57/2'],
  ['Februarie 1962', '32/6', 'Aprilie 2019', '57/2'],
  ['Martie 1962', '32/7', 'Mai 2019', '57/2'],
  ['Aprilie 1962', '32/7', 'Iulie 2019', '57/3'],
  ['Mai 1962', '32/8', 'August 2019', '57/3'],
  ['Iunie 1962', '32/8', 'Septembrie 2019', '57/3'],
  ['Iulie 1962', '32/9', 'Octombrie 2019', '57/3'],
  ['August 1962', '32/9', 'Noiembrie 2019', '57/3'],
  ['Septembrie 1962', '32/10', 'Ianuarie 2020', '57/4'],
  ['Octombrie 1962', '32/10', 'Februarie 2020', '57/4'],
  ['Noiembrie 1962', '32/11', 'Martie 2020', '57/4'],
  ['Decembrie 1962', '32/11', 'Aprilie 2020', '57/4'],
  ['Ianuarie 1963', '33/0', 'Mai 2020', '57/4'],
  ['Februarie 1963', '33/0', 'Iulie 2020', '57/5'],
  ['Martie 1963', '33/1', 'August 2020', '57/5'],
  ['Aprilie 1963', '33/1', 'Septembrie 2020', '57/5'],
  ['Mai 1963', '33/2', 'Octombrie 2020', '57/5'],
  ['Iunie 1963', '33/2', 'Noiembrie 2020', '57/5'],
  ['Iulie 1963', '33/3', 'Ianuarie 2021', '57/6'],
  ['August 1963', '33/3', 'Februarie 2021', '57/6'],
  ['Septembrie 1963', '33/4', 'Martie 2021', '57/6'],
  ['Octombrie 1963', '33/4', 'Aprilie 2021', '57/6'],
  ['Noiembrie 1963', '33/5', 'Mai 2021', '57/6'],
  ['Decembrie 1963', '33/5', 'Iulie 2021', '57/7'],
  ['Ianuarie 1964', '33/6', 'August 2021', '57/7'],
  ['Februarie 1964', '33/6', 'Septembrie 2021', '57/7'],
  ['Martie 1964', '33/7', 'Octombrie 2021', '57/7'],
  ['Aprilie 1964', '33/7', 'Noiembrie 2021', '57/7'],
  ['Mai 1964', '33/8', 'Ianuarie 2022', '57/8'],
  ['Iunie 1964', '33/8', 'Februarie 2022', '57/8'],
  ['Iulie 1964', '33/9', 'Martie 2022', '57/8'],
  ['August 1964', '33/9', 'Aprilie 2022', '57/8'],
  ['Septembrie 1964', '33/10', 'Mai 2022', '57/8'],
  ['Octombrie 1964', '33/10', 'Iulie 2022', '57/9'],
  ['Noiembrie 1964', '33/11', 'August 2022', '57/9'],
  ['Decembrie 1964', '33/11', 'Septembrie 2022', '57/9'],
  ['Ianuarie 1965', '34/0', 'Octombrie 2022', '57/9'],
  ['Februarie 1965', '34/0', 'Noiembrie 2022', '57/9'],
  ['Martie 1965', '34/1', 'Ianuarie 2023', '57/10'],
  ['Aprilie 1965', '34/1', 'Februarie 2023', '57/10'],
  ['Mai 1965', '34/2', 'Martie 2023', '57/10'],
  ['Iunie 1965', '34/2', 'Aprilie 2023', '57/10'],
  ['Iulie 1965', '34/3', 'Mai 2023', '57/10'],
  ['August 1965', '34/3', 'Iunie 2023', '57/10'],
  ['Septembrie 1965', '34/4', 'Iulie 2023', '57/10'],
  ['Octombrie 1965', '34/4', 'August 2023', '57/10'],
  ['Noiembrie 1965', '34/5', 'Septembrie 2023', '57/10'],
  ['Decembrie 1965', '34/5', 'Octombrie 2023', '57/10'],
  ['Ianuarie 1966', '34/6', 'Noiembrie 2023', '57/10'],
  ['Februarie 1966', '34/6', 'Ianuarie 2024', '57/11'],
  ['Martie 1966', '34/7', 'Februarie 2024', '57/11'],
  ['Aprilie 1966', '34/7', 'Martie 2024', '57/11'],
  ['Mai 1966', '34/8', 'Aprilie 2024', '57/11'],
  ['Iunie 1966', '34/8', 'Mai 2024', '57/11'],
  ['Iulie 1966', '34/9', 'Iunie 2024', '57/11'],
  ['August 1966', '34/9', 'Iulie 2024', '57/11'],
  ['Septembrie 1966', '34/10', 'August 2024', '57/11'],
  ['Octombrie 1966', '34/10', 'Septembrie 2024', '57/11'],
  ['Noiembrie 1966', '34/11', 'Octombrie 2024', '57/11'],
  ['Decembrie 1966', '34/11', 'Noiembrie 2024', '57/11'],
  ['Ianuarie 1967', '35/0', 'Ianuarie 2025', '58/0'],
  ['Februarie 1967', '35/0', 'Februarie 2025', '58/0'],
  ['Martie 1967', '35/0', 'Aprilie 2025', '58/1'],
  ['Aprilie 1967', '35/0', 'Mai 2025', '58/1'],
  ['Mai 1967', '35/0', 'Iulie 2025', '58/2'],
  ['Iunie 1967', '35/0', 'August 2025', '58/2'],
  ['Iulie 1967', '35/0', 'Octombrie 2025', '58/3'],
  ['August 1967', '35/0', 'Noiembrie 2025', '58/3'],
  ['Septembrie 1967', '35/0', 'Ianuarie 2026', '58/4'],
  ['Octombrie 1967', '35/0', 'Februarie 2026', '58/4'],
  ['Noiembrie 1967', '35/0', 'Aprilie 2026', '58/5'],
  ['Decembrie 1967', '35/0', 'Mai 2026', '58/5'],
  ['Ianuarie 1968', '35/0', 'Iulie 2026', '58/6'],
  ['Februarie 1968', '35/0', 'August 2026', '58/6'],
  ['Martie 1968', '35/0', 'Octombrie 2026', '58/7'],
  ['Aprilie 1968', '35/0', 'Noiembrie 2026', '58/7'],
  ['Mai 1968', '35/0', 'Ianuarie 2027', '58/8'],
  ['Iunie 1968', '35/0', 'Februarie 2027', '58/8'],
  ['Iulie 1968', '35/0', 'Aprilie 2027', '58/9'],
  ['August 1968', '35/0', 'Mai 2027', '58/9'],
  ['Septembrie 1968', '35/0', 'Iulie 2027', '58/10'],
  ['Octombrie 1968', '35/0', 'August 2027', '58/10'],
  ['Noiembrie 1968', '35/0', 'Octombrie 2027', '58/11'],
  ['Decembrie 1968', '35/0', 'Noiembrie 2027', '58/11'],
  ['Ianuarie 1969', '35/0', 'Ianuarie 2028', '59'],
  ['Februarie 1969', '35/0', 'Martie 2028', '59/1'],
  ['Martie 1969', '35/0', 'Mai 2028', '59/2'],
  ['Aprilie 1969', '35/0', 'Iulie 2028', '59/3'],
  ['Mai 1969', '35/0', 'Septembrie 2028', '59/4'],
  ['Iunie 1969', '35/0', 'Noiembrie 2028', '59/5'],
  ['Iulie 1969', '35/0', 'Ianuarie 2029', '59/6'],
  ['August 1969', '35/0', 'Martie 2029', '59/7'],
  ['Septembrie 1969', '35/0', 'Mai 2029', '59/8'],
  ['Octombrie 1969', '35/0', 'Iulie 2029', '59/9'],
  ['Noiembrie 1969', '35/0', 'Septembrie 2029', '59/10'],
  ['Decembrie 1969', '35/0', 'Noiembrie 2029', '59/11'],
  ['Ianuarie 1970', '35/0', 'Ianuarie 2030', '60'],
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Pensii"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        {
          href: '/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/',
          label: 'Anii lucrați în străinătate se pun la pensie în România?',
          desc: 'Cum se iau în calcul perioadele lucrate în UE la pensia din România.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este pensia anticipată pentru femei?',
          a: 'Pensia anticipată reprezintă o prestație de asigurări sociale care se poate acorda cu cel mult 5 ani înaintea împlinirii vârstei standard de pensionare, atunci când este realizat stagiul complet de cotizare prevăzut în Anexa 5 la Legea 360/2023.',
        },
        {
          q: 'Care sunt condițiile principale pentru pensia anticipată?',
          a: 'Realizarea stagiului complet de cotizare prevăzut în Anexa 5 și reducerea vârstei standard de pensionare cu maximum 5 ani.',
        },
        {
          q: 'Cum citesc tabelul de pensionare anticipată?',
          a: 'Pentru luna și anul nașterii regăsești pe același rând stagiul complet de cotizare (exprimat în ani/luni), luna și anul în care se poate ieși la pensie anticipată și vârsta asiguratului la ieșirea la pensie (exprimată tot în ani/luni).',
        },
        {
          q: 'Pot beneficia femeile de reduceri suplimentare ale vârstei de pensionare?',
          a: 'Da. Femeile pot primi reduceri suplimentare ale vârstei de pensionare (de la 6 luni până la 3 ani și jumătate) pentru creșterea copiilor, precum și pentru desfășurarea activității în condiții deosebite sau speciale de muncă.',
        },
        {
          q: 'Ce se întâmplă cu pensia anticipată la împlinirea vârstei standard de pensionare?',
          a: 'La împlinirea vârstei standard de pensionare, pensia anticipată se transformă automat în pensie pentru limită de vârstă.',
        },
      ]}
    >
      <p>
        Sistemul public de pensii din România funcționează unitar, iar pentru femeile care doresc să se
        retragă mai devreme din activitate există posibilitatea <strong>pensionării anticipate</strong>.
        Regulile sunt stabilite prin <strong>Legea 360/2023</strong> (aplicabilă de la 1 septembrie 2023),
        care prevede condițiile de acordare și modul de calcul al vârstei de pensionare.
      </p>

      <h2>Ce este pensia anticipată?</h2>
      <p>
        Pensia anticipată reprezintă o prestație de asigurări sociale care se poate acorda cu{' '}
        <strong>cel mult 5 ani înaintea împlinirii vârstei standard de pensionare</strong>, atunci când este
        realizat stagiul complet de cotizare, conform <strong>Anexei 5 la Legea 360/2023</strong>.
      </p>

      <h2>Condițiile principale pentru pensionarea anticipată</h2>
      <ol>
        <li>
          <strong>Realizarea stagiului complet de cotizare</strong> prevăzut în Anexa 5 la Legea 360/2023.
        </li>
        <li>
          <strong>Reducerea vârstei standard de pensionare</strong> cu maximum 5 ani.
        </li>
      </ol>

      <h2>Tabel vârstă pensionare anticipată femei (Anexa 5)</h2>
      <p>
        Tabelul de mai jos arată, pentru fiecare lună și an al nașterii, stagiul complet de cotizare necesar,
        luna și anul în care se poate ieși la pensie anticipată și vârsta asiguratului la ieșirea la pensie.
        Valorile pentru stagiul de cotizare și vârstă sunt exprimate în format <strong>ani/luni</strong>.
      </p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Luna și anul nașterii</th>
              <th>Stagiul complet de cotizare contributiv (ani/luni)</th>
              <th>Luna și anul pensionării anticipate</th>
              <th>Vârsta asiguratului la ieșirea la pensie (ani/luni)</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <tr key={`${row[0]}-${row[2]}`}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Reduceri și beneficii suplimentare</h2>
      <p>
        Pe lângă reducerea generală a vârstei standard de pensionare, femeile pot beneficia de{' '}
        <strong>reduceri suplimentare ale vârstei de pensionare</strong> (de la 6 luni până la 3 ani și
        jumătate) pentru:
      </p>
      <ul>
        <li>nașterea și creșterea copiilor;</li>
        <li>desfășurarea activității în condiții deosebite sau speciale de muncă.</li>
      </ul>

      <h2>Cerințe importante de reținut</h2>
      <ul>
        <li>
          <strong>Stagiul complet de cotizare</strong> trebuie realizat integral (în general 35 de ani).
        </li>
        <li>
          <strong>Nu se poate cumula</strong> pensia anticipată cu alte venituri din pensie în mod necuvenit.
        </li>
        <li>
          La împlinirea vârstei standard de pensionare, pensia anticipată se{' '}
          <strong>transformă automat în pensie pentru limită de vârstă</strong>.
        </li>
      </ul>

      <h2>Ai lucrat și în străinătate?</h2>
      <p>
        Perioadele lucrate în alte state pot conta la stabilirea pensiei din România. Vezi articolul nostru
        despre{' '}
        <Link href="/anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania/">
          cum se iau în calcul anii lucrați în străinătate la pensia din România
        </Link>
        .
      </p>
    </ArticleLayout>
  );
}
