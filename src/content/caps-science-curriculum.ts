/**
 * CAPS Physical Sciences curriculum, Grades 10-12.
 *
 * Transcribed from docs/curriculum/CAPS-FET-Physical-Sciences-Gr10-12.pdf,
 * the official DBE Curriculum and Assessment Policy Statement (170 pages).
 * Section 2.4 gives the six knowledge areas and Section 3 the examinable
 * content per grade and term; this file follows Section 3, with Section 2.4
 * as the skeleton.
 *
 * Physical Sciences is written as TWO papers, and the split is by subject
 * rather than by topic order:
 *   paper 1 - Physics:   Mechanics, Waves Sound & Light, Electricity &
 *                        Magnetism, and in Grade 12 Optical Phenomena
 *   paper 2 - Chemistry: Matter & Materials, Chemical Change, Chemical
 *                        Systems, and in Grade 12 Organic Chemistry
 *
 * Grade 12 is the exception to the six-area shape: the document splits
 * Matter & Materials' weighting into "11.5 Chem & 3.75 Phys", so optical
 * phenomena (photo-electric effect, spectra) is a physics topic and organic
 * chemistry a chemistry one.
 *
 * As with the maths curriculum, `subTopics` is the unit of video curation:
 * one curated video per sub-topic, so a student stuck on Snell's Law lands
 * on that heading rather than scrubbing an hour of optics.
 */
import type { CapsGrade, CapsPaper } from './caps-curriculum'

export interface CapsScienceTopic {
  /** Registry slug - existing or intended. */
  slug: string
  title: string
  grade: CapsGrade
  paper: CapsPaper
  /** Percentage of the year's teaching time, from CAPS section 2.6. */
  weight: number
  subTopics: string[]
}

export const capsScienceCurriculum: CapsScienceTopic[] = [
  // ---------------------------------------------------------------- Grade 10
  {
    slug: 'mechanics-gr10',
    title: 'Mechanics',
    grade: 10,
    paper: 1,
    weight: 18.75,
    subTopics: [
      'Vectors and scalars',
      'Frame of reference, position, distance and displacement',
      'Average speed and average velocity',
      'Acceleration',
      'Instantaneous velocity and instantaneous speed',
      'Position, velocity and acceleration graphs',
      'The equations of motion for uniformly accelerated motion',
      'Gravitational potential energy and kinetic energy',
      'Conservation of mechanical energy',
    ],
  },
  {
    slug: 'waves-sound-light-gr10',
    title: 'Waves, Sound & Light',
    grade: 10,
    paper: 1,
    weight: 10.0,
    subTopics: [
      'Transverse pulses on a string or spring',
      'Superposition of pulses: constructive and destructive interference',
      'Transverse waves: wavelength, frequency, period and wave speed',
      'Longitudinal waves: compressions and rarefactions',
      'Sound waves and the speed of sound in different media',
      'Pitch, loudness and quality of sound',
      'Ultrasound and its medical uses',
      'Electromagnetic radiation and the electromagnetic spectrum',
      'The energy of a photon',
    ],
  },
  {
    slug: 'electricity-magnetism-gr10',
    title: 'Electricity & Magnetism',
    grade: 10,
    paper: 1,
    weight: 8.75,
    subTopics: [
      'Magnetic fields and magnetic field lines of permanent magnets',
      "The Earth's magnetic field and the compass",
      'Two kinds of charge, charging by contact and polarisation',
      'Conservation and quantisation of charge',
      'Potential difference, emf and terminal potential difference',
      'Current, and measuring current and voltage in a circuit',
      'Resistance and the factors that affect it',
      'Resistors in series',
      'Resistors in parallel',
    ],
  },
  {
    slug: 'matter-materials-gr10',
    title: 'Matter & Materials',
    grade: 10,
    paper: 2,
    weight: 17.5,
    subTopics: [
      'Classification of matter: mixtures, pure substances, metals and non-metals',
      'Names and formulae of compounds',
      'States of matter and the kinetic molecular theory',
      'Models of the atom and the structure of the atom',
      'Isotopes and relative atomic mass',
      'Electron configuration of atoms',
      'The periodic table: groups, periods and periodic trends',
      'Chemical bonding: covalent, ionic and metallic',
      'Particles substances are made of: molecular, ionic and metallic structures',
    ],
  },
  {
    slug: 'chemical-change-gr10',
    title: 'Chemical Change',
    grade: 10,
    paper: 2,
    weight: 15.0,
    subTopics: [
      'Physical and chemical change',
      'Balancing chemical equations',
      'Ions in aqueous solution: dissolving, hydration and conductivity',
      'Precipitation reactions and testing for anions',
      'Reaction types: ion exchange, gas forming, acid-base and redox',
      "The mole concept and Avogadro's number",
      'Molar mass and percentage composition',
      'Empirical formula',
      'Concentration of solutions and the molar volume of gases',
      'Basic stoichiometric calculations',
    ],
  },
  {
    slug: 'chemical-systems-gr10',
    title: 'Chemical Systems',
    grade: 10,
    paper: 2,
    weight: 5.0,
    subTopics: [
      "The hydrosphere: where the Earth's water is found",
      'Interaction of the hydrosphere with the atmosphere, lithosphere and biosphere',
      'Water quality and the purification of water',
      'The impact of dams on people and ecology',
    ],
  },

  // ---------------------------------------------------------------- Grade 11
  {
    slug: 'mechanics-gr11',
    title: 'Mechanics',
    grade: 11,
    paper: 1,
    weight: 16.87,
    subTopics: [
      'Resultant of perpendicular vectors',
      'Resolving a vector into its horizontal and vertical components',
      'Different kinds of forces: weight, normal force, tension and applied force',
      'Static and kinetic frictional force',
      'Force diagrams and free body diagrams',
      "Newton's first and second laws",
      "Newton's third law and action-reaction pairs",
      "Applying Newton's laws: inclined planes, lifts and two-body systems",
      "Newton's law of universal gravitation, mass and weight",
    ],
  },
  {
    slug: 'waves-sound-light-gr11',
    title: 'Waves, Sound & Light',
    grade: 11,
    paper: 1,
    weight: 8.13,
    subTopics: [
      'Refraction and refractive index',
      "Snell's Law",
      'Critical angle and total internal reflection',
      "Wavefronts and Huygens' principle",
      'Diffraction through a single slit',
    ],
  },
  {
    slug: 'electricity-magnetism-gr11',
    title: 'Electricity & Magnetism',
    grade: 11,
    paper: 1,
    weight: 12.5,
    subTopics: [
      "Coulomb's Law",
      'Electric fields and electric field lines',
      'Calculating the electric field at a point',
      'Magnetic field associated with current-carrying wires, loops and solenoids',
      "Faraday's Law of electromagnetic induction",
      "Ohm's Law and ohmic versus non-ohmic conductors",
      'Power in electric circuits',
      'Electrical energy and the cost of electricity',
    ],
  },
  {
    slug: 'matter-materials-gr11',
    title: 'Matter & Materials',
    grade: 11,
    paper: 2,
    weight: 15.0,
    subTopics: [
      'The chemical bond and Lewis diagrams',
      'Molecular shape and VSEPR theory',
      'Electronegativity and bond polarity',
      'Bond energy and bond length',
      'Types of intermolecular forces',
      'Intermolecular forces, physical state, density, melting and boiling points',
      'The chemistry of water and its three phases',
      'Kinetic theory of gases: temperature, pressure and ideal gas behaviour',
      'The gas laws and the ideal gas equation',
    ],
  },
  {
    slug: 'chemical-change-gr11',
    title: 'Chemical Change',
    grade: 11,
    paper: 2,
    weight: 17.5,
    subTopics: [
      'Molar volume of gases and concentration of solutions',
      'Stoichiometric calculations: limiting reagents and percentage yield',
      'Empirical formula, molecular formula and percentage purity',
      'Volume relationships in gaseous reactions',
      'Exothermic and endothermic reactions and bond energy',
      'Activation energy and the activated complex',
      'Acids and bases: Arrhenius and Brønsted-Lowry definitions',
      'Acid-base reactions and the formation of salts',
      'Oxidation numbers and redox reactions',
    ],
  },
  {
    slug: 'chemical-systems-gr11',
    title: 'Chemical Systems',
    grade: 11,
    paper: 2,
    weight: 5.0,
    subTopics: [
      'The lithosphere as a source of materials: abundance, distribution and ores',
      'Mining and mineral processing in South Africa',
      'The recovery of gold: from ore to metal',
      'Environmental impact of mining and mineral recovery',
      'Burning of fossil fuels and global warming',
    ],
  },

  // ---------------------------------------------------------------- Grade 12
  {
    slug: 'mechanics-gr12',
    title: 'Mechanics',
    grade: 12,
    paper: 1,
    weight: 17.5,
    subTopics: [
      'Momentum and its vector nature',
      "Newton's second law in terms of momentum",
      'Conservation of momentum',
      'Elastic and inelastic collisions',
      'Impulse and the impulse-momentum theorem',
      'Vertical projectile motion: equations of motion',
      'Graphs of vertical projectile motion (x-t, v-t and a-t)',
      'Work done by a force',
      'The work-energy theorem',
      'Conservation of energy with non-conservative forces present',
      'Power',
    ],
  },
  {
    slug: 'waves-sound-light-gr12',
    title: 'Waves, Sound & Light',
    grade: 12,
    paper: 1,
    weight: 3.75,
    subTopics: [
      'The Doppler effect for sound',
      'Doppler effect calculations for a moving source or moving listener',
      'Applications of the Doppler effect with ultrasound in medicine',
      'The Doppler effect with light: red shifts and the expanding universe',
    ],
  },
  {
    slug: 'electricity-magnetism-gr12',
    title: 'Electricity & Magnetism',
    grade: 12,
    paper: 1,
    weight: 7.5,
    subTopics: [
      'Series and parallel resistor networks',
      'Internal resistance and emf of a battery',
      'Circuit calculations with internal resistance and series-parallel networks',
      'AC and DC generators',
      'Electric motors',
      'Alternating current: current and voltage graphs',
      'rms values and average power in AC circuits',
    ],
  },
  {
    slug: 'optical-phenomena-gr12',
    title: 'Optical Phenomena and Properties of Materials',
    grade: 12,
    paper: 1,
    weight: 3.75,
    subTopics: [
      'The photo-electric effect',
      'Work function, cut-off frequency and the photo-electric equation',
      'Intensity, frequency and the number of electrons ejected',
      'Atomic emission spectra and electron transitions',
      'Emission versus absorption spectra',
    ],
  },
  {
    slug: 'organic-chemistry-gr12',
    title: 'Organic Chemistry',
    grade: 12,
    paper: 2,
    weight: 11.5,
    subTopics: [
      'Organic molecules: functional groups, saturated and unsaturated structures',
      'Structural isomers: chain, positional and functional',
      'IUPAC naming and formulae of organic compounds',
      'Physical properties and intermolecular forces of organic compounds',
      'Combustion of alkanes and the preparation of esters',
      'Addition reactions of alkenes',
      'Elimination reactions and cracking',
      'Substitution reactions of alkanes, alcohols and haloalkanes',
      'Addition and condensation polymerisation: plastics and polymers',
    ],
  },
  {
    slug: 'chemical-change-gr12',
    title: 'Chemical Change',
    grade: 12,
    paper: 2,
    weight: 17.5,
    subTopics: [
      'Reaction rate and the factors that affect it',
      'Collision theory, activation energy and catalysts',
      'Chemical equilibrium and reversible reactions',
      'The equilibrium constant Kc and equilibrium calculations',
      "Le Chatelier's principle",
      'Acid-base reactions, models and conjugate acid-base pairs',
      'Strong and weak, concentrated and dilute acids and bases',
      'The pH scale, Kw and salt hydrolysis',
      'Acid-base titrations, indicators and titration calculations',
      'Oxidation numbers and redox half-reactions',
      'Galvanic cells and standard electrode potentials',
      'Electrolytic cells and industrial applications of electrolysis',
    ],
  },
  {
    slug: 'chemical-systems-gr12',
    title: 'Chemical Systems',
    grade: 12,
    paper: 2,
    weight: 3.5,
    subTopics: [
      'Plant nutrients and why fertilizers are needed',
      'The function of nitrogen, phosphorus and potassium in plants',
      'The Haber process: manufacturing ammonia',
      'The Ostwald process: manufacturing nitric acid',
      'The contact process: manufacturing sulfuric acid',
      'Manufacturing fertilizers: ammonium nitrate, ammonium sulfate and superphosphates',
      'Eutrophication and evaluating the use of inorganic fertilizers',
    ],
  },
]

/** Every science sub-topic, paired with the topic it belongs to. */
export function allScienceSubTopics(): { topic: CapsScienceTopic; subTopic: string }[] {
  return capsScienceCurriculum.flatMap((topic) =>
    topic.subTopics.map((subTopic) => ({ topic, subTopic }))
  )
}

export function scienceTopicsForGrade(grade: CapsGrade): CapsScienceTopic[] {
  return capsScienceCurriculum.filter((topic) => topic.grade === grade)
}
