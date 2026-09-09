// Lexicon RO pentru tipare de scriitura formulaica / AI-like.
// Aplicat IDENTIC pe ambele site-uri. Fiecare grup = lista de regex (flag gi).
export const GROUPS = {
  promo: [
    /\besen[țt]ial(ă|e|ul|a)?\b/gi, /\bcrucial(ă|e|ul)?\b/gi, /\bvital(ă|e|ul)?\b/gi,
    /\bindispensabil(ă|e|ul)?\b/gi, /\bdeosebit de\b/gi, /\bextrem de\b/gi,
    /\bjoac[ăa] un rol\b/gi, /\breprezint[ăa] un (pas|element|aspect|factor|document|instrument)\b/gi,
    /\bo gam[ăa] larg[ăa]\b/gi, /\bsolu[țt]i[ea] ideal[ăa]\b/gi, /\bperfect pentru\b/gi,
    /\bmodern(ă|e|ul)? [șs]i eficient/gi, /\brapid [șs]i (simplu|sigur|eficient|u[șs]or)/gi,
    /\bfoarte important(ă|e)?\b/gi, /\bde o importan[țt][ăa]\b/gi,
  ],
  hedging: [
    /\beste important (s[ăa]|ca)\b/gi, /\beste recomandat\b/gi, /\bse recomand[ăa]\b/gi,
    /\beste indicat\b/gi, /\bar putea\b/gi, /\bpoate varia\b/gi, /\bpot varia\b/gi,
    /\b[îi]n general\b/gi, /\bde obicei\b/gi, /\b[îi]n majoritatea cazurilor\b/gi,
    /\b[îi]n multe cazuri\b/gi, /\bdepinde de\b/gi, /\btrebuie s[ăa] [țt]ii cont\b/gi,
    /\bde re[țt]inut\b/gi,
  ],
  falseRanges: [
    /\b\d+\s*[-–—]\s*\d+\s*(zile|ore|luni|ani|s[ăa]pt[ăa]m[âa]ni|minute)\b/gi,
  ],
  filler: [
    /\b[îi]n lumea (de azi|modern)/gi, /\b[îi]n ziua de (azi|ast[ăa]zi)\b/gi,
    /\b[îi]n era digital[ăa]\b/gi, /\bîntr-o lume\b/gi, /\bat[uâ]nci c[âa]nd vine vorba\b/gi,
    /\bmerit[ăa] men[țt]ionat\b/gi, /\bdemn de (remarcat|men[țt]ionat)\b/gi,
    /\b[îi]n concluzie\b/gi, /\b[îi]n cele din urm[ăa]\b/gi, /\bpe scurt\b/gi,
    /\bnu (este|e) doar\b/gi, /\bnu doar c[ăa]\b/gi, /\bci [șs]i\b/gi,
  ],
  copulaVerbs: [
    /\breprezint[ăa]\b/gi, /\bconstituie\b/gi, /\bimplic[ăa] (un|o|mai)/gi,
  ],
  gerunds: [
    /\basigur[âa]nd\b/gi, /\bofer[iî]nd\b/gi, /\breflect[âa]nd\b/gi, /\bsubliniind\b/gi,
    /\beviden[țt]iind\b/gi, /\bcontribuind\b/gi, /\bpermi[țt][âa]nd\b/gi,
    /\bfacilit[âa]nd\b/gi, /\breprezent[âa]nd\b/gi, /\bdemonstr[âa]nd\b/gi,
    /\bgarant[âa]nd\b/gi, /\bevit[âa]nd astfel\b/gi,
  ],
  dashes: [ /[—–]/g ],
};
export function scoreText(text){
  const res = {}; let total = 0;
  for (const [g, regs] of Object.entries(GROUPS)) {
    let c = 0;
    for (const r of regs) c += (text.match(r) || []).length;
    res[g] = c; total += c;
  }
  res._total = total;
  return res;
}
// tipar structural: liste cu <strong>Termen:</strong>
export function boldTermLists(html){
  return (html.match(/<strong[^>]*>[^<]{2,60}:\s*<\/strong>/gi) || []).length;
}
