import type { ExamItem } from './types'

/**
 * DBE Graad 11 Wiskunde Vraestel 1 Eksemplaar, 2013 (Afrikaans).
 *
 * Transcribed from the rendered pages because the PDF text layer scrambles
 * the mathematics. Everything stays in Afrikaans, including the
 * memorandum's own mark descriptors - an Afrikaans learner sits an
 * Afrikaans paper, and "vervanging" is the examiner's word, not a
 * translation of "substitution".
 *
 * Two quirks of the printed paper are kept rather than tidied away: the last
 * sub-part of VRAAG 9 is numbered 9.7 in the question paper and 9.6 in the
 * memo (the paper skips 9.6), and the memo's tick for 4.3 prints 0,07/12
 * where its own working uses 0,075/12.
 */
export const gr11P1Eksemplaar2013: ExamItem[] = [
  {
    id: "gr11-p1-2013-1.1.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.1.1",
    context:
      "Los op vir $x$:",
    prompt: "$(2x-1)(x+5)=0$",
    marks: 2,
    topicSlug: "algebra-gr11",
    solution: [
      "$x=\\frac{1}{2}$  OF  $x=-5$",
    ],
    markScheme: [
      { descriptor: "antwoorde", kind: 'answer', value: 1 },
      { descriptor: "antwoorde", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die hakies eers uit te vermenigvuldig, of om $2x-1=0$ as $x=1$ op te los. Die faktore is reeds gegee; $2x=1$ gee $x=\\frac{1}{2}$.",
  },
  {
    id: "gr11-p1-2013-1.1.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.1.2",
    context:
      "Los op vir $x$:",
    prompt: "$2x^2-4x+1=0$ (Laat jou antwoord in vereenvoudigde wortelvorm.)",
    marks: 3,
    topicSlug: "algebra-gr11",
    solution: [
      "$x=\\frac{-(-4)\\pm\\sqrt{(-4)^2-4(2)(1)}}{2(2)}$",
      "$x=\\frac{4\\pm2\\sqrt{2}}{4}$",
      "$x=\\frac{2\\pm\\sqrt{2}}{2}$",
    ],
    markScheme: [
      { descriptor: "vervanging in die korrekte formule", kind: 'method', value: 1 },
      { descriptor: "antwoorde", kind: 'answer', value: 1 },
      { descriptor: "antwoorde", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $\\frac{4\\pm2\\sqrt{2}}{4}$ te kanselleer tot $1\\pm2\\sqrt{2}$ deur net die 4 in die teller weg te deel. Slegs 'n gemene faktor van die HELE teller mag gedeel word.",
  },
  {
    id: "gr11-p1-2013-1.2.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.2.1",
    context:
      "Vereenvoudig die volgende uitdrukkings volledig, sonder die gebruik van 'n sakrekenaar:",
    prompt: "$125^{\\frac{2}{3}}$",
    marks: 2,
    topicSlug: "algebra-gr11",
    solution: [
      "$=\\left(5^3\\right)^{\\frac{2}{3}}$",
      "$=5^2=25$",
    ],
    markScheme: [
      { descriptor: "$5^3$", kind: 'method', value: 1 },
      { descriptor: "antwoord (aanvaar 25 of $5^2$)", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $125$ met $\\frac{2}{3}$ te vermenigvuldig, of om net die derdemagswortel te neem en die kwadraat te vergeet.",
  },
  {
    id: "gr11-p1-2013-1.2.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.2.2",
    context:
      "Vereenvoudig die volgende uitdrukkings volledig, sonder die gebruik van 'n sakrekenaar:",
    prompt: "$(3\\sqrt{2}-12)(2\\sqrt{2}+1)$",
    marks: 3,
    topicSlug: "algebra-gr11",
    solution: [
      "$=6.2+3\\sqrt{2}-24\\sqrt{2}-12$",
      "$=-21\\sqrt{2}$",
    ],
    markScheme: [
      { descriptor: "$6.2+3\\sqrt{2}$", kind: 'method', value: 1 },
      { descriptor: "$-24\\sqrt{2}-12$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $3\\sqrt{2}\\times2\\sqrt{2}$ as $6\\sqrt{2}$ te skryf in plaas van $12$, sodat die konstantes nie uitkanselleer nie.",
  },
  {
    id: "gr11-p1-2013-1.3.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.3.1",
    context:
      "Gegee: $\\frac{x^2-x-6}{3x-9}$",
    prompt: "Vir watter waarde(s) van $x$ sal die uitdrukking ongedefinieerd wees?",
    marks: 2,
    topicSlug: "algebra-gr11",
    solution: [
      "$3x-9=0$",
      "$x=3$",
    ],
    markScheme: [
      { descriptor: "$3x-9=0$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die TELLER gelyk aan nul te stel. 'n Breuk is ongedefinieerd waar die NOEMER nul is.",
  },
  {
    id: "gr11-p1-2013-1.3.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "1.3.2",
    context:
      "Gegee: $\\frac{x^2-x-6}{3x-9}$",
    prompt: "Vereenvoudig die uitdrukking volledig.",
    marks: 3,
    topicSlug: "algebra-gr11",
    solution: [
      "$=\\frac{(x-3)(x-2)}{3(x-3)}$",
      "$=\\frac{x-2}{3}$",
    ],
    markScheme: [
      { descriptor: "$(x-3)(x-2)$", kind: 'method', value: 1 },
      { descriptor: "$3(x-3)$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om terme te kanselleer voordat gefaktoriseer is. Kansellasie mag slegs met FAKTORE gebeur, nie met terme nie.",
  },
  {
    id: "gr11-p1-2013-2.1.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "2.1.1",
    context:
      "Gegee: $(x+2)(x-3)<-3x+2$",
    prompt: "Los op vir $x$ as: $(x+2)(x-3)<-3x+2$",
    marks: 4,
    topicSlug: "algebra-gr11",
    solution: [
      "$x^2+2x-8<0$",
      "$(x+4)(x-2)<0$",
      "$-4<x<2$",
    ],
    markScheme: [
      { descriptor: "standaardvorm", kind: 'method', value: 1 },
      { descriptor: "faktore", kind: 'method', value: 1 },
      { descriptor: "$-4<x$", kind: 'answer', value: 1 },
      { descriptor: "$x<2$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die kritieke waardes reg te kry maar dan $x<-4$ of $x>2$ te skryf. Omdat die uitdrukking KLEINER as nul is, lê die oplossing TUSSEN die wortels.",
  },
  {
    id: "gr11-p1-2013-2.1.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "2.1.2",
    context:
      "Gegee: $(x+2)(x-3)<-3x+2$",
    prompt: "Vervolgens of andersins, bepaal die som van al die heelgetalle wat $x^2+2x-8<0$ sal bevredig.",
    marks: 3,
    topicSlug: "algebra-gr11",
    solution: [
      "$-4<x<2$",
      "Som $=(-3)+(-2)+(-1)+0+1$",
      "$=-5$",
    ],
    markScheme: [
      { descriptor: "$-4<x<2$", kind: 'method', value: 1 },
      { descriptor: "$-3,\\,-2,\\,-1,\\,0,\\,1$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $-4$ en $2$ in te sluit - die ongelykheid is streng - of om $0$ uit te laat omdat dit niks bydra nie.",
  },
  {
    id: "gr11-p1-2013-2.2.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "2.2.1",
    context:
      "Gegee: $\\frac{4^{x-1}+4^{x+1}}{17.12^x}$",
    prompt: "Vereenvoudig die uitdrukking volledig.",
    marks: 4,
    topicSlug: "algebra-gr11",
    solution: [
      "$=\\frac{4^x\\left(4^{-1}+4\\right)}{17.3^x.4^x}$",
      "$=\\frac{\\frac{17}{4}}{17.3^x}$",
      "$=\\frac{1}{4.3^x}$",
    ],
    markScheme: [
      { descriptor: "faktoriseer noemer", kind: 'method', value: 1 },
      { descriptor: "$3^x.4^x$", kind: 'method', value: 1 },
      { descriptor: "vereenvoudiging van noemer na $\\frac{17}{4}$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $4^{x-1}+4^{x+1}$ as $4^{2x}$ te hanteer, of om nie $12^x$ as $3^x.4^x$ te skryf nie sodat die $4^x$ nooit kanselleer nie.",
  },
  {
    id: "gr11-p1-2013-2.2.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "2.2.2",
    context:
      "Gegee: $\\frac{4^{x-1}+4^{x+1}}{17.12^x}$",
    prompt: "Indien $3^{-x}=4t$, druk die uitdrukking in terme van $t$ uit.",
    marks: 1,
    topicSlug: "algebra-gr11",
    solution: [
      "$=\\frac{1}{4}.3^{-x}=\\frac{1}{4}.4t=t$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om van voor af te begin in plaas daarvan om 2.2.1 se antwoord te gebruik, of om $4t$ te gee sonder om met $\\frac{1}{4}$ te vermenigvuldig.",
  },
  {
    id: "gr11-p1-2013-2.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "2.3",
    context:
      "Gegee: $3^y=81^x$ en $y=x^2-6x+9$",
    prompt: "Los op vir $x$ en $y$: $3^y=81^x$ en $y=x^2-6x+9$",
    marks: 7,
    topicSlug: "algebra-gr11",
    solution: [
      "$3^y=3^{4x}$, dus $y=4x$",
      "$4x=x^2-6x+9$",
      "$0=(x-9)(x-1)$",
      "$x=9$ of $1$",
      "$(x;y)=(9\\,;\\,36)$ of $(1\\,;\\,4)$",
    ],
    markScheme: [
      { descriptor: "$3^y=3^{4x}$", kind: 'method', value: 1 },
      { descriptor: "$y=4x$", kind: 'method', value: 1 },
      { descriptor: "$4x=x^2-6x+9$", kind: 'method', value: 1 },
      { descriptor: "standaardvorm", kind: 'method', value: 1 },
      { descriptor: "faktore", kind: 'method', value: 1 },
      { descriptor: "$x$-waardes", kind: 'answer', value: 1 },
      { descriptor: "$y$-waardes", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $81^x$ as $3^4$ te skryf in plaas van $3^{4x}$, of om die $y$-waardes te vergeet. Die vyf metodepunte bly beskikbaar.",
  },
  {
    id: "gr11-p1-2013-3.1.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "3.1.1",
    context:
      "Die oplossing van 'n kwadratiese vergelyking is $x=\\frac{3\\pm\\sqrt{4-8p}}{4}$ waar $p\\in\\mathbf{Q}$. Bepaal die waarde(s) van $p$ sodat:",
    prompt: "Die vergelyking gelyke wortels het",
    marks: 2,
    topicSlug: "algebra-gr11",
    solution: [
      "$4-8p=0$",
      "$p=\\frac{1}{2}$",
    ],
    markScheme: [
      { descriptor: "$4-8p=0$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die diskriminant van voor af te bereken in plaas van te sien dat $4-8p$ reeds onder die wortelteken staan.",
  },
  {
    id: "gr11-p1-2013-3.1.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "3.1.2",
    context:
      "Die oplossing van 'n kwadratiese vergelyking is $x=\\frac{3\\pm\\sqrt{4-8p}}{4}$ waar $p\\in\\mathbf{Q}$. Bepaal die waarde(s) van $p$ sodat:",
    prompt: "Die vergelyking nie-reële wortels het",
    marks: 2,
    topicSlug: "algebra-gr11",
    solution: [
      "$4-8p<0$",
      "$p>\\frac{1}{2}$",
    ],
    markScheme: [
      { descriptor: "$4-8p<0$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om te vergeet dat die ongelykheidsteken omdraai wanneer deur $-8$ gedeel word. Die opstel verdien steeds die metodepunt.",
  },
  {
    id: "gr11-p1-2013-3.2.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "3.2.1",
    context:
      "Gegee: $\\sqrt{5-x}=x+1$",
    prompt: "Sonder om die vergelyking op te los, toon aan dat die oplossing in die interval $-1\\le x\\le5$ sal wees.",
    marks: 3,
    topicSlug: "algebra-gr11",
    solution: [
      "$5-x\\ge0$ en $x+1\\ge0$",
      "$x\\le5$ en $x\\ge-1$",
      "Vervolgens $-1\\le x\\le5$",
    ],
    markScheme: [
      { descriptor: "$5-x\\ge0$", kind: 'reason', value: 1 },
      { descriptor: "$x+1\\ge0$", kind: 'reason', value: 1 },
      { descriptor: "en", kind: 'reason', value: 1 },
    ],
    commonError:
      "Om net $5-x\\ge0$ te oorweeg en te vergeet dat die REGTERkant ook nie-negatief moet wees - 'n wortel lewer nooit 'n negatiewe waarde nie.",
  },
  {
    id: "gr11-p1-2013-3.2.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "3.2.2",
    context:
      "Gegee: $\\sqrt{5-x}=x+1$",
    prompt: "Los die vergelyking op.",
    marks: 5,
    topicSlug: "algebra-gr11",
    solution: [
      "$5-x=x^2+2x+1$",
      "$x^2+3x-4=0$",
      "$(x+4)(x-1)=0$",
      "$x=-4$ of $x=1$",
      "Siende dat $-1\\le x\\le5$, slegs $x=1$",
    ],
    markScheme: [
      { descriptor: "kwadreer beide kante", kind: 'method', value: 1 },
      { descriptor: "standaardvorm", kind: 'method', value: 1 },
      { descriptor: "faktore", kind: 'method', value: 1 },
      { descriptor: "antwoorde", kind: 'answer', value: 1 },
      { descriptor: "keuse van 1", kind: 'reason', value: 1 },
    ],
    commonError:
      "Om $(x+1)^2$ as $x^2+1$ te kwadreer, of om albei wortels te hou. Kwadrering skep 'n vreemde wortel, en $x=-4$ val buite die interval.",
  },
  {
    id: "gr11-p1-2013-3.2.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "3.2.3",
    context:
      "Gegee: $\\sqrt{5-x}=x+1$",
    prompt: "Sonder enige verdere bewerkings, los die vergelyking $-\\sqrt{5-x}=x+1$ op.",
    marks: 1,
    topicSlug: "algebra-gr11",
    solution: [
      "$x=-4$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om weer van voor af te kwadreer. Die minusteken maak die regterkant nie-positief, dus geld juis die wortel wat in 3.2.2 verwerp is.",
  },
  {
    id: "gr11-p1-2013-4.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "4.1",
    prompt: "Melissa het haar eerste kar vir R145 000 gekoop. Die waarde verminder volgens die reguitlynmetode teen 17% per jaar. Bereken die waarde 5 jaar later.",
    marks: 2,
    topicSlug: "finance-gr11",
    solution: [
      "$A = P(1 - in) = 145\\,000[1 - (0,17)(5)]$",
      "$= \\text{R}\\,21\\,750$",
    ],
    markScheme: [
      { descriptor: "vervanging", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die saamgestelde formule $A = P(1-i)^n$ te gebruik in plaas van die reguitlynmetode. Die vervangingspunt bly verdienbaar.",
  },
  {
    id: "gr11-p1-2013-4.2.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "4.2.1",
    context:
      "'n Belegging verdien rente teen 'n rentekoers van 8% per jaar, kwartaalliks saamgestel.",
    prompt: "Teen watter koers word rente elke kwartaal van die jaar verdien?",
    marks: 1,
    topicSlug: "finance-gr11",
    solution: [
      "$\\frac{8\\%}{4} = 2\\%$ per kwartaal",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om deur 12 (maande) in plaas van 4 (kwartale) te deel.",
  },
  {
    id: "gr11-p1-2013-4.2.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "4.2.2",
    context:
      "'n Belegging verdien rente teen 'n rentekoers van 8% per jaar, kwartaalliks saamgestel.",
    prompt: "Bereken die effektiewe jaarlikse rentekoers op hierdie belegging.",
    marks: 2,
    topicSlug: "finance-gr11",
    solution: [
      "$1 + i_{eff} = (1 + 0,02)^4$",
      "$i_{eff} = 8,24\\%$ p.j.",
    ],
    markScheme: [
      { descriptor: "$1+i_{eff}=(1+0,02)^4$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $(1+0,08)^4$ te gebruik. Die nominale koers word eers deur 4 gedeel; die antwoord moet net-net bo 8% lê.",
  },
  {
    id: "gr11-p1-2013-4.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "4.3",
    context:
      "R14 000 word belê teen 9% per jaar halfjaarliks saamgestel vir die eerste 18 maande, daarna 7,5% per jaar maandeliks saamgestel.",
    prompt: "Hoeveel geld sal daar presies 5 jaar na die oorspronklike belegging wees?",
    marks: 5,
    topicSlug: "finance-gr11",
    solution: [
      "$A = 14\\,000\\left(1 + \\frac{0,09}{2}\\right)^{3}\\left(1 + \\frac{0,075}{12}\\right)^{42}$",
      "$= \\text{R}\\,20\\,755,08$",
    ],
    markScheme: [
      { descriptor: "$\\frac{0,09}{2}$", kind: 'method', value: 1 },
      { descriptor: "$14\\,000\\left(1+\\frac{0,09}{2}\\right)^{3}$", kind: 'method', value: 1 },
      { descriptor: "$\\frac{0,07}{12}$", kind: 'method', value: 1 },
      { descriptor: "$42$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die periodes verkeerd te tel: 18 maande halfjaarliks is 3 periodes, en die oorblywende 42 maande is die maandelikse eksponent.",
  },
  {
    id: "gr11-p1-2013-5.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "5.1",
    context:
      "Die grafieke vertoon die groei van twee beleggings, een van Dumisani en een van Astin. Albei verdien slegs jaarliks rente. Die waarde (in duisende rande) word teen tyd (in jaar) gestip, met $\\text{A}(6\\,;\\,31)$ op Dumisani se grafiek en $\\text{B}(12\\,;\\,w)$ waar die grafieke sny.",
    prompt: "Wat is die waarde van beide oorspronklike beleggings?",
    marks: 1,
    topicSlug: "finance-gr11",
    diagram: "/exam/gr11-p1-2013/v5.png",
    solution: [
      "$\\text{R}\\,15\\,000$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om R15 te skryf en die byskrif in duisende rande op die vertikale as te ignoreer.",
  },
  {
    id: "gr11-p1-2013-5.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "5.2",
    context:
      "Die grafieke vertoon die groei van twee beleggings, een van Dumisani en een van Astin. Albei verdien slegs jaarliks rente. Die waarde (in duisende rande) word teen tyd (in jaar) gestip, met $\\text{A}(6\\,;\\,31)$ op Dumisani se grafiek en $\\text{B}(12\\,;\\,w)$ waar die grafieke sny.",
    prompt: "Verdien Dumisani se belegging enkelvoudige of saamgestelde rente?",
    marks: 1,
    topicSlug: "finance-gr11",
    diagram: "/exam/gr11-p1-2013/v5.png",
    solution: [
      "Enkelvoudige rente",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om te aanvaar dat enige stygende beleggingsgrafiek saamgesteld is. Dumisani se grafiek is 'n reguitlyn.",
  },
  {
    id: "gr11-p1-2013-5.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "5.3",
    context:
      "Die grafieke vertoon die groei van twee beleggings, een van Dumisani en een van Astin. Albei verdien slegs jaarliks rente. Die waarde (in duisende rande) word teen tyd (in jaar) gestip, met $\\text{A}(6\\,;\\,31)$ op Dumisani se grafiek en $\\text{B}(12\\,;\\,w)$ waar die grafieke sny.",
    prompt: "Bepaal Dumisani se rentekoers.",
    marks: 2,
    topicSlug: "finance-gr11",
    diagram: "/exam/gr11-p1-2013/v5.png",
    solution: [
      "$31 = 15(1 + 6i)$",
      "$i = \\frac{8}{45} = 17,78\\%$",
    ],
    markScheme: [
      { descriptor: "vervanging van (6 ; 31) in die korrekte formule", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $A = P(1+i)^n$ te gebruik terwyl 5.2 reeds enkelvoudige rente vasgestel het.",
  },
  {
    id: "gr11-p1-2013-5.4",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "5.4",
    context:
      "Die grafieke vertoon die groei van twee beleggings, een van Dumisani en een van Astin. Albei verdien slegs jaarliks rente. Die waarde (in duisende rande) word teen tyd (in jaar) gestip, met $\\text{A}(6\\,;\\,31)$ op Dumisani se grafiek en $\\text{B}(12\\,;\\,w)$ waar die grafieke sny.",
    prompt: "Vervolgens of andersins, bereken die rentekoers op Astin se belegging, korrek tot EEN desimale plek.",
    marks: 4,
    topicSlug: "finance-gr11",
    diagram: "/exam/gr11-p1-2013/v5.png",
    solution: [
      "$w = 15(1 + 0,1778 \\times 12) = 47$",
      "$47 = 15(1 + i)^{12}$",
      "$i = \\sqrt[12]{\\frac{47}{15}} - 1 = 9,99\\%$",
    ],
    markScheme: [
      { descriptor: "$w = 47$", kind: 'answer', value: 1 },
      { descriptor: "vervang (12 ; $w$)", kind: 'method', value: 1 },
      { descriptor: "$\\sqrt[12]{\\frac{47}{15}}$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om te vergeet dat $w$ eers op Dumisani se reguitlyn bereken moet word. Die $w = 47$ punt bly verdienbaar.",
  },
  {
    id: "gr11-p1-2013-6.1.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.1.1",
    context:
      "Gegee: $\\frac{1}{2}\\,;\\,\\frac{1}{4}\\,;\\,\\frac{1}{8}\\,;\\,\\dots\\,;\\,\\frac{1}{1\\,024}$",
    prompt: "Verduidelik hoe jy die $4^{de}$ term van die ry sal bepaal.",
    marks: 2,
    topicSlug: "number-patterns-gr11",
    solution: [
      "Vermenigvuldig $\\frac{1}{8}$ met $\\frac{1}{2}$",
    ],
    markScheme: [
      { descriptor: "vermenigvuldig $\\frac{1}{8}$", kind: 'reason', value: 1 },
      { descriptor: "$\\frac{1}{2}$", kind: 'reason', value: 1 },
    ],
    commonError:
      "Om na eerste verskille te soek. Hierdie ry is meetkundig - elke term word met $\\frac{1}{2}$ vermenigvuldig.",
  },
  {
    id: "gr11-p1-2013-6.1.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.1.2",
    context:
      "Gegee: $\\frac{1}{2}\\,;\\,\\frac{1}{4}\\,;\\,\\frac{1}{8}\\,;\\,\\dots\\,;\\,\\frac{1}{1\\,024}$",
    prompt: "Skryf 'n formule vir die $n^{de}$ term van die ry neer.",
    marks: 2,
    topicSlug: "number-patterns-gr11",
    solution: [
      "$T_n = \\frac{1}{2}\\left(\\frac{1}{2}\\right)^{n-1}$",
    ],
    markScheme: [
      { descriptor: "$a = \\frac{1}{2}$", kind: 'method', value: 1 },
      { descriptor: "$\\left(\\frac{1}{2}\\right)^{n-1}$", kind: 'method', value: 1 },
    ],
    commonError:
      "Om 'n ekstra faktor in te sluit, wat $\\frac{1}{4}$ vir $n=1$ lewer. Toets die formule altyd teen die eerste term.",
  },
  {
    id: "gr11-p1-2013-6.1.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.1.3",
    context:
      "Gegee: $\\frac{1}{2}\\,;\\,\\frac{1}{4}\\,;\\,\\frac{1}{8}\\,;\\,\\dots\\,;\\,\\frac{1}{1\\,024}$",
    prompt: "Bepaal die getal terme in die ry.",
    marks: 2,
    topicSlug: "number-patterns-gr11",
    solution: [
      "Brei die patroon uit tot $\\frac{1}{1024}$",
      "vervolgens $n = 10$",
    ],
    markScheme: [
      { descriptor: "uitbreiding van die ry", kind: 'method', value: 1 },
      { descriptor: "$n = 10$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $1\\,024 = 2^{10}$ te herken maar dan $n = 11$ te skryf. Met $T_n = 2^{-n}$ gee $2^{-n}=2^{-10}$ direk $n=10$.",
  },
  {
    id: "gr11-p1-2013-6.2.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.2.1",
    context:
      "Gegee die lineêre patroon: $156\\,;\\,148\\,;\\,140\\,;\\,132\\,;\\,\\dots$",
    prompt: "Skryf die $5^{de}$ term van hierdie getalpatroon neer.",
    marks: 1,
    topicSlug: "number-patterns-gr11",
    solution: [
      "$124$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om 8 by te tel in plaas van af te trek.",
  },
  {
    id: "gr11-p1-2013-6.2.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.2.2",
    context:
      "Gegee die lineêre patroon: $156\\,;\\,148\\,;\\,140\\,;\\,132\\,;\\,\\dots$",
    prompt: "Bepaal 'n algemene formule vir die $n^{de}$ term van hierdie patroon.",
    marks: 2,
    topicSlug: "number-patterns-gr11",
    solution: [
      "$T_n = -8n + 164$",
    ],
    markScheme: [
      { descriptor: "$-8n$", kind: 'method', value: 1 },
      { descriptor: "$+164$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $T_n = -8n + 156$ te skryf deur die eerste term as konstante te gebruik. Die konstante is $a-d=164$.",
  },
  {
    id: "gr11-p1-2013-6.2.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.2.3",
    context:
      "Gegee die lineêre patroon: $156\\,;\\,148\\,;\\,140\\,;\\,132\\,;\\,\\dots$",
    prompt: "Watter term van hierdie lineêre getalpatroon is die eerste negatiewe term?",
    marks: 3,
    topicSlug: "number-patterns-gr11",
    solution: [
      "$-8n + 164 < 0$",
      "$20,5 < n$",
      "$T_{21}$ is die eerste negatiewe term.",
    ],
    markScheme: [
      { descriptor: "$-8n + 164 < 0$", kind: 'method', value: 1 },
      { descriptor: "$20,5 < n$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die ongelykheidsteken nie om te keer nie, of om $20,5$ af te rond na $T_{20}$, wat nog $+4$ is.",
  },
  {
    id: "gr11-p1-2013-6.2.4",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "6.2.4",
    context:
      "Gegee die lineêre patroon: $156\\,;\\,148\\,;\\,140\\,;\\,132\\,;\\,\\dots$",
    prompt: "Die lineêre patroon vorm die eerste verskille van 'n kwadratiese patroon $T_n = an^2 + bn + c$ waar $T_5 = -24$. Bepaal 'n algemene formule vir $T_n$.",
    marks: 5,
    topicSlug: "number-patterns-gr11",
    solution: [
      "$2a = -8$, dus $a = -4$",
      "$3a + b = 156$, dus $b = 168$",
      "$c = -764$",
      "$T_n = -4n^2 + 168n - 764$",
    ],
    markScheme: [
      { descriptor: "$a = -4$", kind: 'answer', value: 1 },
      { descriptor: "vervanging", kind: 'method', value: 1 },
      { descriptor: "$b = 168$", kind: 'answer', value: 1 },
      { descriptor: "vervanging", kind: 'method', value: 1 },
      { descriptor: "$c = -764$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $2a = -8$ met $a = -8$ te verwar, of om $3a+b$ aan die tweede verskil gelyk te stel in plaas van aan 156.",
  },
  {
    id: "gr11-p1-2013-7",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "7",
    context:
      "'n Kwadratiese patroon $T_n = an^2 + bn + c$ het $T_2 = T_4 = 0$ en 'n tweede verskil van 12.",
    prompt: "Bepaal die waarde van die $3^{de}$ term van die patroon.",
    marks: 6,
    topicSlug: "number-patterns-gr11",
    solution: [
      "Stel $T_3 = x$; die verskille rondom $T_3$ is $x$ en $-x$",
      "Die tweede verskil is 12, dus $-x = x + 12$",
      "$x = -6$",
    ],
    markScheme: [
      { descriptor: "gebruik van veranderlikes", kind: 'method', value: 1 },
      { descriptor: "$T_3 = x$", kind: 'method', value: 1 },
      { descriptor: "$y = -x$", kind: 'method', value: 1 },
      { descriptor: "$y = x + 12$", kind: 'method', value: 1 },
      { descriptor: "$-x = x + 12$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om te aanvaar dat $T_3 = 0$ omdat dit tussen twee nulle lê. Die verskille verskil met 12, wat $T_3 = -6$ afdwing.",
  },
  {
    id: "gr11-p1-2013-8.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.1",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C.",
    prompt: "Skryf die vergelykings van die asimptote van $f$ neer.",
    marks: 2,
    topicSlug: "functions-gr11",
    solution: [
      "$x=3$",
      "$y=-1$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die tekens om te ruil en $x=-3$ te skryf, of om die $-1$ te ignoreer en $y=0$ te gee.",
  },
  {
    id: "gr11-p1-2013-8.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.2",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C.",
    prompt: "Skryf die definisieversameling van $f$ neer.",
    marks: 2,
    topicSlug: "functions-gr11",
    solution: [
      "$x \\in R\\,;\\, x \\ne 3$",
    ],
    markScheme: [
      { descriptor: "$R$", kind: 'answer', value: 1 },
      { descriptor: "$x \\ne 3$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die definisieversameling met die waardeversameling te verwar en $y \\ne -1$ te skryf. Die uitgeslote waarde kom van die noemer.",
  },
  {
    id: "gr11-p1-2013-8.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.3",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C.",
    prompt: "Bepaal die waardes van $d$ en $e$, korrek tot die naaste heelgetal, as $g$ 'n hoek van $76°$ met die $x$-as maak.",
    marks: 3,
    topicSlug: "functions-gr11",
    solution: [
      "$d=\\tan 76° = 4$",
      "$6=4(3)+e$, dus $e=-6$",
      "$g(x)=4x-6$",
    ],
    markScheme: [
      { descriptor: "$d=\\tan 76°$", kind: 'method', value: 1 },
      { descriptor: "$d=4$", kind: 'answer', value: 1 },
      { descriptor: "$e=-6$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $76$ self as die gradiënt te gebruik, of $\\sin 76°$ in plaas van $\\tan 76°$. B lê op $g$, nie op $f$ nie.",
  },
  {
    id: "gr11-p1-2013-8.4",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.4",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C. Uit 8.3 is $g(x)=4x-6$.",
    prompt: "Bepaal die koördinate van A en C.",
    marks: 6,
    topicSlug: "functions-gr11",
    diagram: "/exam/gr11-p1-2013/v8.png",
    solution: [
      "$\\frac{2}{x-3}-1=4x-6$",
      "$0=4x^2-17x+13$",
      "$0=(4x-13)(x-1)$",
      "$x=\\frac{13}{4}$ of $x=1$",
      "$\\text{A}(1\\,;\\,-2)$ en $\\text{C}\\left(\\frac{13}{4}\\,;\\,7\\right)$",
    ],
    markScheme: [
      { descriptor: "stel gelyk", kind: 'method', value: 1 },
      { descriptor: "vereenvoudiging", kind: 'method', value: 1 },
      { descriptor: "standaardvorm", kind: 'method', value: 1 },
      { descriptor: "faktore", kind: 'method', value: 1 },
      { descriptor: "$x$-waardes", kind: 'answer', value: 1 },
      { descriptor: "y-waardes", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om met $(x-3)$ te vermenigvuldig sonder om die $-1$ eers oor te bring. Uit die skets is A die laer linkersnypunt.",
  },
  {
    id: "gr11-p1-2013-8.5",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.5",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C. Uit 8.4 is $\\text{A}(1\\,;\\,-2)$ en $\\text{C}\\left(\\frac{13}{4}\\,;\\,7\\right)$.",
    prompt: "Vir watter waardes van $x$ is $g(x) \\ge f(x)$?",
    marks: 3,
    topicSlug: "functions-gr11",
    diagram: "/exam/gr11-p1-2013/v8.png",
    solution: [
      "$1 \\le x < 3$ of $x \\ge \\frac{13}{4}$",
    ],
    markScheme: [
      { descriptor: "$1 \\le x$", kind: 'answer', value: 1 },
      { descriptor: "$x < 3$", kind: 'answer', value: 1 },
      { descriptor: "$x \\ge \\frac{13}{4}$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om net $1 \\le x \\le \\frac{13}{4}$ te skryf asof dit een interval is. Die asimptoot by $x=3$ breek die oplossing in twee.",
  },
  {
    id: "gr11-p1-2013-8.6",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "8.6",
    context:
      "Die skets stel die grafieke van $f(x)=\\frac{2}{x-3}-1$ en $g(x)=dx+e$ voor. Punt $\\text{B}(3\\,;\\,6)$ lê op $g$, en die grafieke sny by A en C.",
    prompt: "Bepaal 'n vergelyking vir die simmetrie-as van $f$ wat 'n positiewe gradiënt het.",
    marks: 3,
    topicSlug: "functions-gr11",
    solution: [
      "$y=(x-3)-1$",
      "$y=x-4$",
    ],
    markScheme: [
      { descriptor: "$x-3$", kind: 'method', value: 1 },
      { descriptor: "$-1$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die as met negatiewe gradiënt, $y=-x+2$, te gee. Die as gaan deur $(3\\,;\\,-1)$.",
  },
  {
    id: "gr11-p1-2013-9.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.1",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Skets die grafieke van $f$ en $g$ op dieselfde assestelsel.",
    marks: 9,
    topicSlug: "functions-gr11",
    requiresDrawing: true,
    solution: [
      "$f$: $x$-afsnitte $x=3$ en $x=-1$; $y$-afsnit $3$; draaipunt $(1\\,;\\,4)$",
      "$g$: $x$-afsnit $x=0$; $y$-afsnit $0$; asimptoot $y=1$",
    ],
    markScheme: [
      { descriptor: "$f$: vorm", kind: 'method', value: 1 },
      { descriptor: "$f$: $x$-afsnit", kind: 'answer', value: 1 },
      { descriptor: "$f$: $y$-afsnit", kind: 'answer', value: 1 },
      { descriptor: "$f$: draaipunt", kind: 'answer', value: 2 },
      { descriptor: "$g$: vorm", kind: 'method', value: 1 },
      { descriptor: "$g$: $x$-afsnit", kind: 'answer', value: 1 },
      { descriptor: "$g$: $y$-afsnit", kind: 'answer', value: 1 },
      { descriptor: "$g$: asimptote", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $g$ as 'n stygende eksponensiële kurwe te teken. Omdat $g(x)=1-2^x$ is dit 'n dalende kurwe onderkant die asimptoot $y=1$.",
  },
  {
    id: "gr11-p1-2013-9.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.2",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Bepaal die gemiddelde gradiënt van $f$ tussen $x=-3$ en $x=0$.",
    marks: 3,
    topicSlug: "functions-gr11",
    solution: [
      "$=\\frac{f(0)-f(-3)}{0-(-3)}$",
      "$=\\frac{3-(-12)}{3}$",
      "$=5$",
    ],
    markScheme: [
      { descriptor: "korrekte formule", kind: 'method', value: 1 },
      { descriptor: "$f(-3)=-12$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $f(-3)$ as $6$ te bereken deur die minusteken voor $x^2$ weg te laat; $-(-3)^2=-9$, dus $f(-3)=-12$.",
  },
  {
    id: "gr11-p1-2013-9.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.3",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Vir watter waarde(s) van $x$ is $f(x).g(x) \\ge 0$?",
    marks: 3,
    topicSlug: "functions-gr11",
    solution: [
      "$-1 \\le x \\le 0$ of $x \\ge 3$",
    ],
    markScheme: [
      { descriptor: "$-1 < x$", kind: 'answer', value: 1 },
      { descriptor: "$x < 0$", kind: 'answer', value: 1 },
      { descriptor: "$x > 3$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om net die deel te gee waar albei funksies positief is en die tak $x \\ge 3$ te mis waar albei negatief is - twee negatiewes gee ook 'n positiewe produk.",
  },
  {
    id: "gr11-p1-2013-9.4",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.4",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Bepaal die waarde van $c$ sodat die $x$-as 'n raaklyn aan $h$ is, waar $h(x)=f(x)+c$.",
    marks: 2,
    topicSlug: "functions-gr11",
    solution: [
      "$-c=f(1)=4$",
      "$c=-4$",
    ],
    markScheme: [
      { descriptor: "$-c=f(1)$", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om $c=4$ te antwoord deur die teken te verloor. Die draaipunt lê 4 eenhede bo die $x$-as.",
  },
  {
    id: "gr11-p1-2013-9.5",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.5",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Bepaal die $y$-afsnit van $t$ indien $t(x)=-g(x)+1$",
    marks: 2,
    topicSlug: "functions-gr11",
    solution: [
      "$(0\\,;\\,1)$",
    ],
    markScheme: [
      { descriptor: "$(0\\,;\\,1)$", kind: 'answer', value: 2 },
    ],
    commonError:
      "Om $-g(x)$ as $1+2^x$ te skryf deur net die eerste term se teken te verander. Korrek is $t(x)=2^x$.",
  },
  {
    id: "gr11-p1-2013-9.7",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "9.7",
    context:
      "Gegee: $f(x)=-x^2+2x+3$ en $g(x)=1-2^x$",
    prompt: "Die grafiek van $k$ is 'n refleksie van $g$ om die $y$-as. Skryf die vergelyking van $k$ neer.",
    marks: 1,
    topicSlug: "functions-gr11",
    solution: [
      "$k(x)=1-2^{-x}$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die refleksie om die $x$-as te doen. 'n Refleksie om die $y$-as vervang net $x$ deur $-x$.",
  },
  {
    id: "gr11-p1-2013-10",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "10",
    context:
      "Gegee: die waardeversameling van $f$ is $(-\\infty;7]$; $a \\ne 0$; $b < 0$; een wortel is positief en die ander negatief.",
    prompt: "Skets die grafiek van $f(x) = ax^2 + bx + c$ gegee hierdie voorwaardes.",
    marks: 4,
    topicSlug: "functions-gr11",
    requiresDrawing: true,
    solution: [
      "Waardeversameling $(-\\infty;7]$ gee 'n maksimum, dus $a<0$ en die vorm is $\\cap$",
      "$b<0$ gee 'n simmetrie-as links van die $y$-as",
      "Wortels met teenoorgestelde tekens gee $x$-afsnitte aan weerskante van die $y$-as",
    ],
    markScheme: [
      { descriptor: "vorm", kind: 'answer', value: 1 },
      { descriptor: "draaipunt by $y = 7$", kind: 'answer', value: 1 },
      { descriptor: "simmetrie-as aan die linkerkant van die $y$-as", kind: 'answer', value: 1 },
      { descriptor: "wortels aan teenoorgestelde kante", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die draaipunt op die $y$-as te plaas en so $b<0$ te ignoreer. By $a<0$ en $b<0$ is $x=-\\frac{b}{2a}$ negatief. Die ander drie merke bly haalbaar.",
  },
  {
    id: "gr11-p1-2013-11.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "11.1",
    context:
      "Gegee: $P(W) = 0,4$; $P(T) = 0,35$; $P(T \\text{ en } W) = 0,14$",
    prompt: "Is die gebeurtenisse $W$ en $T$ onderling uitsluitend? Gee redes vir jou antwoord.",
    marks: 2,
    topicSlug: "probability-gr11",
    solution: [
      "Nee, $W$ en $T$ is nie onderling uitsluitend nie",
      "omdat $P(W \\text{ en } T) \\ne 0$",
    ],
    markScheme: [
      { descriptor: "nie onderling uitsluitend", kind: 'answer', value: 1 },
      { descriptor: "P(W and T) $\\ne 0$", kind: 'reason', value: 1 },
    ],
    commonError:
      "Om onderling uitsluitend met onafhanklik te verwar. Onderling uitsluitend vra of $P(W \\text{ en } T)=0$, en hier is dit $0,14$.",
  },
  {
    id: "gr11-p1-2013-11.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "11.2",
    context:
      "Gegee: $P(W) = 0,4$; $P(T) = 0,35$; $P(T \\text{ en } W) = 0,14$",
    prompt: "Is die gebeurtenisse $W$ en $T$ onafhanklik? Gee redes vir jou antwoord.",
    marks: 3,
    topicSlug: "probability-gr11",
    solution: [
      "$P(W) \\times P(T) = 0,4 \\times 0,35 = 0,14$",
      "$P(W \\text{ en } T) = 0,14$",
      "Dus ja, hulle is onafhanklik",
    ],
    markScheme: [
      { descriptor: "P(W)$\\times$P(T) = 0,14", kind: 'method', value: 1 },
      { descriptor: "P(W en T) = P(W)$\\times$P(T)", kind: 'method', value: 1 },
      { descriptor: "veronderstelling (ja)", kind: 'reason', value: 1 },
    ],
    commonError:
      "Om te redeneer dat gebeurtenisse wat oorvleuel nie onafhanklik kan wees nie. Die toets is $P(W \\text{ en } T) = P(W)\\times P(T)$.",
  },
  {
    id: "gr11-p1-2013-12.1.1",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "12.1.1",
    context:
      "'n Opname is onder 33 leerders gedoen: 2 speel tennis, hokkie en netbal; 5 speel hokkie en netbal; 7 speel hokkie en tennis; 6 speel tennis en netbal; altesaam 18 speel hokkie; altesaam 12 speel tennis; 4 speel SLEGS netbal.",
    prompt: "Gebruik die inligting om die waardes van $a$, $b$, $c$, $d$ en $e$ in die Venn-diagram te bepaal.",
    marks: 5,
    topicSlug: "probability-gr11",
    diagram: "/exam/gr11-p1-2013/v12.png",
    solution: [
      "$a = 5$",
      "$b = 4$",
      "$c = 8$",
      "$d = 1$",
      "$e = 6$",
    ],
    markScheme: [
      { descriptor: "$a = 5$", kind: 'answer', value: 1 },
      { descriptor: "$b = 4$", kind: 'answer', value: 1 },
      { descriptor: "$c = 8$", kind: 'answer', value: 1 },
      { descriptor: "$d = 1$", kind: 'answer', value: 1 },
      { descriptor: "$e = 6$", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die gegewe pare direk in die deursnee te skryf sonder om eers die 2 af te trek wat al drie speel. Werk van die middel na buite.",
  },
  {
    id: "gr11-p1-2013-12.1.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "12.1.2",
    context:
      "'n Opname is onder 33 leerders gedoen: 2 speel tennis, hokkie en netbal; 5 speel hokkie en netbal; 7 speel hokkie en tennis; 6 speel tennis en netbal; altesaam 18 speel hokkie; altesaam 12 speel tennis; 4 speel SLEGS netbal.",
    prompt: "Hoeveel van hierdie leerders speel geeneen van die sportsoorte nie?",
    marks: 1,
    topicSlug: "probability-gr11",
    solution: [
      "$6$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om 33 min die drie totale te bereken sonder om vir oorvleueling te korrigeer. Trek die som van al sewe streke af.",
  },
  {
    id: "gr11-p1-2013-12.1.3",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "12.1.3",
    context:
      "'n Opname is onder 33 leerders gedoen: 2 speel tennis, hokkie en netbal; 5 speel hokkie en netbal; 7 speel hokkie en tennis; 6 speel tennis en netbal; altesaam 18 speel hokkie; altesaam 12 speel tennis; 4 speel SLEGS netbal.",
    prompt: "Skryf die waarskynlikheid neer dat 'n leerder wat ewekansig gekies word, SLEGS netbal speel.",
    marks: 1,
    topicSlug: "probability-gr11",
    solution: [
      "$\\frac{4}{33}$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die totale aantal netbalspelers te gebruik. Die woord SLEGS beperk die telling tot die 4 in die netbal-sirkel alleen.",
  },
  {
    id: "gr11-p1-2013-12.1.4",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "12.1.4",
    context:
      "'n Opname is onder 33 leerders gedoen: 2 speel tennis, hokkie en netbal; 5 speel hokkie en netbal; 7 speel hokkie en tennis; 6 speel tennis en netbal; altesaam 18 speel hokkie; altesaam 12 speel tennis; 4 speel SLEGS netbal.",
    prompt: "Bepaal die waarskynlikheid dat 'n leerder wat ewekansig gekies word, hokkie of netbal speel.",
    marks: 1,
    topicSlug: "probability-gr11",
    solution: [
      "$\\frac{26}{33}$",
    ],
    markScheme: [
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die twee totale bloot op te tel en so die leerders wat albei speel dubbel te tel.",
  },
  {
    id: "gr11-p1-2013-12.2",
    paper: 'P1',
    grade: 11,
    year: 2013,
    source: 'DBE Graad 11 Eksemplaar 2013',
    language: 'af',
    question: "12.2",
    context:
      "Elke leerder kies Wiskunde of Wiskundige Geletterdheid. 60% is dogters. Die waarskynlikheid dat 'n dogter Wiskundige Geletterdheid neem is 55%; vir 'n seun is dit 65%.",
    prompt: "Bepaal die waarskynlikheid dat 'n leerder wat ewekansig gekies word, Wiskunde neem.",
    marks: 6,
    topicSlug: "probability-gr11",
    solution: [
      "$P(\\text{dogter})=0,6$ en $P(\\text{seun})=0,4$",
      "Dogter: $P(\\text{Wisk})=0,45$; Seun: $P(\\text{Wisk})=0,35$",
      "$P(\\text{Wisk}) = (0,6)(0,45) + (0,4)(0,35)$",
      "$= 0,41$",
    ],
    markScheme: [
      { descriptor: "$0,4$", kind: 'method', value: 1 },
      { descriptor: "$0,45$", kind: 'method', value: 1 },
      { descriptor: "$0,35$", kind: 'method', value: 1 },
      { descriptor: "P(D en W) = 0,27", kind: 'method', value: 1 },
      { descriptor: "P(S en W) = 0,14", kind: 'method', value: 1 },
      { descriptor: "antwoord", kind: 'answer', value: 1 },
    ],
    commonError:
      "Om die 55% en 65% direk as die Wiskunde-waarskynlikhede te gebruik - dit is die Wiskundige Geletterdheid-takke.",
  },
]

export default gr11P1Eksemplaar2013
