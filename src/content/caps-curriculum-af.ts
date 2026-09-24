/**
 * Afrikaans names for the CAPS topics and sub-topics in caps-curriculum.ts.
 *
 * The abbreviations stay "sin", "cos", "tan": every Afrikaans channel writes
 * cos, and "kos" is Afrikaans for food. "Trig" stays a separate word
 * ("trig verhoudings", "trig grafieke") the way the channels write it.
 *
 * Terminology is taken from how South African Afrikaans maths teachers
 * actually write it, not from a dictionary: 655 video titles from the
 * verified Afrikaans CAPS channels were mined for the standard forms, which
 * is where Sinusreël, Kosinusreël, Oppervlaktereël, Koordevierhoeke,
 * Middelpuntstelling, Eweredigheidstelling, Mond-en-snordiagram, Die
 * telbeginsel, Derdegraadse funksies and Gegroepeerde data come from. Topic
 * names follow the Wiskunde SUM curriculum index (Rye en reekse,
 * Differensiaalrekene, Analitiese meetkunde, Getalpatrone).
 *
 * Keys are the exact English strings in caps-curriculum.ts. All 110
 * sub-topics are distinct, so one map is enough. A missing key falls back to
 * the English, which is the honest failure: an untranslated heading beats a
 * wrong one in a subject where terminology is examined.
 */

/** CAPS topic slug -> Afrikaans topic name. */
export const capsTopicTitlesAf: Record<string, string> = {
  'algebra-gr10': 'Algebra en Vergelykings',
  'number-patterns-gr10': 'Getalpatrone',
  'functions-gr10': 'Funksies en Grafieke',
  'finance-gr10': 'Finansiële Wiskunde',
  'probability-gr10': 'Waarskynlikheid',
  'trig-gr10': 'Trigonometrie',
  'euclidean-geometry-gr10': 'Euklidiese Meetkunde',
  'analytical-geometry-gr10': 'Analitiese Meetkunde',
  'statistics-gr10': 'Statistiek',

  'algebra-gr11': 'Algebra en Vergelykings',
  'number-patterns-gr11': 'Getalpatrone',
  'functions-gr11': 'Funksies en Grafieke',
  'finance-gr11': 'Finansiële Wiskunde',
  'probability-gr11': 'Waarskynlikheid',
  'trig-gr11': 'Trigonometrie',
  'euclidean-geometry-gr11': 'Euklidiese Meetkunde',
  'analytical-geometry-gr11': 'Analitiese Meetkunde',
  'statistics-gr11': 'Statistiek',

  'algebra-gr12': 'Algebra en Vergelykings',
  'sequences-series-gr12': 'Rye en Reekse',
  'functions-gr12': 'Funksies en Grafieke',
  'calculus-gr12': 'Differensiaalrekene',
  'finance-gr12': 'Finansiële Wiskunde',
  'probability-gr12': 'Waarskynlikheid',
  'trig-gr12': 'Trigonometrie',
  'euclidean-geometry-gr12': 'Euklidiese Meetkunde',
  'analytical-geometry-gr12': 'Analitiese Meetkunde',
  'statistics-gr12': 'Statistiek',
}

/** English CAPS sub-topic -> Afrikaans. */
export const capsSubTopicsAf: Record<string, string> = {
  // Grade 10 - Algebra en Vergelykings
  'Exponents and the exponent laws': 'Eksponente en die eksponentwette',
  'Factorisation: trinomials': 'Faktorisering: drieterme',
  'Factorisation: sum and difference of cubes':
    'Faktorisering: som en verskil van derdemagte',
  'Solving linear equations': 'Oplos van lineêre vergelykings',
  'Solving quadratic equations': 'Oplos van kwadratiese vergelykings',
  'Solving simultaneous equations': 'Oplos van gelyktydige vergelykings',
  'Linear inequalities': 'Lineêre ongelykhede',

  // Grade 10 - Getalpatrone
  'Investigating and extending linear (arithmetic) sequences':
    'Ondersoek en uitbreiding van lineêre (rekenkundige) rye',
  'Finding the general formula (n-th term) of a linear sequence':
    'Bepaling van die algemene formule (n-de term) van ’n lineêre ry',

  // Grade 10 - Funksies en Grafieke
  'The linear function y = mx + c': 'Die lineêre funksie y = mx + c',
  'The quadratic function y = ax²': 'Die kwadratiese funksie y = ax²',
  'The hyperbolic function y = a/x': 'Die hiperboliese funksie y = a/x',
  'The exponential function y = ab^x': 'Die eksponensiële funksie y = ab^x',

  // Grade 10 - Finansiële Wiskunde
  'Simple interest': 'Enkelvoudige rente',
  'Compound interest': 'Saamgestelde rente',
  'Simple and compound depreciation': 'Enkelvoudige en saamgestelde waardevermindering',
  'Hire-purchase': 'Huurkoop',
  'Exchange rates': 'Wisselkoerse',

  // Grade 10 - Waarskynlikheid
  'Venn diagrams': 'Venn-diagramme',
  'Theoretical and relative frequency probability':
    'Teoretiese en relatiewe frekwensiewaarskynlikheid',
  'The addition rule (identity rule)': 'Die optelreël (identiteitsreël)',

  // Grade 10 - Trigonometrie
  'Trig ratios in right-angled triangles': 'Trig verhoudings in reghoekige driehoeke',
  'Trig ratios on the Cartesian plane (0° to 360°)':
    'Trig verhoudings op die Cartesiese vlak (0° tot 360°)',
  'Two-dimensional problems (elevation and depression)':
    'Tweedimensionele probleme (elevasie en depressie)',
  'Basic trig graphs: sin, cos, tan': 'Basiese trig grafieke: sin, cos, tan',

  // Grade 10 - Euklidiese Meetkunde
  'Lines, angles and triangles': 'Lyne, hoeke en driehoeke',
  'Properties of quadrilaterals: parallelograms, rectangles, rhombi, kites':
    'Eienskappe van vierhoeke: parallelogramme, reghoeke, ruite, vlieërs',
  'The Midpoint Theorem': 'Die Middelpuntstelling',

  // Grade 10 - Analitiese Meetkunde
  'The distance formula': 'Die afstandsformule',
  'The midpoint formula': 'Die middelpuntformule',
  'Gradient of a line segment': 'Gradiënt van ’n lynsegment',

  // Grade 10 - Statistiek
  'Data collection and organisation': 'Dataversameling en -organisasie',
  'Measures of central tendency: mean, median, mode':
    'Maatstawwe van sentrale neiging: gemiddeld, mediaan, modus',
  'Measures of dispersion: range, quartiles, percentiles':
    'Maatstawwe van spreiding: omvang, kwartiele, persentiele',
  'Box and whisker plots': 'Mond-en-snordiagramme',

  // Grade 11 - Algebra en Vergelykings
  'Surds and fractional exponents': 'Wortelvorme en breukeksponente',
  'Completing the square': 'Voltooiing van die vierkant',
  'The quadratic formula': 'Die kwadratiese formule',
  'Nature of roots (the discriminant)': 'Aard van wortels (die diskriminant)',
  'Quadratic inequalities': 'Kwadratiese ongelykhede',
  'Simultaneous equations: linear and quadratic':
    'Gelyktydige vergelykings: lineêr en kwadraties',

  // Grade 11 - Getalpatrone
  'Quadratic number patterns and the second constant difference':
    'Kwadratiese getalpatrone en die tweede konstante verskil',
  'The general term Tn = an² + bn + c': 'Die algemene term Tn = an² + bn + c',

  // Grade 11 - Funksies en Grafieke
  'The parabola y = a(x - p)² + q': 'Die parabool y = a(x - p)² + q',
  'The hyperbola y = a/(x - p) + q': 'Die hiperbool y = a/(x - p) + q',
  'The exponential graph y = ab^(x - p) + q':
    'Die eksponensiële grafiek y = ab^(x - p) + q',
  'Introduction to inverse functions': 'Inleiding tot inverse funksies',

  // Grade 11 - Finansiële Wiskunde
  'Sinking funds': 'Delgingsfondse',
  'Future value annuities': 'Toekomstige waarde-annuïteite',
  'Present value annuities': 'Huidige waarde-annuïteite',
  'Nominal versus effective interest rates': 'Nominale teenoor effektiewe rentekoerse',

  // Grade 11 - Waarskynlikheid
  'Dependent and independent events': 'Afhanklike en onafhanklike gebeurtenisse',
  'The product rule for independent events':
    'Die produkreël vir onafhanklike gebeurtenisse',
  'Tree diagrams': 'Boomdiagramme',
  'Contingency (two-way) tables': 'Gebeurlikheidstabelle (tweerigtingtabelle)',

  // Grade 11 - Trigonometrie
  'Reduction formulae in the four quadrants': 'Herleidingsformules in die vier kwadrante',
  'Co-functions': 'Kofunksies',
  'Trigonometric identities: tan = sin/cos and sin² + cos² = 1':
    'Trigonometriese identiteite: tan = sin/cos en sin² + cos² = 1',
  'General solutions of trig equations': 'Algemene oplossings van trig vergelykings',
  'The sine rule': 'Die sinusreël',
  'The cosine rule': 'Die kosinusreël',
  'The area rule': 'Die oppervlaktereël',

  // Grade 11 - Euklidiese Meetkunde
  'Circle geometry: chords': 'Sirkelmeetkunde: koorde',
  'Angles at the centre and at the circumference':
    'Hoeke by die middelpunt en by die omtrek',
  'Cyclic quadrilaterals': 'Koordevierhoeke',
  'Tangents to circles': 'Raaklyne aan sirkels',

  // Grade 11 - Analitiese Meetkunde
  'Inclination of a line': 'Hellingshoek van ’n lyn',
  'Parallel and perpendicular lines': 'Ewewydige en loodregte lyne',
  'Solving geometric shapes analytically': 'Analitiese oplossing van meetkundige figure',

  // Grade 11 - Statistiek
  'Grouped data analysis': 'Ontleding van gegroepeerde data',
  'Ogives (cumulative frequency graphs)': 'Ogiewe (kumulatiewe frekwensiegrafieke)',
  'Variance and standard deviation': 'Variansie en standaardafwyking',
  'Symmetric and skewed data': 'Simmetriese en skewe data',

  // Grade 12 - Algebra en Vergelykings
  'Revision of quadratic equations and inequalities':
    'Hersiening van kwadratiese vergelykings en ongelykhede',
  'Advanced simultaneous equations': 'Gevorderde gelyktydige vergelykings',
  'Logarithms applied to exponential equations':
    'Logaritmes toegepas op eksponensiële vergelykings',

  // Grade 12 - Rye en Reekse
  'Arithmetic sequences and series': 'Rekenkundige rye en reekse',
  'Geometric sequences and series': 'Meetkundige rye en reekse',
  'Sigma notation': 'Sigma-notasie',
  'Sum to infinity of a convergent geometric series':
    'Som tot oneindig van ’n konvergente meetkundige reeks',

  // Grade 12 - Funksies en Grafieke
  'Domain and range': 'Definisieversameling en waardeversameling',
  'The formal definition of an inverse function':
    'Die formele definisie van ’n inverse funksie',
  'Restricting the domain of a quadratic to invert it (y = √x)':
    'Beperking van die definisieversameling van ’n kwadratiese funksie om dit om te keer (y = √x)',

  // Grade 12 - Differensiaalrekene
  'The definition of a limit': 'Die definisie van ’n limiet',
  'Differentiation from first principles': 'Differensiasie vanuit eerste beginsels',
  'The rules of differentiation': 'Die reëls van differensiasie',
  'Sketching cubic graphs': 'Skets van derdegraadse grafieke',
  'Optimisation problems': 'Optimeringsprobleme',
  'Rates of change': 'Tempo van verandering',

  // Grade 12 - Finansiële Wiskunde
  'Future value annuity formula': 'Formule vir toekomstige waarde-annuïteite',
  'Present value annuity formula': 'Formule vir huidige waarde-annuïteite',
  'Loan repayments and outstanding balances':
    'Leningterugbetalings en uitstaande balanse',

  // Grade 12 - Waarskynlikheid
  'The fundamental counting principle': 'Die fundamentele telbeginsel',
  'Permutations and factorial notation': 'Permutasies en faktoriaalnotasie',
  'Applying counting principles to probability':
    'Toepassing van telbeginsels op waarskynlikheid',

  // Grade 12 - Trigonometrie
  'Compound angle identities': 'Saamgestelde hoek-identiteite',
  'Double angle identities': 'Dubbelhoek-identiteite',
  'Expansion and simplification of trig expressions':
    'Uitbreiding en vereenvoudiging van trig uitdrukkings',
  'Trigonometry in three-dimensional problems':
    'Trigonometrie in driedimensionele probleme',

  // Grade 12 - Euklidiese Meetkunde
  'Proportionality in triangles': 'Eweredigheid in driehoeke',
  'Similarity of triangles': 'Gelykvormigheid van driehoeke',
  'The Theorem of Pythagoras proved via similarity':
    'Die Stelling van Pythagoras bewys deur gelykvormigheid',

  // Grade 12 - Analitiese Meetkunde
  'The equation of a circle centred at the origin':
    'Die vergelyking van ’n sirkel met die oorsprong as middelpunt',
  'The equation of a circle centred at any point':
    'Die vergelyking van ’n sirkel met enige punt as middelpunt',
  'Tangents to circles analytically': 'Raaklyne aan sirkels analities',
  'Intersecting circles': 'Snydende sirkels',

  // Grade 12 - Statistiek
  'Bivariate data': 'Tweeveranderlike data',
  'Scatter plots and lines of best fit': 'Spreidiagramme en lyne van beste passing',
  'The least-squares regression line y = A + Bx':
    'Die kleinstekwadrate-regressielyn y = A + Bx',
  'The correlation coefficient r': 'Die korrelasiekoëffisiënt r',
}
