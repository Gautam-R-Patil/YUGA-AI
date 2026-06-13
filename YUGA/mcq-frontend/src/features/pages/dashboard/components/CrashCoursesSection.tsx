import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Zap, FlaskConical, Atom } from "lucide-react";
import { API_BASE_URL } from "../../../../core/utils/api";
import { Course, Lesson } from "../../../../core/types";

interface CrashChapter {
  id: string;
  title: string;
  jsonPath: string;
  duration?: string;
}

interface CrashCategory {
  id: string;
  title: string;
  description: string;
  chapters: CrashChapter[];
}

type SubjectKey = "Physics" | "Chemistry" | "Biology";

const CRASH_STRUCTURE: Record<SubjectKey, CrashCategory[]> = {
  Physics: [
    {
      id: "physics-all",
      title: "All NEET Physics Chapters",
      description: "High-yield one-shot classes for every Physics chapter.",
      chapters: [
        { id: "physical-world", title: "Physical World – Full Chapter", jsonPath: "/neet/Physics/physical_world_full_chapter.json", duration: "12 mins" },
        { id: "units-and-measurements", title: "Units and Measurements – Full Chapter", jsonPath: "/neet/Physics/units_and_measurements_full_chapter.json", duration: "12 mins" },
        { id: "motion-in-a-straight-line", title: "Motion in a Straight Line – Full Chapter", jsonPath: "/neet/Physics/motion_in_a_straight_line_full_chapter.json", duration: "12 mins" },
        { id: "motion-in-a-plane", title: "Motion in a Plane – Full Chapter", jsonPath: "/neet/Physics/motion_in_a_plane_full_chapter.json", duration: "12 mins" },
        { id: "laws-of-motion", title: "Laws of Motion – Full Chapter", jsonPath: "/neet/Physics/laws_of_motion_full_chapter.json", duration: "12 mins" },
        { id: "work-energy-power", title: "Work, Energy and Power – Full Chapter", jsonPath: "/neet/Physics/work,_energy_and_power_full_chapter.json", duration: "12 mins" },
        { id: "system-of-particles", title: "System of Particles and Rotational Motion – Full Chapter", jsonPath: "/neet/Physics/system_of_particles_and_rotational_motion_full_chapter.json", duration: "12 mins" },
        { id: "gravitation", title: "Gravitation – Full Chapter", jsonPath: "/neet/Physics/gravitation_full_chapter.json", duration: "12 mins" },
        { id: "mechanical-properties-solids", title: "Mechanical Properties of Solids – Full Chapter", jsonPath: "/neet/Physics/mechanical_properties_of_solids_full_chapter.json", duration: "12 mins" },
        { id: "mechanical-properties-fluids", title: "Mechanical Properties of Fluids – Full Chapter", jsonPath: "/neet/Physics/mechanical_properties_of_fluids_full_chapter.json", duration: "12 mins" },
        { id: "thermal-properties", title: "Thermal Properties of Matter – Full Chapter", jsonPath: "/neet/Physics/thermal_properties_of_matter_full_chapter.json", duration: "12 mins" },
        { id: "thermodynamics", title: "Thermodynamics – Full Chapter", jsonPath: "/neet/Physics/thermodynamics_full_chapter.json", duration: "12 mins" },
        { id: "kinetic-theory", title: "Kinetic Theory – Full Chapter", jsonPath: "/neet/Physics/kinetic_theory_full_chapter.json", duration: "12 mins" },
        { id: "oscillations", title: "Oscillations – Full Chapter", jsonPath: "/neet/Physics/oscillations_full_chapter.json", duration: "12 mins" },
        { id: "waves", title: "Waves – Full Chapter", jsonPath: "/neet/Physics/waves_full_chapter.json", duration: "12 mins" },
        { id: "electric-charges-and-fields", title: "Electric Charges and Fields – Full Chapter", jsonPath: "/neet/Physics/electric_charges_and_fields_full_chapter.json", duration: "12 mins" },
        { id: "electrostatic-potential-and-capacitance", title: "Electrostatic Potential and Capacitance – Full Chapter", jsonPath: "/neet/Physics/electrostatic_potential_and_capacitance_full_chapter.json", duration: "12 mins" },
        { id: "current-electricity", title: "Current Electricity – Full Chapter", jsonPath: "/neet/Physics/current_electricity_full_chapter.json", duration: "12 mins" },
        { id: "moving-charges-and-magnetism", title: "Moving Charges and Magnetism – Full Chapter", jsonPath: "/neet/Physics/moving_charges_and_magnetism_full_chapter.json", duration: "12 mins" },
        { id: "magnetism-and-matter", title: "Magnetism and Matter – Full Chapter", jsonPath: "/neet/Physics/magnetism_and_matter_full_chapter.json", duration: "12 mins" },
        { id: "electromagnetic-induction", title: "Electromagnetic Induction – Full Chapter", jsonPath: "/neet/Physics/electromagnetic_induction_full_chapter.json", duration: "12 mins" },
        { id: "alternating-current", title: "Alternating Current – Full Chapter", jsonPath: "/neet/Physics/alternating_current_full_chapter.json", duration: "12 mins" },
        { id: "electromagnetic-waves", title: "Electromagnetic Waves – Full Chapter", jsonPath: "/neet/Physics/electromagnetic_waves_full_chapter.json", duration: "12 mins" },
        { id: "ray-optics", title: "Ray Optics and Optical Instruments – Full Chapter", jsonPath: "/neet/Physics/ray_optics_and_optical_instruments_full_chapter.json", duration: "12 mins" },
        { id: "wave-optics", title: "Wave Optics – Full Chapter", jsonPath: "/neet/Physics/wave_optics_full_chapter.json", duration: "12 mins" },
        { id: "dual-nature", title: "Dual Nature of Radiation and Matter – Full Chapter", jsonPath: "/neet/Physics/dual_nature_of_radiation_and_matter_full_chapter.json", duration: "12 mins" },
        { id: "atoms", title: "Atoms – Full Chapter", jsonPath: "/neet/Physics/atoms_full_chapter.json", duration: "12 mins" },
        { id: "nuclei", title: "Nuclei – Full Chapter", jsonPath: "/neet/Physics/nuclei_full_chapter.json", duration: "12 mins" },
        { id: "semiconductors", title: "Semiconductor Electronics – Full Chapter", jsonPath: "/neet/Physics/semiconductor_electronics_full_chapter.json", duration: "12 mins" },
        { id: "experimental-skills", title: "Experimental Skills – Full Chapter", jsonPath: "/neet/Physics/experimental_skills_full_chapter.json", duration: "12 mins" },
      ],
    },
  ],
  Biology: [
    {
      id: "bio-all",
      title: "NEET Biology Oneshoot Chapters",
      description: "One-shot classes for all NEET Biology chapters.",
      chapters: [
        { id: "the-living-world", title: "The Living World – Full Chapter", jsonPath: "/neet/Biology/the_living_world_full_chapter.json", duration: "12 mins" },
        { id: "biological-classification", title: "Biological Classification – Full Chapter", jsonPath: "/neet/Biology/biological_classification_full_chapter.json", duration: "12 mins" },
        { id: "plant-kingdom", title: "Plant Kingdom – Full Chapter", jsonPath: "/neet/Biology/plant_kingdom_full_chapter.json", duration: "12 mins" },
        { id: "animal-kingdom", title: "Animal Kingdom – Full Chapter", jsonPath: "/neet/Biology/animal_kingdom_full_chapter.json", duration: "12 mins" },
        { id: "morphology-flowering-plants", title: "Morphology of Flowering Plants – Full Chapter", jsonPath: "/neet/Biology/morphology_of_flowering_plants_full_chapter.json", duration: "12 mins" },
        { id: "anatomy-flowering-plants", title: "Anatomy of Flowering Plants – Full Chapter", jsonPath: "/neet/Biology/anatomy_of_flowering_plants_full_chapter.json", duration: "12 mins" },
        { id: "structural-organisation-in-animals", title: "Structural Organisation in Animals – Full Chapter", jsonPath: "/neet/Biology/structural_organisation_in_animals_full_chapter.json", duration: "12 mins" },
        { id: "cell-cycle-and-division", title: "Cell Cycle and Cell Division – Full Chapter", jsonPath: "/neet/Biology/cell_cycle_and_cell_division_full_chapter.json", duration: "12 mins" },
        { id: "biomolecules", title: "Biomolecules – Full Chapter", jsonPath: "/neet/Biology/biomolecules_full_chapter.json", duration: "12 mins" },
        { id: "transport-in-plants", title: "Transport in Plants – Full Chapter", jsonPath: "/neet/Biology/transport_in_plants_full_chapter.json", duration: "12 mins" },
        { id: "mineral-nutrition", title: "Mineral Nutrition – Full Chapter", jsonPath: "/neet/Biology/mineral_nutrition_full_chapter.json", duration: "12 mins" },
        { id: "photosynthesis", title: "Photosynthesis in Higher Plants – Full Chapter", jsonPath: "/neet/Biology/photosynthesis_in_higher_plants_full_chapter.json", duration: "12 mins" },
        { id: "respiration-in-plants", title: "Respiration in Plants – Full Chapter", jsonPath: "/neet/Biology/respiration_in_plants_full_chapter.json", duration: "12 mins" },
        { id: "plant-growth-development", title: "Plant Growth and Development – Full Chapter", jsonPath: "/neet/Biology/plant_growth_and_development_full_chapter.json", duration: "12 mins" },
        { id: "digestion-and-absorption", title: "Digestion and Absorption – Full Chapter", jsonPath: "/neet/Biology/digestion_and_absorption_full_chapter.json", duration: "12 mins" },
        { id: "breathing-and-gas-exchange", title: "Breathing and Exchange of Gases – Full Chapter", jsonPath: "/neet/Biology/breathing_and_exchange_of_gases_full_chapter.json", duration: "12 mins" },
        { id: "body-fluids-and-circulation", title: "Body Fluids and Circulation – Full Chapter", jsonPath: "/neet/Biology/body_fluids_and_circulation_full_chapter.json", duration: "12 mins" },
        { id: "excretory-products", title: "Excretory Products and Their Elimination – Full Chapter", jsonPath: "/neet/Biology/excretory_products_and_their_elimination_full_chapter.json", duration: "12 mins" },
        { id: "locomotion-and-movement", title: "Locomotion and Movement – Full Chapter", jsonPath: "/neet/Biology/locomotion_and_movement_full_chapter.json", duration: "12 mins" },
        { id: "neural-control-and-coordination", title: "Neural Control and Coordination – Full Chapter", jsonPath: "/neet/Biology/neural_control_and_coordination_full_chapter.json", duration: "12 mins" },
        { id: "chemical-coordination-and-integration", title: "Chemical Coordination and Integration – Full Chapter", jsonPath: "/neet/Biology/chemical_coordination_and_integration_full_chapter.json", duration: "12 mins" },
        { id: "reproduction-in-organisms", title: "Reproduction in Organisms – Full Chapter", jsonPath: "/neet/Biology/reproduction_in_organisms_full_chapter.json", duration: "12 mins" },
        { id: "sexual-reproduction-flowering-plants", title: "Sexual Reproduction in Flowering Plants – Full Chapter", jsonPath: "/neet/Biology/sexual_reproduction_in_flowering_plants_full_chapter.json", duration: "12 mins" },
        { id: "human-reproduction", title: "Human Reproduction – Full Chapter", jsonPath: "/neet/Biology/human_reproduction_full_chapter.json", duration: "12 mins" },
        { id: "reproductive-health", title: "Reproductive Health – Full Chapter", jsonPath: "/neet/Biology/reproductive_health_full_chapter.json", duration: "12 mins" },
        { id: "principles-of-inheritance", title: "Principles of Inheritance and Variation – Full Chapter", jsonPath: "/neet/Biology/principles_of_inheritance_and_variation_full_chapter.json", duration: "12 mins" },
        { id: "molecular-basis-of-inheritance", title: "Molecular Basis of Inheritance – Full Chapter", jsonPath: "/neet/Biology/molecular_basis_of_inheritance_full_chapter.json", duration: "12 mins" },
        { id: "evolution", title: "Evolution – Full Chapter", jsonPath: "/neet/Biology/evolution_full_chapter.json", duration: "12 mins" },
        { id: "human-health-and-disease", title: "Human Health and Disease – Full Chapter", jsonPath: "/neet/Biology/human_health_and_disease_full_chapter.json", duration: "12 mins" },
        { id: "microbes-in-human-welfare", title: "Microbes in Human Welfare – Full Chapter", jsonPath: "/neet/Biology/microbes_in_human_welfare_full_chapter.json", duration: "12 mins" },
        { id: "biotechnology-and-its-applications", title: "Biotechnology and Its Applications – Full Chapter", jsonPath: "/neet/Biology/biotechnology_and_its_applications_full_chapter.json", duration: "12 mins" },
        { id: "organisms-and-populations", title: "Organisms and Populations – Full Chapter", jsonPath: "/neet/Biology/organisms_and_populations_full_chapter.json", duration: "12 mins" },
        { id: "ecosystem", title: "Ecosystem – Full Chapter", jsonPath: "/neet/Biology/ecosystem_full_chapter.json", duration: "12 mins" },
        { id: "biodiversity-and-conservation", title: "Biodiversity and Conservation – Full Chapter", jsonPath: "/neet/Biology/biodiversity_and_conservation_full_chapter.json", duration: "12 mins" },
        { id: "environmental-issues", title: "Environmental Issues – Full Chapter", jsonPath: "/neet/Biology/environmental_issues_full_chapter.json", duration: "12 mins" },
      ],
    },
  ],
  Chemistry: [
    // 1. Physical Chemistry
    {
      id: "chem-physical",
      title: "Physical Chemistry Oneshoot Chapters",
      description: "Quick revision of all NEET Physical Chemistry chapters.",
      chapters: [
        { id: "some-basic-concepts", title: "Some Basic Concepts of Chemistry – Full Chapter", jsonPath: "/neet/Chemistry/Physical/some_basic_concepts_of_chemistry_full_chapter.json", duration: "12 mins" },
        { id: "structure-of-atom", title: "Structure of Atom – Full Chapter", jsonPath: "/neet/Chemistry/Physical/structure_of_atom_full_chapter.json", duration: "12 mins" },
        { id: "states-of-matter", title: "States of Matter – Full Chapter", jsonPath: "/neet/Chemistry/Physical/states_of_matter_full_chapter.json", duration: "12 mins" },
        { id: "thermodynamics", title: "Thermodynamics – Full Chapter", jsonPath: "/neet/Chemistry/Physical/thermodynamics_full_chapter.json", duration: "12 mins" },
        { id: "equilibrium", title: "Equilibrium – Full Chapter", jsonPath: "/neet/Chemistry/Physical/equilibrium_full_chapter.json", duration: "12 mins" },
        { id: "redox-reactions", title: "Redox Reactions – Full Chapter", jsonPath: "/neet/Chemistry/Physical/redox_reactions_full_chapter.json", duration: "12 mins" },
        { id: "electrochemistry", title: "Electrochemistry – Full Chapter", jsonPath: "/neet/Chemistry/Physical/electrochemistry_full_chapter.json", duration: "12 mins" },
        { id: "chemical-kinetics", title: "Chemical Kinetics – Full Chapter", jsonPath: "/neet/Chemistry/Physical/chemical_kinetics_full_chapter.json", duration: "12 mins" },
        { id: "surface-chemistry", title: "Surface Chemistry – Full Chapter", jsonPath: "/neet/Chemistry/Physical/surface_chemistry_full_chapter.json", duration: "12 mins" },
        { id: "solutions", title: "Solutions – Full Chapter", jsonPath: "/neet/Chemistry/Physical/solutions_full_chapter.json", duration: "12 mins" },
        { id: "hydrogen", title: "Hydrogen – Full Chapter", jsonPath: "/neet/Chemistry/Physical/hydrogen_full_chapter.json", duration: "12 mins" },
        { id: "classification-of-elements", title: "Classification of Elements & Periodicity – Full Chapter", jsonPath: "/neet/Chemistry/Physical/classification_of_elements_and_periodicity_in_properties_full_chapter.json", duration: "12 mins" },
        { id: "chemical-bonding", title: "Chemical Bonding and Molecular Structure – Full Chapter", jsonPath: "/neet/Chemistry/Physical/chemical_bonding_and_molecular_structure_full_chapter.json", duration: "12 mins" },
        { id: "solid-state", title: "The Solid State – Full Chapter", jsonPath: "/neet/Chemistry/Physical/the_solid_state_full_chapter.json", duration: "12 mins" },
      ],
    },

    // 2. Inorganic Chemistry
    {
      id: "chem-inorganic",
      title: "Inorganic Chemistry Oneshoot Chapters",
      description: "High-yield NEET Inorganic chapters in one shot.",
      chapters: [
        { id: "s-block", title: "s-Block Elements – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/s-block_elements_full_chapter.json", duration: "12 mins" },
        { id: "p-block-11", title: "p-Block Elements (Class 11) – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/p-block_elements_(class_11)_full_chapter.json", duration: "12 mins" },
        { id: "p-block-12", title: "p-Block Elements (Class 12) – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/p-block_elements_(class_12)_full_chapter.json", duration: "12 mins" },
        { id: "d-f-block", title: "d- and f-Block Elements – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/d-_and_f-block_elements_full_chapter.json", duration: "12 mins" },
        { id: "coordination-compounds", title: "Coordination Compounds – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/coordination_compounds_full_chapter.json", duration: "12 mins" },
        { id: "metallurgy", title: "Metallurgy – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/metallurgy_full_chapter.json", duration: "12 mins" },
        { id: "environmental-chemistry", title: "Environmental Chemistry – Full Chapter", jsonPath: "/neet/Chemistry/Inorganic/environmental_chemistry_full_chapter.json", duration: "12 mins" },
      ],
    },

    // 3. Organic Chemistry
    {
      id: "chem-organic",
      title: "Organic Chemistry Oneshoot Chapters",
      description: "One-shot sessions for key NEET Organic Chemistry chapters.",
      chapters: [
        { id: "basic-principles-organic", title: "Some Basic Principles & Techniques of Organic Chemistry – Full Chapter", jsonPath: "/neet/Chemistry/Organic/some_basic_principles_and_techniques_of_organic_chemistry_full_chapter.json", duration: "12 mins" },
        { id: "practical-organic", title: "Practical Organic Chemistry – Full Chapter", jsonPath: "/neet/Chemistry/Organic/practical_organic_chemistry_principles_and_techniques_full_chapter.json", duration: "12 mins" },
        { id: "hydrocarbons", title: "Hydrocarbons – Full Chapter", jsonPath: "/neet/Chemistry/Organic/hydrocarbons_full_chapter.json", duration: "12 mins" },
        { id: "haloalkanes-haloarenes", title: "Haloalkanes and Haloarenes – Full Chapter", jsonPath: "/neet/Chemistry/Organic/haloalkanes_and_haloarenes_full_chapter.json", duration: "12 mins" },
        { id: "alcohols-phenols-ethers", title: "Alcohols, Phenols and Ethers – Full Chapter", jsonPath: "/neet/Chemistry/Organic/alcohols,_phenols_and_ethers_full_chapter.json", duration: "12 mins" },
        { id: "aldehydes-ketones-carboxylic", title: "Aldehydes, Ketones and Carboxylic Acids – Full Chapter", jsonPath: "/neet/Chemistry/Organic/aldehydes,_ketones_and_carboxylic_acids_full_chapter.json", duration: "12 mins" },
        { id: "amines", title: "Organic Compounds Containing Nitrogen (Amines) – Full Chapter", jsonPath: "/neet/Chemistry/Organic/organic_compounds_containing_nitrogen_(amines)_full_chapter.json", duration: "12 mins" },
        { id: "biomolecules", title: "Biomolecules – Full Chapter", jsonPath: "/neet/Chemistry/Organic/biomolecules_full_chapter.json", duration: "12 mins" },
        { id: "polymers", title: "Polymers – Full Chapter", jsonPath: "/neet/Chemistry/Organic/polymers_full_chapter.json", duration: "12 mins" },
        { id: "chemistry-everyday-life", title: "Chemistry in Everyday Life – Full Chapter", jsonPath: "/neet/Chemistry/Organic/chemistry_in_everyday_life_full_chapter.json", duration: "12 mins" },
      ],
    },
  ],
};

interface CrashCoursesSectionProps {
  initialSubjectKey?: SubjectKey | null;
}

export const CrashCoursesSection: React.FC<CrashCoursesSectionProps> = ({
  initialSubjectKey = null,
}) => {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<SubjectKey | null>(
    initialSubjectKey
  );

  const handleOpenSubject = (subject: SubjectKey) => {
    setActiveSubject((prev) => (prev === subject ? null : subject));
  };

  const handleOpenChapter = (
    subject: SubjectKey,
    categoryTitle: string,
    chapter: CrashChapter
  ) => {
    // Build a dynamic Course + Lesson and open standard AIClassroom UI (/classroom)
    const subjectLabel =
      subject === "Physics"
        ? "NEET Physics Class"
        : subject === "Chemistry"
        ? "NEET Chemistry Class"
        : "NEET Biology Class";

    const lessonId = `oneshort-${subject.toLowerCase()}-${chapter.id}`;

    const lesson: Lesson = {
      id: lessonId,
      title: chapter.title,
      content: `ONESHORTS::${chapter.jsonPath}`,
      type: "interactive",
      duration: chapter.duration || "12 mins",
      completed: false,
      dateAdded: new Date().toISOString().split("T")[0],
      isAIGenerated: true,
      isDynamic: true,
      originalChapter: chapter.title.replace(" – Full Chapter", ""),
      originalSubject: `CrashCourses-${subject}`,
      originalClass: "Crash Courses",
    };

    const course: Course = {
      id: `oneshort-course-${subject.toLowerCase()}`,
      title: `${subjectLabel} – Crash Courses`,
      description: `${categoryTitle} • One-shot chapter classes for quick revision.`,
      image: "",
      category: subjectLabel,
      duration: chapter.duration || "12 mins",
      lessons: [lesson],
      level: "Intermediate",
      progress: 0,
      color:
        subject === "Physics"
          ? "bg-violet-600"
          : subject === "Chemistry"
          ? "bg-emerald-600"
          : "bg-teal-600",
      chapters: [{ title: chapter.title }],
      instructor: "AI Tutor",
      rating: 4.8,
      students: 0,
      tags: ["Crash Course", "One-shot", subjectLabel],
      notesCount: 0,
    };

    navigate("/classroom", { state: { course, lesson } });
  };

  const subjectCards: {
    key: SubjectKey;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    gradient: string;
  }[] = [
    {
      key: "Physics",
      title: "Physics Crash Course",
      subtitle: "Concept-first one-shot sessions.",
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      key: "Chemistry",
      title: "Chemistry Crash Course",
      subtitle: "Inorganic, Organic & Physical in fast-track.",
      icon: <FlaskConical className="w-6 h-6" />,
      gradient: "from-emerald-600 to-teal-500",
    },
    {
      key: "Biology",
      title: "Biology Crash Course",
      subtitle: "Diagrams, flowcharts and NCERT must-do.",
      icon: <Atom className="w-6 h-6" />,
      gradient: "from-rose-600 to-pink-500",
    },
  ];

  return (
    <section className="mt-4 mb-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Crash Courses Classes</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            One-short classes per chapter with smart board, keywords and rapid
            revision.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {subjectCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleOpenSubject(card.key)}
            className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050816] shadow-md hover:shadow-xl transition-all duration-300 text-left ${
              activeSubject === card.key ? "ring-2 ring-offset-2 ring-purple-500" : ""
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-80`}
            ></div>
            <div className="relative p-5 sm:p-6 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/30 text-white shadow-lg">
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Crash Course
                </p>
                <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/85 mt-1">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {activeSubject && (
        <div className="mt-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-5 sm:p-6 shadow-inner space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {activeSubject[0]}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Crash Course Playlist
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {activeSubject} – Select Chapter
                </p>
              </div>
            </div>
          </div>

          {activeSubject === "Chemistry" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(CRASH_STRUCTURE.Chemistry as CrashCategory[]).map((cat) => (
                <div
                  key={cat.id}
                  className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Chemistry Category
                      </p>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {cat.description}
                  </p>
                  <div className="space-y-2">
                    {cat.chapters.length === 0 && (
                      <div className="text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                        Coming soon
                      </div>
                    )}
                    {cat.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() =>
                          handleOpenChapter("Chemistry", cat.title, chapter)
                        }
                        className="w-full text-left text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/40 hover:bg-purple-100 hover:dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 font-medium flex items-center justify-between gap-2 transition-all duration-200"
                      >
                        <span className="line-clamp-2">{chapter.title}</span>
                        {chapter.duration && (
                          <span className="text-[10px] font-semibold text-purple-500 dark:text-purple-300">
                            {chapter.duration}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(CRASH_STRUCTURE[activeSubject] as CrashCategory[]).map(
                (bucket) => (
                  <div
                    key={bucket.id}
                    className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Chapter List
                        </p>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {bucket.title}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {bucket.description}
                    </p>
                    <div className="space-y-2">
                      {bucket.chapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() =>
                            handleOpenChapter(
                              activeSubject,
                              bucket.title,
                              chapter
                            )
                          }
                          className="w-full text-left text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 hover:dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-medium flex items-center justify-between gap-2 transition-all duration-200"
                        >
                          <span className="line-clamp-2">{chapter.title}</span>
                          {chapter.duration && (
                            <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-300">
                              {chapter.duration}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

