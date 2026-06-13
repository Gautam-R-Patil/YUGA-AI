import json
import os
import re

# Units and symbols map
SYSTEM_PRONUNCIATIONS = {
    "mA": "milliampere", "μA": "microampere", "nA": "nanoampere", "uA": "microampere",
    "mV": "millivolt", "kV": "kilovolt", "uV": "microvolt", "μV": "microvolt",
    "mF": "millifarad", "uF": "microfarad", "μF": "microfarad", "nF": "nanofarad", "pF": "picofarad",
    "kHz": "kilohertz", "MHz": "megahertz", "GHz": "gigahertz", "Hz": "hertz",
    "m/s": "meters per second", "m/s2": "meters per second squared", "m/s\u00b2": "meters per second squared",
    "ms-1": "meters per second", "ms-2": "meters per second squared",
    "keV": "k e V", "MeV": "M e V", "GeV": "G e V", "eV": "e V",
    "Ω": "ohm", "Δ": "delta", "λ": "lambda", "π": "pi", "θ": "theta", "φ": "phi", "ω": "omega",
    "α": "alpha", "β": "beta", "γ": "gamma", "ρ": "rho", "σ": "sigma", "τ": "tau", "ε": "epsilon",
    "ε₀": "epsilon zero", "μ₀": "mu zero", "°C": "degree Celsius", "Å": "angstrom",
}

ELEMENTS_SAFE = {
    "Li": "L i", "Be": "B e", "Ne": "N e", "Na": "N a", "Mg": "M g", "Al": "A l", "Si": "S i", 
    "Cl": "C l", "Ar": "A r", "Ca": "C a", "Sc": "S c", "Ti": "T i", "Cr": "C r", "Mn": "M n", "Fe": "F e", 
    "Co": "C o", "Ni": "N i", "Cu": "C u", "Zn": "Z n", "Ga": "G a", "Ge": "G e", "Se": "S e", 
    "Br": "B r", "Kr": "K r", "Rb": "R b", "Sr": "S r", "Zr": "Z r", "Nb": "N b", "Mo": "M o", "Tc": "T c", 
    "Ru": "R u", "Rh": "R h", "Pd": "P d", "Ag": "A g", "Cd": "C d", "Sn": "S n", "Sb": "S b", 
    "Te": "T e", "Xe": "X e", "Cs": "C s", "Ba": "B a", "Pt": "P t", "Au": "A u", "Hg": "H g", "Pb": "P b", 
    "Bi": "B i", "Po": "P o", "Rn": "R n", "Fr": "F r", "Ra": "R a"
}

DANGEROUS_ELEMENTS = {
    "He": "H e", "In": "I n", "At": "A t", "As": "A s", "No": "N o", "Am": "A m", "Is": "I s", "So": "S o", "Pa": "P a"
}

CONTEXT_SYMBOLS = {
    "F": {"force": "Force"},
    "a": {"acceleration": "acceleration"},
    "P": {"pressure": "Pressure", "power": "Power", "momentum": "momentum"},
    "p": {"pressure": "pressure", "power": "power", "momentum": "momentum"},
    "v": {"velocity": "velocity", "voltage": "voltage", "volt": "volt"},
    "V": {"volt": "Volt", "volume": "Volume", "velocity": "Velocity"},
    "m": {"mass": "mass", "meter": "meter"},
    "M": {"mass": "Mass", "molarity": "Molarity", "molar": "Molar"},
    "E": {"energy": "Energy", "electric field": "Electric Field", "emf": "E M F"},
    "T": {"temperature": "Temperature", "tension": "Tension", "period": "Period", "tesla": "Tesla"},
    "q": {"charge": "charge"},
    "Q": {"charge": "Charge", "heat": "Heat"},
    "I": {"current": "Current", "moment of inertia": "Moment of Inertia", "iodine": "Iodine"},
    "L": {"length": "length", "liter": "liter", "inductance": "inductance"},
}

# Words to ignore (MUST BE UPPERCASE)
EXCLUDE_LIST = {
    "CORE", "CONCEPT", "STEP", "SOLUTION", "WHY", "THIS", "ANSWER", "COMMON", "MISTAKES", "FINAL", "RESULT", "NEET", 
    "RECAP", "SUMMARY", "THE", "AND", "FOR", "WITH", "THAT", "FROM", "THEY", "THEM",
    "A", "AN", "IN", "AT", "AS", "NO", "US", "BE", "HE", "AM", "IS", "SO", "IT", "TO", "OF", "IF", "BY", "WE", "I", "DO", "OR", "BUT", "ALL"
}

def space_formula(f):
    res = re.sub(r'([A-Z][a-z]?)', r' \1', f)
    res = re.sub(r'([0-9])', r' \1', res)
    return " ".join(res.split())

def is_chemical_formula(s):
    if len(s) < 2: return False
    # Avoid just numbers
    if s.isdigit(): return False
    if re.match(r'^[A-Z][a-z]?\d*([A-Z][a-z]?\d*)*[\+\-]?$', s):
        if s.upper() in EXCLUDE_LIST: return False
        return True
    return False

def process_file(file_path):
    print(f"ULTRA-CLEAN: {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for item in data:
            if not isinstance(item, dict): continue
            
            keywords = {}
            full_text = " ".join([
                item.get("text", ""),
                item.get("basic_answer", ""),
                item.get("explanation", ""),
                " ".join(item.get("options", []))
            ])
            text_lower = full_text.lower()
            subject = item.get("subject", "")

            # A. PRE-DEFINED
            for k, v in SYSTEM_PRONUNCIATIONS.items():
                if not k[0].isalnum():
                    if k in full_text: keywords[k] = v
                else:
                    if re.search(r'\b' + re.escape(k) + r'\b', full_text):
                        keywords[k] = v

            # B. FORMULAS
            words = re.findall(r"\b[A-Za-z0-9\+\-]+\b", full_text)
            for w in set(words):
                if is_chemical_formula(w):
                    spaced = space_formula(w)
                    if spaced != w: keywords[w] = spaced

            # C. CONTEXTUALS
            if subject in ["Physics", "Chemistry"]:
                for sym, contexts in CONTEXT_SYMBOLS.items():
                    if re.search(r'\b' + re.escape(sym) + r'\b', full_text):
                        # Skip choice labels
                        if re.search(r'\(?[' + sym + r']\)?', full_text) and sym in "ABCD":
                            if re.search(r'(option|choice)\s+' + re.escape(sym), full_text, re.I):
                                continue
                        
                        matched = None
                        for ck, cv in contexts.items():
                            if re.search(r'\b' + re.escape(ck) + r'\b', text_lower):
                                matched = cv
                                break
                        if matched and sym.upper() not in EXCLUDE_LIST:
                            keywords[sym] = matched

            # D. ELEMENTS
            if subject == "Chemistry":
                for el, el_p in ELEMENTS_SAFE.items():
                    if re.search(r'\b' + re.escape(el) + r'\b', full_text):
                        keywords[el] = el_p
                for el, el_p in DANGEROUS_ELEMENTS.items():
                    if re.search(r'\b' + re.escape(el) + r'\b', full_text):
                        if any(re.search(r'\b' + x + r'\b', text_lower) for x in ["ion", "atom", "element", "formula", "compound", "reaction", "empirical"]):
                            if not re.search(r'^' + re.escape(el) + r'\s', full_text.strip()):
                                keywords[el] = el_p

            # E. NUMBERED
            var_nums = re.findall(r"\b([A-Za-z])([0-9₀₁₂₃₄₅₆₇₈₉])\b", full_text)
            sub_map = str.maketrans("₀₁₂₃₄₅₆₇₈₉", "0123456789")
            for var, num_raw in var_nums:
                term = f"{var}{num_raw}"
                num = num_raw.translate(sub_map)
                base = keywords.get(var, var)
                if len(base) == 1 and var in CONTEXT_SYMBOLS:
                    for ck, cv in CONTEXT_SYMBOLS[var].items():
                        if re.search(r'\b' + re.escape(ck) + r'\b', text_lower):
                            base = cv
                            break
                keywords[term] = f"{base} {num}"

            # F. ACRONYMS
            for acr in set(re.findall(r"\b([A-Z]{3,5})\b", full_text)):
                if acr.upper() not in EXCLUDE_LIST:
                    keywords[acr] = " ".join(list(acr))

            # Final filtering
            final = {}
            for k, v in keywords.items():
                if k.upper() in EXCLUDE_LIST: continue
                if k == v: continue
                final[k] = v
            item["keywords"] = final

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Success: {file_path}")
    except Exception as e:
        print(f"Error: {file_path} - {e}")

mock_dirs = ["mock_test_paper_1", "mock_test_paper_2", "mock_test_paper_3", "mock_test_paper_4", "mock_test_paper_5", "mock_test_paper_6", "sample_mock_test_paper_1"]
base_path = r"d:\New folder\Coding\YUGA\mcq-backend\data\questions\mock_test"
for md in mock_dirs:
    p_num = md.split('_')[-1]
    for fn in [f"mock_paper_{p_num}.json", "mock_paper_1.json"]:
        fpath = os.path.join(base_path, md, fn)
        if os.path.exists(fpath): process_file(fpath)
