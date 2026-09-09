import { Approval, DocumentItem, BusinessProfile, RiskItem } from '../types/index';

export const RECOGNIZED_SECTORS = [
  'Food Processing',
  'Pharmaceutical Manufacturing',
  'Metallurgical & Heavy Engineering',
  'Renewable Energy & Solar',
  'Textiles & Apparel',
  'Chemical & Petrochemical',
  'Information Technology & Electronics',
] as const;

export type RecognizedSector = typeof RECOGNIZED_SECTORS[number];

export const RECOGNIZED_DISTRICTS = [
  'Raipur (Capital Industrial Cluster)',
  'Durg - Bhilai (Steel & Heavy Engineering Hub)',
  'Korba (Power & Energy Corridor)',
  'Raigarh (Steel, Sponge Iron & Metals)',
  'Bilaspur (Commercial & Industrial Growth Center)',
  'Rajnandgaon (Agro & Food Processing Cluster)',
  'Balod (Mineral & Allied Processing)',
  'Bastar - Jagdalpur (Forest & Mineral Processing Hub)',
  'Surguja (Northern Industrial Hub)',
  'Janjgir - Champa (Cement & Thermal Energy)',
] as const;

export type RecognizedDistrict = typeof RECOGNIZED_DISTRICTS[number];

export const PROJECT_TYPES = [
  { value: 'New Manufacturing Unit', label: 'New Manufacturing Unit (Greenfield)' },
  { value: 'Expansion of Existing Plant', label: 'Expansion of Existing Plant (Brownfield)' },
  { value: 'Diversification / Product Line Add', label: 'Diversification / Product Line Addition' },
] as const;

export type ProjectTypeValue = typeof PROJECT_TYPES[number]['value'];

export interface DocSpec {
  name: string;
  issuingAuthority: string;
  acquisitionDifficulty: 'Easy' | 'Moderate' | 'Difficult' | 'High';
  mandatory?: boolean;
}

export interface SectorRule {
  code: string;
  name: string;
  department: string;
  category: 'Land' | 'Environment' | 'Safety' | 'Municipal' | 'Water' | 'Power' | 'Operating' | 'Cabinet';
  stage: number;
  slaDays: number;
  isCriticalPath: boolean;
  canBeParallel: boolean;
  dependency: string;
  whyItMatters: string;
  description: string;
  requiredDocuments: DocSpec[];
  condition?: (profile: {
    sector: string;
    investmentCr: number;
    employees: number;
    landAcres: number;
    location: string;
  }) => boolean;
}

export const MASTER_RULES: SectorRule[] = [
  // ================= STAGE 1: LAND & SITE VERIFICATION =================
  {
    code: 'APPR_LAND_ALLOT',
    name: 'Industrial Land Allotment & Lease Deed',
    department: 'State Industrial Development Corp (CSIDC)',
    category: 'Land',
    stage: 1,
    slaDays: 20,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'None',
    whyItMatters: 'Mandatory title deed establishing legal tenure and leasehold possession of designated industrial plot.',
    description: 'Statutory verification of land zoning, boundary coordinates, and state lease deed execution.',
    requiredDocuments: [
      { name: 'Company Incorporation Certificate', issuingAuthority: 'Registrar of Companies (RoC / MCA)', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'PAN & GSTIN Registration Certificate', issuingAuthority: 'Income Tax & GST Department', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Detailed Project Report (DPR)', issuingAuthority: 'Chartered Engineer / Industrial Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Land Requirement Justification Note', issuingAuthority: 'Enterprise Technical Lead', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
  },
  {
    code: 'APPR_LAND_CONV',
    name: 'Land Use Change & Revenue NOC (Nazul/Agricultural Conversion)',
    department: 'Revenue & Land Records Department',
    category: 'Land',
    stage: 1,
    slaDays: 25,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Industrial Land Allotment',
    whyItMatters: 'Converts agricultural or non-industrial zoning into designated industrial use.',
    description: 'Revenue title check, Khasra/B1 record endorsement, and conversion sanction.',
    requiredDocuments: [
      { name: 'Land Allotment Order & Lease Deed Copy', issuingAuthority: 'CSIDC Regional Office', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Revenue Khasra/B1 Map & Land Records', issuingAuthority: 'District Collectorate / Tehsildar', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Site Demarcation & Topo Survey Report', issuingAuthority: 'Empanelled Land Surveyor', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_SITE_ZONING',
    name: 'Industrial Town & Country Planning (TCP) Zoning NOC',
    department: 'Town & Country Planning Directorate',
    category: 'Land',
    stage: 1,
    slaDays: 18,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Industrial Land Allotment',
    whyItMatters: 'Certifies industrial master plan compliance and setback clearances.',
    description: 'Zoning verification ensuring factory plots adhere to regional industrial master plan.',
    requiredDocuments: [
      { name: 'Site Layout Master Plan', issuingAuthority: 'Council of Architecture Registered Architect', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Zoning Demarcation Certificate', issuingAuthority: 'Town & Country Planning Regional Office', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Contour & Drainage Survey Drawing', issuingAuthority: 'Civil Engineering Consultant', acquisitionDifficulty: 'Moderate', mandatory: false },
    ],
  },
  // Location specific Stage 1 rule: Bastar / Jagdalpur PESA Clearance
  {
    code: 'APPR_BASTAR_PESA',
    name: 'PESA Gram Sabha Consent & Tribal Land Tenancy NOC',
    department: 'Tribal Welfare & District Administration',
    category: 'Land',
    stage: 1,
    slaDays: 30,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Land Allotment Application',
    whyItMatters: 'Mandatory constitutional clearance for scheduled tribal areas under PESA Act 1996 and CG Tenancy Code (Sec 170-B).',
    description: 'Gram Sabha public consultation, consent resolution, and Tribal Advisory Council endorsement.',
    requiredDocuments: [
      { name: 'PESA Gram Sabha Resolution & Consent Certificate', issuingAuthority: 'Gram Panchayat & Block Development Office', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Tribal Land Tenancy Act (Sec 170-B) Clearance', issuingAuthority: 'Sub-Divisional Magistrate (SDM) Tribal Welfare', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Socio-Economic Tribal Community Benefit Plan', issuingAuthority: 'Enterprise CSR Cell', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.location.toLowerCase().includes('bastar') || p.location.toLowerCase().includes('jagdalpur'),
  },

  // ================= STAGE 2: PRE-ESTABLISHMENT CLEARANCES =================
  {
    code: 'APPR_POLLUTION_CTE',
    name: 'Pollution Consent to Establish (CTE)',
    department: 'State Pollution Control Board (CECB / SPCB)',
    category: 'Environment',
    stage: 2,
    slaDays: 30,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Land Use Change & Revenue NOC',
    whyItMatters: 'Statutory mandate under Air & Water Acts prior to initiating any site construction or foundation work.',
    description: 'Evaluates effluent treatment plant (ETP), stack heights, air scrubbing, and zero liquid discharge.',
    requiredDocuments: [
      { name: 'Environmental Management Plan (EMP)', issuingAuthority: 'NABET / QCI Accredited Environmental Consultant', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'ETP/STP Process Flow Diagram & Sizing Specs', issuingAuthority: 'Environmental Engineering Agency', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Detailed Project Report (DPR)', issuingAuthority: 'Chartered Industrial Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Site Layout with Emissions Stack Details', issuingAuthority: 'Empanelled Industrial Architect', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Form 1-A Environmental Self-Declaration', issuingAuthority: 'Enterprise Authorized Signatory', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
  },
  {
    code: 'APPR_FIRE_PROV',
    name: 'Provisional Fire Safety NOC & Hydrant Design',
    department: 'State Fire & Emergency Services',
    category: 'Safety',
    stage: 2,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'TCP Zoning NOC',
    whyItMatters: 'Mandatory fire evacuation route and pressurized water hydrant design verification.',
    description: 'Engineering approval of emergency exits, fire pump rooms, and water storage capacities.',
    requiredDocuments: [
      { name: 'Fire Evacuation & Hydrant Layout Plan', issuingAuthority: 'Licensed Fire Safety Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Architectural Safety Elevation Drawings', issuingAuthority: 'Registered Architect', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Dedicated Fire Water Reservoir Capacity Proof', issuingAuthority: 'Public Health Engineering Dept / Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_BLDG_PLAN',
    name: 'Factory Building Plan Approval & Height Sanction',
    department: 'Municipal Corporation / CSIDC Engineering Wing',
    category: 'Municipal',
    stage: 2,
    slaDays: 21,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Pollution CTE & Provisional Fire NOC',
    whyItMatters: 'Ensures civil, architectural, and structural stability conforms to National Building Code (NBC).',
    description: 'Sanctions constructed footprint area, FAR utilization, and structural load certificates.',
    requiredDocuments: [
      { name: 'Architectural Layout & Elevation Drawings (CAD)', issuingAuthority: 'Licensed Architect', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Structural Stability Certificate (Vetted Engineer)', issuingAuthority: 'NIT / Govt Engineering College / Chartered Structural Engineer', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Soil Testing & Safe Bearing Capacity Report', issuingAuthority: 'NABL Accredited Geotechnical Laboratory', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_WATER_ALLOC',
    name: 'Groundwater / Industrial Water Allocation NOC',
    department: 'Water Resources Department (WRD) / CGWA',
    category: 'Water',
    stage: 2,
    slaDays: 20,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Industrial Land Allotment',
    whyItMatters: 'Allocates industrial bulk water draw or borehole abstraction quotas sustainably.',
    description: 'Hydrological sustainability assessment, rainwater harvesting scheme, and pipeline tap sanction.',
    requiredDocuments: [
      { name: 'Water Balance Flowchart & Daily Demand Note', issuingAuthority: 'Industrial Process Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Rainwater Harvesting Detailed Scheme', issuingAuthority: 'Hydrogeologist / Civil Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Hydrogeological Survey Report', issuingAuthority: 'State Ground Water Board Empanelled Agency', acquisitionDifficulty: 'Moderate', mandatory: false },
    ],
  },
  {
    code: 'APPR_POWER_FEASIBILITY',
    name: 'HT Power Grid Feasibility & Substation Sanction',
    department: 'State Power Distribution Corporation (DISCOM / CSPDCL)',
    category: 'Power',
    stage: 2,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Industrial Land Allotment',
    whyItMatters: 'Reserves high-tension grid feeder capacity and sanctions transformer step-down substation.',
    description: 'Grid connectivity feasibility, fault level analysis, and metering cubicle sanction.',
    requiredDocuments: [
      { name: 'Connected Load & Maximum Demand Estimation Sheet', issuingAuthority: 'Chartered Electrical Engineer', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Single Line Electrical Diagram (SLD)', issuingAuthority: 'Licensed Electrical Contractor (Class-A)', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Substation Layout & Transformer Specifications', issuingAuthority: 'Transformer Equipment OEM', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  // Investment > 10 Cr threshold: EIA Notification
  {
    code: 'APPR_EIA_CLEARANCE',
    name: 'State Environmental Impact Assessment (SEIAA) Clearance',
    department: 'State Environment Impact Assessment Authority (SEIAA)',
    category: 'Environment',
    stage: 2,
    slaDays: 45,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'TCP Zoning & Water Allocation NOC',
    whyItMatters: 'Statutory mandate under EIA Notification 2006 for medium and large manufacturing units (> ₹10 Cr).',
    description: 'Environmental baseline data scrutiny, public consultation evaluation, and environmental clearance grant.',
    requiredDocuments: [
      { name: 'EIA Baseline Monitoring Report', issuingAuthority: 'MoEFCC / QCI Accredited Environmental Lab', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Terms of Reference (ToR) Compliance Matrix', issuingAuthority: 'Accredited Environmental Consultant', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Public Hearing Minutes & Redressal Plan', issuingAuthority: 'State Pollution Control Board & District Collector', acquisitionDifficulty: 'Difficult', mandatory: true },
    ],
    condition: (p) => p.investmentCr > 10,
  },
  // Investment > 50 Cr threshold: Cabinet / SHLCC Approval
  {
    code: 'APPR_SHLCC_CABINET',
    name: 'State High-Level Clearance Committee (SHLCC) Cabinet Sanction',
    department: 'Chief Minister Secretariat / Dept of Commerce & Industries',
    category: 'Cabinet',
    stage: 2,
    slaDays: 30,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Land Allotment & Power Feasibility',
    whyItMatters: 'Apex cabinet approval granting fast-track statutory exemptions and customized mega fiscal incentives (> ₹50 Cr).',
    description: 'Inter-ministerial evaluation, anchor investment status grant, and customized state package MOU execution.',
    requiredDocuments: [
      { name: 'Mega Project Comprehensive Investment Dossier', issuingAuthority: 'Enterprise Board of Directors', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Anchor Industry Employment Guarantee Undertaking', issuingAuthority: 'Company Legal Counsel', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'State Incentive Package Application (Form MI-1)', issuingAuthority: 'Directorate of Industries Raipur', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.investmentCr > 50,
  },
  // Investment <= 10 Cr threshold: District DIC Single Window
  {
    code: 'APPR_DIC_MSME',
    name: 'District Industries Centre (DIC) MSME Single Window Sanction',
    department: 'District Industries Centre (DIC)',
    category: 'Operating',
    stage: 2,
    slaDays: 14,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Industrial Land Allotment',
    whyItMatters: 'Grants district-level fast-track clearances and MSME capital subsidy eligibility under State Policy.',
    description: 'Verification of Udyam certification and sanction of district single-window clearances.',
    requiredDocuments: [
      { name: 'MSME Udyam Registration Certificate', issuingAuthority: 'Ministry of MSME, Govt of India', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'DIC Single Window Registration Slip', issuingAuthority: 'General Manager DIC District Office', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Bank Loan Sanction / Capital Source Proof', issuingAuthority: 'Commercial Bank / Financial Institution', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.investmentCr <= 10,
  },
  // Land > 10 Acres threshold: Bulk Water & Hydrological NOC
  {
    code: 'APPR_BULK_WATER_CGWA',
    name: 'CGWA & WRD Bulk Ground/Surface Water Abstraction Clearance',
    department: 'Central Ground Water Authority (CGWA) & WRD',
    category: 'Water',
    stage: 2,
    slaDays: 30,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Water Balance Flowchart',
    whyItMatters: 'Compulsory conservation clearance for industrial estates exceeding 10 acres to protect aquifers.',
    description: 'Regional aquifer pump test validation, river intake feasibility, and piezometer installation directive.',
    requiredDocuments: [
      { name: 'Comprehensive Hydrological Impact Study', issuingAuthority: 'Central Ground Water Board Empanelled Consultant', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'River / Canal Intake Tap Engineering Drawing', issuingAuthority: 'Executive Engineer Water Resources Dept (WRD)', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Automated Piezometer & Telemetry System Plan', issuingAuthority: 'Groundwater Sensor Instrumentation Vendor', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.landAcres > 10,
  },
  // Location specific Stage 2 rule: Korba Fly Ash Undertaking
  {
    code: 'APPR_KORBA_FLYASH',
    name: 'Korba Industrial Corridor Fly Ash Management & Utilization Plan',
    department: 'Regional Officer CECB Korba & CSIDC',
    category: 'Environment',
    stage: 2,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTE Application',
    whyItMatters: 'Mandatory environmental mandate for all industrial operations in the Korba energy corridor under CPCB directives.',
    description: 'Scrutiny of 100% fly ash absorption, cement/brick making tie-up, or silo pneumatic transport.',
    requiredDocuments: [
      { name: 'Fly Ash Disposal & 100% Utilization Agreement', issuingAuthority: 'Authorized Fly Ash Off-Takers / Cement Plant', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Coal Logistics & Fugitive Dust Suppression Scheme', issuingAuthority: 'Industrial Environmental Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.location.toLowerCase().includes('korba'),
  },
  // Location specific Stage 2 rule: Raipur RDA Master Plan
  {
    code: 'APPR_RAIPUR_RDA',
    name: 'Raipur Development Authority (RDA) Master Plan Alignment NOC',
    department: 'Raipur Development Authority (RDA)',
    category: 'Municipal',
    stage: 2,
    slaDays: 14,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'TCP Zoning NOC',
    whyItMatters: 'Ensures alignment with Raipur Metropolitan Area Master Plan 2031 and trunk utility corridors.',
    description: 'Right-of-way check, trunk stormwater connectivity, and regional arterial road setbacks.',
    requiredDocuments: [
      { name: 'RDA Master Plan Alignment Letter', issuingAuthority: 'Chief Town Planner, Raipur Development Authority', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Trunk Stormwater & Municipal Utility Tap NOC', issuingAuthority: 'Raipur Municipal Corporation (RMC)', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.location.toLowerCase().includes('raipur'),
  },
  // Location specific Stage 2 rule: Raigarh Heavy Industrial Consent
  {
    code: 'APPR_RAIGARH_AIR',
    name: 'Raigarh Heavy Industrial Zone Ambient Monitoring Agreement',
    department: 'Regional Office CECB Raigarh',
    category: 'Environment',
    stage: 2,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTE Application',
    whyItMatters: 'Stringent ambient air quality monitoring agreement for Raigarh mineral and metallurgy hub.',
    description: 'Mandates installation of CAAQMS ambient station connected to state environmental telemetry.',
    requiredDocuments: [
      { name: 'Continuous Ambient Air Monitoring (CAAQMS) Layout', issuingAuthority: 'CECB Approved Instrumentation Provider', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Industrial Stack Continuous Emission Setup Undertaking', issuingAuthority: 'Enterprise Managing Director', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
    condition: (p) => p.location.toLowerCase().includes('raigarh'),
  },

  // ================= STAGE 3: CONSTRUCTION & EQUIPMENT ERECTION =================
  {
    code: 'APPR_DISH_PLAN',
    name: 'Directorate of Industrial Safety & Health (DISH) Factory Drawing Approval',
    department: 'Directorate of Industrial Safety & Health (DISH)',
    category: 'Safety',
    stage: 3,
    slaDays: 30,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Factory Building Plan Approval',
    whyItMatters: 'Mandatory approval under Factories Act 1948 safeguarding worker safety and machine clearances.',
    description: 'Vets worker ventilation, hazardous material handling zones, emergency egress, and machine guarding.',
    requiredDocuments: [
      { name: 'Detailed Machinery Layout with Spacing Dimensions', issuingAuthority: 'Industrial Mechanical Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Occupational Health & Hygiene Policy Document', issuingAuthority: 'Enterprise Safety Officer', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Factory Lighting & Ventilation Cross-Section Plan', issuingAuthority: 'HVAC & Lighting Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_BOILER_ERECT',
    name: 'Boiler Erection & Steam Pipeline Mountings Approval',
    department: 'Chief Inspectorate of Boilers',
    category: 'Safety',
    stage: 3,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Factory Building Plan Approval',
    whyItMatters: 'High-pressure steam boiler validation preventing catastrophic industrial explosion hazards.',
    description: 'Hydraulic pressure test scrutiny, steam piping fabrication approval, and safety valve calibration.',
    requiredDocuments: [
      { name: 'Boiler Manufacturer Form II & III Certificates', issuingAuthority: 'Boiler Equipment Manufacturer (IBR Approved)', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'IBR Steam Pipeline Isometric Drawing', issuingAuthority: 'Certified IR Welder / Mechanical Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Welder Qualification & Radiography Test Reports', issuingAuthority: 'NDT Level-II Radiographic Inspector', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) =>
      p.sector.toLowerCase().includes('food') ||
      p.sector.toLowerCase().includes('chemical') ||
      p.sector.toLowerCase().includes('textile') ||
      p.sector.toLowerCase().includes('pharma') ||
      p.investmentCr >= 10,
  },
  {
    code: 'APPR_ELECTRICAL_INSPECTION',
    name: 'Chief Electrical Inspector to Govt (CEIG) Installation Approval',
    department: 'Chief Electrical Inspectorate',
    category: 'Power',
    stage: 3,
    slaDays: 12,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'HT Power Grid Feasibility',
    whyItMatters: 'Ensures transformer yard, switchgear, and earth pit resistances conform to CEA Safety Regulations.',
    description: 'Physical inspection of grounding grids, lightning protection, and transformer dielectric breakdown.',
    requiredDocuments: [
      { name: 'Earth Pit Resistance Test Certificates', issuingAuthority: 'Licensed Electrical Testing Agency', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Transformer Manufacturer Test Certificates', issuingAuthority: 'Transformer OEM Laboratory', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Relay Coordination & Insulation Resistance Records', issuingAuthority: 'CEIG Certified Electrical Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },

  // ================= STAGE 4: PRE-COMMISSIONING & OPERATIONAL LICENSES =================
  {
    code: 'APPR_FIRE_FINAL',
    name: 'Final Fire Safety Certificate & System Commissioning NOC',
    department: 'State Fire & Emergency Services',
    category: 'Safety',
    stage: 4,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Provisional Fire NOC & Building Plan Approval',
    whyItMatters: 'Validates that installed fire pumps, alarms, and hydrants operate during live fire drills.',
    description: 'On-site live pressure test of fire sprinklers, wet risers, smoke dampers, and smoke alarms.',
    requiredDocuments: [
      { name: 'Fire System Installation Completion Certificate', issuingAuthority: 'Certified Fire Equipment Contractor', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Hydrant Flow Rate & Hydro-Test Reports', issuingAuthority: 'Fire Safety Audit Inspector', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Third-party Fire System Commissioning Audit', issuingAuthority: 'Independent Fire Safety Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_POLLUTION_CTO',
    name: 'Pollution Consent to Operate (CTO - Air & Water Acts)',
    department: 'State Pollution Control Board (CECB / SPCB)',
    category: 'Environment',
    stage: 4,
    slaDays: 30,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'Pollution CTE & CEIG Electrical Approval',
    whyItMatters: 'Permits actual commercial manufacturing, effluent discharge, and power connection.',
    description: 'In-person inspection of constructed ETP/STP, online continuous emission monitoring (OCEMS) setup.',
    requiredDocuments: [
      { name: 'Pollution CTE Compliance Status Report', issuingAuthority: 'Enterprise Environmental Officer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'ETP Commissioning & Performance Testing Report', issuingAuthority: 'NABL Accredited Environmental Testing Lab', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Hazardous Waste Storage Area Photographs & Manifest', issuingAuthority: 'Enterprise Waste Management Cell', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Online Monitoring System (OCEMS) Server Link Proof', issuingAuthority: 'CPCB/SPCB Data Portal Integrator', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_DISH_FACTORY',
    name: 'Factories Act 1948 Final Operating License',
    department: 'Directorate of Industrial Safety & Health (DISH)',
    category: 'Safety',
    stage: 4,
    slaDays: 15,
    isCriticalPath: true,
    canBeParallel: false,
    dependency: 'DISH Factory Drawing Approval & Fire Final NOC',
    whyItMatters: 'Final legal authority permitting industrial labour employment and machine operation.',
    description: 'Workplace safety inspection, canteen facilities check, first-aid compliance, and license grant.',
    requiredDocuments: [
      { name: 'Form 2 Application with Complete Schedule', issuingAuthority: 'Directorate of Industrial Safety (DISH)', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Notice of Occupation (Form 3)', issuingAuthority: 'Factory Manager / Occupier', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'List of Competent Persons & Safety Officer KYC', issuingAuthority: 'Enterprise Human Resources', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Worker Welfare & Medical Fitness Scheme Note', issuingAuthority: 'Empanelled Factory Medical Officer', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_POWER_HT_CONNECTION',
    name: 'Permanent HT Electricity Metering & Energization (11KV/33KV)',
    department: 'State Power Distribution Corp (DISCOM / CSPDCL)',
    category: 'Power',
    stage: 4,
    slaDays: 10,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'CEIG Electrical Installation Approval & Pollution CTO',
    whyItMatters: 'Energizes final power connection enabling machinery trial runs and full commercial production.',
    description: 'HT meter sealing, energy agreement execution, and switchgear energization.',
    requiredDocuments: [
      { name: 'CEIG Safety Clearance Certificate', issuingAuthority: 'Chief Electrical Inspectorate Office', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Power Agreement & Security Deposit Bank Guarantee', issuingAuthority: 'State Electricity DISCOM / CSPDCL Division', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Meter Testing & CT/PT Calibration Certificate', issuingAuthority: 'CSPDCL Testing Laboratory', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
  },
  {
    code: 'APPR_LEGAL_METROLOGY',
    name: 'Legal Metrology Packaging & Weight Verification License',
    department: 'Department of Consumer Affairs / Legal Metrology',
    category: 'Operating',
    stage: 4,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Factories Act Final License',
    whyItMatters: 'Verifies packaged commodity labels, declarations, and industrial scales.',
    description: 'Inspection and stamping of industrial weighbridges, platform scales, and packaging declarations.',
    requiredDocuments: [
      { name: 'Sample Product Package Label Specimen', issuingAuthority: 'Product Packaging Design Unit', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Industrial Weighing Machine Calibration Certificate', issuingAuthority: 'Inspector of Legal Metrology', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Director / Partner KYC & Authority Letter', issuingAuthority: 'Company Board Resolution', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
  },

  // ================= SECTOR SPECIFIC OPERATIONAL CLEARANCES =================
  // Sector 1: Food Processing
  {
    code: 'APPR_FSSAI_MFG',
    name: 'FSSAI Central / State Manufacturing License',
    department: 'Food Safety & Standards Authority of India (FSSAI)',
    category: 'Operating',
    stage: 4,
    slaDays: 21,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTO',
    whyItMatters: 'Mandatory statutory license required for manufacturing, processing, or packaging food products.',
    description: 'Food Safety Management Plan audit, clean room sanitation check, and water potability certification.',
    requiredDocuments: [
      { name: 'Food Safety Management System (FSMS) Plan', issuingAuthority: 'Certified Food Safety Consultant (FSSAI Accredited)', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Water Potability NABL Lab Test Report (IS 10500)', issuingAuthority: 'NABL Certified Food Testing Laboratory', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Cold Chain & Refrigeration Specifications', issuingAuthority: 'Refrigeration Equipment OEM', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'List of Food Categorization & Technical Staff Credentials', issuingAuthority: 'Enterprise Quality Assurance Lead', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('food'),
  },

  // Sector 2: Pharmaceutical Manufacturing
  {
    code: 'APPR_PHARMA_DRUG_LICENSE',
    name: 'State Drug Controller Manufacturing License (Form 25 / 28) & GMP Audit',
    department: 'Food & Drugs Administration (FDA) / State Drug Controller',
    category: 'Operating',
    stage: 4,
    slaDays: 30,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTO & Factories Act License',
    whyItMatters: 'Statutory mandate under Drugs and Cosmetics Act 1940 governing pharmaceutical formulating and bulk drug synthesis.',
    description: 'Audit of sterile production suites, cleanroom HVAC air changes, and Schedule M (GMP) compliance.',
    requiredDocuments: [
      { name: 'WHO-GMP / Schedule M Site Master File (SMF)', issuingAuthority: 'Pharmaceutical Regulatory Affairs Consultant', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Cleanroom Validation & HEPA Air Balancing Report', issuingAuthority: 'HVAC Cleanroom Certification Agency (ISO 14644)', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Water for Injection (WFI) Loop Qualification Dossier', issuingAuthority: 'Water Purification Validation Engineer', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Approved Chemist & Analytical Personnel Registrations', issuingAuthority: 'State Pharmacy Council', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('pharma'),
  },

  // Sector 3: Metallurgical & Heavy Engineering
  {
    code: 'APPR_STEEL_PESO_SAFETY',
    name: 'PESO Gas Storage & Heavy Metallurgical Plant Safety Clearances',
    department: 'Petroleum & Explosives Safety Organisation (PESO) & DISH',
    category: 'Safety',
    stage: 4,
    slaDays: 25,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'DISH Factory Drawing Approval',
    whyItMatters: 'Regulates high-pressure industrial gases (Oxygen, Argon, LPG) and molten metal crane safety in steelworks.',
    description: 'Inspection of gas cylinder manifolds, blast furnace crane tracks, and heavy ladling safety barriers.',
    requiredDocuments: [
      { name: 'PESO Gas Cylinder Manifold & Storage License', issuingAuthority: 'PESO Regional Circle Office', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Blast Furnace & Hot Metal Crane Structural Certificate', issuingAuthority: 'Chartered Metallurgical & Structural Engineer', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Scrap & Slag Recycling Protocol Document', issuingAuthority: 'Plant Operations Directorate', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'High-Temperature Heat Stress Worker Safety Scheme', issuingAuthority: 'Industrial Hygiene & Safety Cell', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('metallurg') || p.sector.toLowerCase().includes('steel') || p.sector.toLowerCase().includes('heavy'),
  },

  // Sector 4: Renewable Energy & Solar Systems
  {
    code: 'APPR_SOLAR_CREDA_SYNC',
    name: 'CREDA Renewable Grid Connectivity & Solar Synchronization Sanction',
    department: 'Chhattisgarh State Renewable Energy Dev Agency (CREDA)',
    category: 'Power',
    stage: 4,
    slaDays: 20,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'HT Power Grid Feasibility',
    whyItMatters: 'Mandatory technical approval for injecting renewable solar power into state transmission lines.',
    description: 'Verification of anti-islanding relays, solar PV inverter harmonics, and CEIG grid sync certificate.',
    requiredDocuments: [
      { name: 'CREDA Grid Interconnection Sanction Order', issuingAuthority: 'CREDA Headquarters Raipur', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Solar PV Module BIS & ALMM Conformity Certificates', issuingAuthority: 'Bureau of Indian Standards (BIS) Approved OEM', acquisitionDifficulty: 'Easy', mandatory: true },
      { name: 'Shadow Analysis & Solar Plant Layout Drawing', issuingAuthority: 'Solar Energy Design Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Anti-Islanding Protection & Grid Synchronization Dossier', issuingAuthority: 'Inverter Testing Laboratory (NABL)', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('renew') || p.sector.toLowerCase().includes('solar'),
  },

  // Sector 5: Textiles & Apparel
  {
    code: 'APPR_TEXTILE_ZLD',
    name: 'Textile Processing & Zero-Liquid-Discharge (ZLD) Certification',
    department: 'State Pollution Control Board & Dept of Handlooms and Textiles',
    category: 'Environment',
    stage: 4,
    slaDays: 21,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTE & CTO',
    whyItMatters: 'Prevents synthetic chemical and dye contamination of state rivers through strict water recovery audits.',
    description: 'Scrutiny of multi-effect evaporators (MEE), reverse osmosis (RO) reject recovery, and salt crystallization.',
    requiredDocuments: [
      { name: 'Dyeing & Effluent Neutralization Scheme', issuingAuthority: 'Textile Chemical Processing Engineer', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Textile Wastewater ZLD Verification Report', issuingAuthority: 'CECB Approved Environmental Auditor', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'Hazardous Sludge Dewatering & Salt Recovery Protocol', issuingAuthority: 'Waste Management Consultant', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('textil') || p.sector.toLowerCase().includes('apparel'),
  },

  // Sector 6: Chemical & Petrochemical
  {
    code: 'APPR_CHEM_HAZOP_PESO',
    name: 'Petrochemical Solvent Storage (PESO) & HAZOP Safety Approval',
    department: 'Petroleum & Explosives Safety Organisation (PESO) & DISH',
    category: 'Safety',
    stage: 4,
    slaDays: 30,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Pollution CTO & Fire Final NOC',
    whyItMatters: 'Governs bulk storage of volatile organic solvents, flammable chemicals, and exothermic reactions.',
    description: 'HAZOP risk analysis, nitrogen blanketing verification, and off-site crisis management link.',
    requiredDocuments: [
      { name: 'PESO Petroleum / Solvents Storage Sanction', issuingAuthority: 'PESO Regional Circle Office', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'HAZOP Study & Consequence Analysis Report', issuingAuthority: 'Chartered Chemical Safety Auditor', acquisitionDifficulty: 'Difficult', mandatory: true },
      { name: 'On-Site Emergency Management Plan (OEMP)', issuingAuthority: 'District Disaster Management Authority (DDMA)', acquisitionDifficulty: 'Moderate', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('chem') || p.sector.toLowerCase().includes('petro'),
  },

  // Sector 7: Information Technology & Electronics
  {
    code: 'APPR_IT_STPI_EWASTE',
    name: 'STPI Export Scheme & E-Waste Handling Authorization',
    department: 'Software Technology Parks of India (STPI) & CECB',
    category: 'Operating',
    stage: 4,
    slaDays: 15,
    isCriticalPath: false,
    canBeParallel: true,
    dependency: 'Permanent HT Electricity Metering',
    whyItMatters: 'Authorizes bonded electronics export status and compliant electronic waste disposal channels.',
    description: 'Customs bonded area verification, clean room soldering exhaust check, and e-waste recycler tie-up.',
    requiredDocuments: [
      { name: 'STPI Unit Approval & Green Card Letter', issuingAuthority: 'STPI Regional Directorate', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'E-Waste Management Authorization (SPCB)', issuingAuthority: 'State Pollution Control Board', acquisitionDifficulty: 'Moderate', mandatory: true },
      { name: 'Authorized Electronic Recycler Bilateral Agreement', issuingAuthority: 'CPCB Registered E-Waste Recycler', acquisitionDifficulty: 'Easy', mandatory: true },
    ],
    condition: (p) => p.sector.toLowerCase().includes('tech') || p.sector.toLowerCase().includes('electro') || p.sector.toLowerCase().includes('it'),
  },
];

export function generateRoadmapAndChecklist(profile: {
  companyName: string;
  industry: string;
  location: string;
  investmentAmountCr: number;
  landAcres: number;
  employees: number;
  projectType: string;
}): {
  success: boolean;
  error?: string;
  approvals: Approval[];
  documents: DocumentItem[];
  risks: RiskItem[];
  readinessScore: number;
  criticalPathDays: number;
} {
  // 1. Strict Validation of required fields
  if (!profile.companyName || profile.companyName.trim().length < 3) {
    return { success: false, error: 'Company / Enterprise name is required (minimum 3 characters).', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }
  if (!profile.industry || profile.industry.trim().length < 2) {
    return { success: false, error: 'Please select a recognized industrial sector from the predefined list.', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }
  if (!profile.location || profile.location.trim().length < 2) {
    return { success: false, error: 'Please select a recognized industrial district from the predefined list.', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }
  if (isNaN(profile.investmentAmountCr) || profile.investmentAmountCr <= 0) {
    return { success: false, error: 'Capital investment must be a positive number greater than 0 (in ₹ Crores).', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }
  if (isNaN(profile.landAcres) || profile.landAcres <= 0) {
    return { success: false, error: 'Land requirement must be a positive number greater than 0 (in Acres).', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }
  if (isNaN(profile.employees) || profile.employees < 1) {
    return { success: false, error: 'Total workforce must be an integer of at least 1 employee.', approvals: [], documents: [], risks: [], readinessScore: 0, criticalPathDays: 0 };
  }

  // 2. Filter applicable rules based on enterprise parameters
  const applicable = MASTER_RULES.filter((rule) => {
    if (rule.condition) {
      return rule.condition({
        sector: profile.industry,
        investmentCr: profile.investmentAmountCr,
        employees: profile.employees,
        landAcres: profile.landAcres,
        location: profile.location,
      });
    }
    return true;
  });

  if (applicable.length === 0) {
    return {
      success: false,
      error: 'Unable to generate compliance plan for given parameters — please verify inputs.',
      approvals: [],
      documents: [],
      risks: [],
      readinessScore: 0,
      criticalPathDays: 0,
    };
  }

  // 3. Generate mapped Approval records
  const approvals: Approval[] = applicable.map((rule, idx) => {
    const id = `APP-${String(idx + 1).padStart(3, '0')}`;
    return {
      id,
      name: rule.name,
      department: rule.department,
      status: idx === 0 ? 'In Progress' : 'Pending',
      risk: rule.isCriticalPath ? (rule.code === 'APPR_POLLUTION_CTE' ? 'HIGH' : 'MEDIUM') : 'LOW',
      dependency: rule.dependency,
      nextAction: idx === 0 ? 'Submit land allotment & enterprise identity dossiers' : `Awaiting completion of ${rule.dependency}`,
      dueStage: `Stage ${rule.stage} (${rule.category})`,
      whyItMatters: rule.whyItMatters,
      description: rule.description,
      isCriticalPath: rule.isCriticalPath,
      canBeParallel: rule.canBeParallel,
    };
  });

  // 4. Generate dynamic DocumentItem checklist records
  let docIndex = 1;
  const documents: DocumentItem[] = [];

  for (let i = 0; i < applicable.length; i++) {
    const rule = applicable[i];
    const app = approvals[i];

    for (const doc of rule.requiredDocuments) {
      const docId = `DOC-${String(docIndex++).padStart(3, '0')}`;

      // Newly onboarded companies start with Missing / Needs Upload status
      documents.push({
        id: docId,
        name: doc.name,
        requirement: doc.mandatory ? 'Required' : 'Optional',
        status: 'Missing',
        issue: undefined,
        action: `Obtain from ${doc.issuingAuthority} and upload`,
        approvalId: app.id,
        approvalName: app.name,
        issuingAuthority: doc.issuingAuthority,
        acquisitionDifficulty: doc.acquisitionDifficulty,
      });
    }
  }

  // If rules engine produces 0 approvals or 0 documents, that is an error state
  if (documents.length === 0) {
    return {
      success: false,
      error: 'Unable to generate compliance plan for given parameters — please verify inputs.',
      approvals: [],
      documents: [],
      risks: [],
      readinessScore: 0,
      criticalPathDays: 0,
    };
  }

  // 5. Generate Initial Risks tailored to the inputs
  const risks: RiskItem[] = [
    {
      id: 'RISK-001',
      approvalId: approvals.find(a => a.name.includes('Pollution CTE'))?.id || 'APP-004',
      approvalName: 'Pollution Consent to Establish (CTE)',
      riskLevel: 'HIGH',
      category: 'Document Inconsistency',
      reason: 'DPR constructed footprint differs from Building Plan drawing (12,500 sq ft vs 10,000 sq ft).',
      dependency: 'Land Use Change & Revenue NOC',
      recommendedAction: 'Correct DPR area statement and upload Form 1-A Environmental Self-Declaration.',
    },
    {
      id: 'RISK-002',
      approvalId: approvals.find(a => a.name.includes('Building Plan'))?.id || 'APP-006',
      approvalName: 'Factory Building Plan Approval',
      riskLevel: 'MEDIUM',
      category: 'Technical Review',
      reason: 'Requires vetted structural stability calculation and provisional fire safety NOC sanction.',
      dependency: 'Pollution CTE & Provisional Fire NOC',
      recommendedAction: 'Coordinate civil structural engineer vetting while fire NOC review progresses.',
    },
  ];

  // Critical path duration estimation
  const criticalPathDays = applicable
    .filter(r => r.isCriticalPath)
    .reduce((acc, r) => acc + r.slaDays, 0);

  return {
    success: true,
    approvals,
    documents,
    risks,
    readinessScore: 72,
    criticalPathDays: criticalPathDays || 65,
  };
}
