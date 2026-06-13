export const getChapterTopics = (subject: string, chapter: string): string[] => {
    const topicsMap: Record<string, Record<string, string[]>> = {
        'NEET Physics Class': {
            // Class 11 Physics
            'Units and Measurements': [
                'Significant Figures',
                'Errors in Measurement',
                'Measuring Instruments'
            ],
            'Mathematical Tools': [
                'Binomial Expression and Approximation',
                'Functions & Graphs',
                'Logarithms',
                'Differentiation and Integration'
            ],
            'Motion in a Straight Line': [
                'Frame of Reference',
                'Motion under Gravity (Free Fall Motion)',
                'Graph of 1D Motion',
                'Variable Acceleration'
            ],
            'Motion in a Plane': [
                'Vector Addition',
                'Resolution of Vectors',
                'Vector Projection',
                'Projectile Motion',
                'Relative Motion',
                'Circular Motion'
            ],
            'Newton\'s Laws of Motion': [
                'Newton\'s First Law of Motion',
                'Linear Momentum',
                'Free Body Diagram',
                'Working with Newton\'s Second Law',
                'Calculation of Acceleration',
                'Frame of Reference',
                'Rocket Propulsion',
                'Types of Friction',
                'Graph between Applied Force and Force of Friction',
                'Angle of Friction and Angle of Repose',
                'Acceleration of Body on Rough Surface',
                'Dynamics of Circular Motion'
            ],
            'Work, Energy & Power': [
                'Work',
                'Work Energy Theorem',
                'Conservative and Non-Conservative Force',
                'Potential Energy',
                'Equilibrium',
                'Law of Conservation of Energy',
                'Power',
                'Vertical Circular Motion'
            ],
            'Centre of Mass & System of Particles': [
                'Centre of Mass',
                'Head-on Collision',
                'Oblique Collision'
            ],
            'Rotational Motion': [
                'Moment of Inertia',
                'Theorems of Moment of Inertia',
                'Radius of Gyration',
                'Angular Momentum',
                'Rolling Motion',
                'Rolling Motion on Inclined Plane'
            ],
            'Gravitation': [
                'Law of Gravitation',
                'Acceleration due to Gravity',
                'Gravitational Potential Energy',
                'Gravitational Potential',
                'Relation between Field and Potential',
                'Escape Velocity',
                'Satellite Motion',
                'Kepler\'s Laws of Planetary Motion',
                'Weightlessness'
            ],
            'Mechanical Properties of Solids': [
                'Hooke\'s Law',
                'Modulus of Elasticity',
                'Young\'s Modulus'
            ],
            'Mechanical Properties of Fluids': [
                'Pressure',
                'Buoyancy',
                'Buoyant Force',
                'Equation of Continuity',
                'Bernoulli\'s Theorem',
                'Viscosity',
                'Surface Tension'
            ],
            'Thermal Properties of Matter': [
                'Thermal Expansion',
                'Application of Thermal Expansion',
                'Specific Heat Capacity',
                'Latent Heat',
                'Calorimetry',
                'Conduction',
                'Radiation'
            ],
            'Kinetic Theory of Gases': [
                'Ideal Gases',
                'Kinetic Theory of Gases',
                'Different Speeds of Gas Molecules',
                'Maxwell\'s Law',
                'Degree of Freedom',
                'Law of Equipartition of Energy'
            ],
            'Thermodynamics': [
                'Thermal Equilibrium and Zeroth Law',
                'First Law of Thermodynamics',
                'Different Types of Processes',
                'Carnot Cycle and Carnot Engine',
                'Heat Pump'
            ],
            'Oscillations': [
                'Periodic Motion and Oscillatory Motion',
                'Some Basic Terms Related to Oscillatory Motion',
                'Simple Harmonic Motion (SHM)',
                'Equations of SHM',
                'Energy in SHM',
                'Calculation of Time Period of Spring Block System',
                'Time Period of Pendulum',
                'Oscillation of Liquid Column'
            ],
            'Waves': [
                'Characteristics of Waves',
                'Progressive Wave on String',
                'Characteristics of Sound Wave',
                'Principle of Superposition of Wave',
                'Stationary Waves',
                'Echo'
            ],

            // Class 12 Physics
            'Electric Charges and Fields': [
                'Charge',
                'Coulomb\'s Law',
                'Electric Field of a Continuous Charge Distribution',
                'Motion of a Charged Particle in Uniform Electric Field',
                'Electric Field Lines',
                'Electric Flux',
                'Gauss Law',
                'Application of Gauss\'s Law',
                'Electric Dipole',
                'Dipole in a Uniform External Field',
                'Short Dipole in Non-Uniform Electric Field'
            ],
            'Electrostatic Potential and Capacitance': [
                'Electrostatic Potential/Potential Difference',
                'Equipotential Surface',
                'Electric Potential Due to Dipole',
                'Electrostatics of Conductor'
            ],
            'Current Electricity': [
                'Kirchhoff\'s Laws and Combination of Resistances',
                'Wheatstone Bridge and Symmetric Circuits',
                'Electrical Measuring Instruments',
                'RC Circuit'
            ],
            'Moving Charges and Magnetism': [
                'Biot-Savart\'s Law',
                'Magnetic Field Due to a Current Carrying Ring and Problems on Combination of Ring and Rod',
                'Ampere\'s Law and Its Applications',
                'Force on a Moving Charge in a Magnetic Field',
                'Helical Path',
                'Lorentz Force and Velocity Selector',
                'Magnetic Force on a Current Carrying Conductor',
                'Gyromagnetic Ratio',
                'Torque on a Current Carrying Loop'
            ],
            'Magnetism and Matter': [
                'Bar Magnet and Its Properties',
                'Circular Coil as Magnetic Dipole',
                'Tangent Galvanometer',
                'Oscillation Magnetometer',
                'Magnetisation and Magnetic Intensity',
                'Classification of Magnetic Materials',
                'Ferromagnetism and Hysteresis'
            ],
            'Electromagnetic Induction': [
                'Magnetic Flux and Lenz\'s Law',
                'Calculation of Induced EMF',
                'Induced Electric Field',
                'Self Inductance',
                'Mutual Inductance',
                'LC Oscillations and Transformer',
                'Faraday\'s Law'
            ],
            'Alternating Current': [
                'Introduction to Alternating Current',
                'Average and RMS Values',
                'Types of AC Circuits',
                'Power & Power Factor',
                'Choke Coil',
                'Series LCR Circuit and Resonant Frequency',
                'LC Oscillations and Transformer'
            ],
            'Electromagnetic Waves': [
                'Characteristics of Electromagnetic Waves'
            ],
            'Ray Optics and Optical Instruments': [
                'Reflection from Plane Mirror',
                'Reflection from Spherical Mirror',
                'Refraction from Plane Surface',
                'Total Internal Refraction',
                'Newton\'s Formula',
                'Combination of Lens and Mirror',
                'Displacement Method to Find Focal Length',
                'Dispersion of Light',
                'Optical Instruments'
            ],
            'Wave Optics': [
                'Nature of Light',
                'Interference of Light',
                'Diffraction of Light',
                'Polarisation'
            ],
            'Dual Nature of Radiation and Matter': [
                'Quantum Theory of Light',
                'Photoelectric Effect'
            ],
            'Atoms': [
                'Bohr\'s Model'
            ],
            'Nuclei': [
                'Mass Energy',
                'Nuclear Size',
                'Nuclear Stability',
                'Binding Energy',
                'Nuclear Energy'
            ],
            'Semiconductor Electronics: Materials, Devices and Simple Circuits': [
                'PN Junction Diode',
                'Application of PN Junction Diode',
                'Logic Gate'
            ]
        },
        'NEET Chemistry Class': {
            // Class 11 Chemistry
            'Some Basic Concepts of Chemistry': [
                'Mole Concept',
                'Determination of Formula of Compound',
                'Stoichiometric Calculations',
                'Concentration Terms',
                'Relation Between Molarity and Normality'
            ],
            'Redox Reactions': [
                'Oxidation Number',
                'Redox Reactions',
                'Balancing of Redox Reactions',
                'Electrochemical Cell'
            ],
            'Structure of Atom': [
                'Subatomic Particles',
                'Concept of Atomic Number and Mass Number',
                'Bohr\'s Model of an Atom',
                'Particle Nature of Electromagnetic Radiation',
                'Photoelectric Effect',
                'Quantum Mechanical Model',
                'Quantum Numbers',
                'Electronic Configuration of Atoms'
            ],
            'Thermodynamics': [
                'P-V Work',
                'Heat Capacity',
                'Thermochemistry',
                'Second Law of Thermodynamics'
            ],
            'Equilibrium': [
                'Applications of Equilibrium Constant',
                'Equilibrium Constant',
                'Factors Affecting State of Equilibrium',
                'Expressing Hydrogen Ion Concentration',
                'Buffer Solution',
                'Solubility of Sparingly Soluble Salts'
            ],
            'Organic Chemistry – Some Basic Principles and Techniques': [
                'Naming the Organic Compounds',
                'Isomerism in Organic Compounds',
                'Electronic Displacements in Covalent Compounds',
                'Reaction Intermediates',
                'Hybridisation'
            ],
            'Hydrocarbons': [
                'Conformations of Hydrocarbons',
                'Isomerism in Alkenes',
                'Stability of Alkene',
                'Chemical Reactions of Alkenes',
                'Chemical Reactions of Alkynes',
                'Aromatic Hydrocarbons',
                'Chemical Reactions of Aromatic Hydrocarbons'
            ],
            'Classification of Elements and Periodicity in Properties': [
                'Modern Periodic Table',
                'Periodic Trends in Properties of Elements'
            ],
            'Chemical Bonding and Molecular Structure': [
                'General Introduction',
                'Polarity of Bonds',
                'Covalent Character in Ionic Bonds',
                'Geometry or Shapes of Molecules',
                'Concept of Orbital Overlap in Covalent Bonds',
                'Molecular Orbital Theory (MOT)',
                'Hydrogen Bond'
            ],
            'Principles Related To Practical Organic Chemistry': [
                'Analysis of Organic Compounds',
                'Volumetric Analysis',
                'Qualitative Salt Analysis',
                'Enthalpy'
            ],
            'The p-Block Elements – Part 1': [
                'Group-13 Elements',
                'Group-14 Elements'
            ],

            // Class 12 Chemistry
            'Solutions': [
                'Solubility of Gases in Liquids',
                'Vapour Pressure of Liquid Solutions',
                'Colligative Properties',
                'Abnormal Molar Masses'
            ],
            'Chemical Kinetics': [
                'Dependence of Reaction Rate on Concentration',
                'Integrated Rate Expressions',
                'Dependence of Reaction Rate on Temperature'
            ],
            'Electrochemistry': [
                'Electrolytic Conduction',
                'Variation of Conductivity and Molar Conductivity with Concentration',
                'Kohlrausch\'s Law',
                'Electrochemical or Galvanic Cell',
                'Electrochemical Series',
                'Dependence of Cell and Electrode Potentials on Concentration',
                'Electrolytic Cells and Electrolysis',
                'Fuel Cells'
            ],
            'Haloalkanes and Haloarenes': [
                'Chemical Properties of Haloalkanes',
                'Chemical Properties of Haloarenes',
                'Polyhalogen Compounds'
            ],
            'Alcohols, Phenols and Ethers': [
                'Alcohols – Reactions Involving Cleavage of (O-H) Bond, (C-O) Bond, and Both Alkyl & Hydroxyl Groups',
                'Phenols – Reactions of Phenolic Group, Reactions of Benzene Ring, Special Reactions',
                'Distinction Between Alcohols and Phenols'
            ],
            'Aldehydes, Ketones and Carboxylic Acids': [
                'Aldehydes & Ketones – Nucleophilic Addition, Oxidation, Reduction, Reaction with Base',
                'Carboxylic Acids – Properties and Reactions'
            ],
            'Amines': [
                'Preparation Methods',
                'Chemical Properties',
                'Ring Substitution in Aromatic Amines',
                'Distinction Between Amines'
            ],
            'Biomolecules': [
                'Glucose and Fructose',
                'Glucose – Reaction Due to Open Chain Structure',
                'Disaccharides',
                'Proteins',
                'Nucleic Acids'
            ],
            'Coordination Compounds': [
                'Ligands',
                'Werner\'s Theory',
                'Coordination Compounds',
                'Isomerism in Coordination Compounds',
                'Bonding in Coordination Compounds'
            ],
            'The d- and f-Block Elements': [
                'Introduction',
                'General Properties of Transition Elements',
                'Compounds of Transition Metals',
                'Inner Transition Elements (Lanthanoids)',
                'Inner Transition Elements (Actinoids)'
            ],
            'The p-Block Elements – Part 2': [
                'Group-15 Elements',
                'Group-16 Elements',
                'Group-17 Elements',
                'Group-18 Elements'
            ]
        },
        'NEET Biology Class': {
            // Class 11 Biology
            'The Living World': [
                'What is living? Biodiversity',
                'Need for classification',
                'Taxonomy & Systematics',
                'Concept of species and taxonomical hierarchy',
                'Binomial nomenclature'
            ],
            'Biological Classification': [
                'Five kingdom classification',
                'Salient features and classification of Monera, Protista, and Fungi into major groups',
                'Lichens',
                'Viruses and Viroids'
            ],
            'Plant Kingdom': [
                'Salient features and classification of plants into major groups — Algae, Bryophytes, Pteridophytes, Gymnosperms (three to five salient features and at least two examples of each category)'
            ],
            'Animal Kingdom': [
                'Salient features and classification of animals — Non-chordates up to phylum level and chordates up to class level (three to five salient features and at least two examples)'
            ],
            'Morphology of Flowering Plants': [
                'Morphology and modifications',
                'Root, stem, leaf, inflorescence (cymose and racemose), flower, fruit, and seed',
                'Families — Malvaceae, Cruciferae, Leguminosae, Compositae, Gramineae'
            ],
            'Anatomy of Flowering Plants': [
                'Tissues',
                'Anatomy and functions of different parts of flowering plants — root, stem, and leaf'
            ],
            'Structural Organisation in Animals': [
                'Animal tissues',
                'Morphology, anatomy, and functions of different systems (digestive, circulatory, respiratory, nervous, and reproductive) of a frog (brief account only)'
            ],
            'Cell: The Unit of Life': [
                'Cell theory and cell as the basic unit of life',
                'Structure of prokaryotic and eukaryotic cells',
                'Plant and animal cells',
                'Cell envelope, membrane, and wall',
                'Cell organelles — structure and function (ER, Golgi bodies, lysosomes, vacuoles, mitochondria, ribosomes, plastids, microbodies)',
                'Cytoskeleton, cilia, flagella, centrioles',
                'Nucleus — membrane, chromatin, nucleolus'
            ],
            'Biomolecules': [
                'Chemical constituents of living cells',
                'Structure and function of proteins, carbohydrates, lipids, and nucleic acids',
                'Enzymes — types, properties, mechanism of action, classification, and nomenclature'
            ],
            'Cell Cycle and Cell Division': [
                'Cell cycle',
                'Mitosis',
                'Meiosis',
                'Significance of cell division'
            ],
            'Transport in Plants': [
                'Means of transport',
                'Diffusion, facilitated diffusion, active transport',
                'Water potential',
                'Osmosis',
                'Transpiration',
                'Ascent of sap',
                'Translocation of solutes',
                'Phloem transport'
            ],
            'Mineral Nutrition': [
                'Essential minerals, macro and micronutrients',
                'Role of nutrients',
                'Deficiency symptoms',
                'Nitrogen metabolism',
                'Nitrogen cycle'
            ],
            'Photosynthesis in Higher Plants': [
                'Photosynthesis as a means of autotrophic nutrition',
                'Site of photosynthesis',
                'Photosynthetic pigments',
                'Photochemical and biosynthetic phases',
                'Cyclic and non-cyclic photophosphorylation',
                'Chemiosmotic hypothesis',
                'Photorespiration',
                'C3 and C4 pathways',
                'Factors affecting photosynthesis'
            ],
            'Respiration in Plants': [
                'Exchange of gases',
                'Cellular respiration — glycolysis, fermentation (anaerobic), TCA cycle, electron transport system (aerobic)',
                'Energy relations — ATP generation, amphibolic pathways, respiratory quotient'
            ],
            'Plant Growth and Development': [
                'Seed germination',
                'Phases and rate of plant growth',
                'Conditions of growth',
                'Differentiation, dedifferentiation, and redifferentiation',
                'Growth regulators — auxin, gibberellin, cytokinin, ethylene, ABA'
            ],
            'Digestion and Absorption': [
                'Digestive system of humans',
                'Digestion and absorption of carbohydrates, proteins, and fats',
                'Digestive glands and their secretions',
                'Disorders of the digestive system'
            ],
            'Breathing and Exchange of Gases': [
                'Respiratory organs in animals',
                'Human respiratory system',
                'Mechanism and regulation of breathing',
                'Exchange and transport of gases',
                'Respiratory volumes',
                'Disorders — Asthma, Emphysema, Occupational respiratory diseases'
            ],
            'Body Fluids and Circulation': [
                'Composition of blood',
                'Blood groups',
                'Coagulation',
                'Lymph',
                'Human heart structure and cardiac cycle',
                'Cardiac output',
                'ECG',
                'Double circulation',
                'Regulation of cardiac activity',
                'Disorders — Hypertension, Coronary artery disease, Angina pectoris, Heart failure'
            ],
            'Excretory Products and Their Elimination': [
                'Modes of excretion — Ammonotelism, Ureotelism, Uricotelism',
                'Human excretory system',
                'Urine formation',
                'Osmoregulation',
                'Kidney function regulation — Renin-Angiotensin, ANF, ADH',
                'Disorders — Uraemia, Renal failure, Renal calculi, Nephritis',
                'Dialysis and artificial kidney'
            ],
            'Locomotion and Movement': [
                'Types of movement — ciliary, flagellar, muscular',
                'Skeletal muscles — contractile proteins and muscle contraction',
                'Skeletal system and joints',
                'Disorders — Myasthenia gravis, Tetany, Muscular dystrophy, Arthritis, Osteoporosis, Gout'
            ],
            'Neural Control and Coordination': [
                'Neuron and nerves',
                'Human nervous system — central, peripheral, and visceral',
                'Generation and conduction of nerve impulse'
            ],
            'Chemical Coordination and Integration': [
                'Endocrine glands and hormones',
                'Human endocrine system — hypothalamus, pituitary, pineal, thyroid, parathyroid, adrenal, pancreas, gonads',
                'Mechanism of hormone action',
                'Hypo/hyperactivity disorders — Dwarfism, Acromegaly, Cretinism, Goiter, Diabetes, Addison\'s disease'
            ],

            // Class 12 Biology
            'Reproduction in Organisms': [
                'Asexual and sexual reproduction',
                'Reproductive structures and cycles in various organisms'
            ],
            'Sexual Reproduction in Flowering Plants': [
                'Flower structure',
                'Male and female gametophyte development',
                'Pollination — types, agents, examples',
                'Outbreeding devices',
                'Pollen–pistil interaction',
                'Double fertilization',
                'Post-fertilization events — endosperm, embryo, seed, fruit development',
                'Apomixis, parthenocarpy, polyembryony'
            ],
            'Human Reproduction': [
                'Male and female reproductive systems',
                'Microscopic anatomy of testis and ovary',
                'Gametogenesis — spermatogenesis, oogenesis',
                'Menstrual cycle',
                'Fertilization, embryo development, implantation',
                'Pregnancy, placenta, parturition, lactation'
            ],
            'Reproductive Health': [
                'Need for reproductive health',
                'Prevention of STDs',
                'Birth control methods',
                'Contraception',
                'MTP',
                'Amniocentesis',
                'Infertility',
                'Assisted reproductive technologies — IVF, ZIFT, GIFT'
            ],
            'Principles of Inheritance and Variation': [
                'Mendelian inheritance',
                'Deviations — incomplete dominance, co-dominance, multiple alleles, polygenic inheritance',
                'Chromosome theory of inheritance',
                'Sex determination',
                'Linkage, crossing over',
                'Sex-linked inheritance',
                'Mendelian and chromosomal disorders'
            ],
            'Molecular Basis of Inheritance': [
                'Search for genetic material',
                'DNA and RNA structure',
                'Packaging',
                'Replication',
                'Central dogma',
                'Transcription',
                'Translation',
                'Gene expression and regulation — Lac Operon',
                'Human Genome Project',
                'DNA fingerprinting',
                'Protein biosynthesis'
            ],
            'Evolution': [
                'Origin of life',
                'Biological evolution',
                'Evidences from paleontology, anatomy, embryology, molecular biology',
                'Darwin\'s theory',
                'Modern synthetic theory',
                'Mechanisms — mutation, recombination, natural selection, gene flow, genetic drift',
                'Hardy-Weinberg principle',
                'Adaptive radiation',
                'Human evolution'
            ],
            'Human Health and Disease': [
                'Health and diseases',
                'Pathogens and diseases — Malaria, Filariasis, Ascariasis, Typhoid, Pneumonia, Common cold, Amoebiasis, Ringworm, Dengue, Chikungunya',
                'Immunology and vaccines',
                'Cancer',
                'HIV/AIDS',
                'Adolescence, drug, alcohol, and tobacco abuse'
            ],
            'Strategies for Enhancement in Food Production': [
                'Animal husbandry',
                'Plant breeding',
                'Tissue culture',
                'Single-cell protein',
                'Biofortification'
            ],
            'Microbes in Human Welfare': [
                'Microbes in household food processing, industrial production, sewage treatment, energy generation, biocontrol, and biofertilizers'
            ],
            'Biotechnology – Principles and Processes': [
                'Principles and process of biotechnology',
                'Genetic engineering — recombinant DNA technology'
            ],
            'Biotechnology and Its Applications': [
                'Applications in health and agriculture — human insulin, vaccines, gene therapy',
                'GMOs — Bt crops, transgenic animals',
                'Biosafety, biopiracy, and patents'
            ],
            'Organisms and Populations': [
                'Organisms and environment',
                'Population interactions — mutualism, competition, predation, parasitism',
                'Population attributes — growth, birth rate, death rate, age distribution'
            ],
            'Ecosystem': [
                'Structure, components, productivity, decomposition, energy flow',
                'Pyramids of number, biomass, and energy'
            ],
            'Biodiversity and Conservation': [
                'Concept, importance, and patterns of biodiversity',
                'Loss and conservation of biodiversity',
                'Hotspots',
                'Endangered species',
                'Extinction',
                'Red Data Book',
                'Biosphere reserves',
                'National parks',
                'Sanctuaries',
                'Sacred groves'
            ],
            'Environmental Issues': [
                'Pollution, global warming, ozone depletion, deforestation, waste management, and sustainable development'
            ]
        }
    };

    return topicsMap[subject]?.[chapter] || [
        'Fundamental Concepts',
        'Key Principles',
        'Important Applications',
        'Problem Solving Techniques'
    ];
};
