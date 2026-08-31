import samplePhoto from '../assets/hero.png'

export const mockUser = {
  id: 'worker-001',
  name: 'Rahim',
  email: 'rahim@example.com',
  role: 'worker',
  location: 'Pune',
  preferredLanguage: 'en',
}

export const mockScanHistory = [
  {
    scanId: 'scan-104',
    photoUrl: samplePhoto,
    detectedItem: 'Swollen phone battery',
    itemConfidence: 0.88,
    visibleHazards: ['Possible battery swelling', 'Damaged outer casing'],
    hazardConfidences: { 'Possible battery swelling': 0.9, 'Damaged outer casing': 0.83 },
    riskLevel: 'RED',
    riskConfidence: 0.86,
    reasonCodes: ['POSSIBLE_BATTERY_SWELLING', 'DAMAGED_CASING'],
    reasonText: 'The saved mock result included signs consistent with a potentially high-risk battery condition.',
    guidanceText: 'Stop manual opening or handling. Isolate the item and route it through trained personnel or an authorised facility.',
    guidanceSources: ['E-Safe approved handling guide — placeholder', 'Battery escalation pathway — placeholder'],
    recyclerRecommended: true,
    contextAnswers: { warm: 'Not sure', smell: 'No', residue: 'No', connectedToPower: 'No', physicalDamage: 'Yes', basicPpe: 'Yes', trainedSupervision: 'No' },
    timestamp: '2026-08-30T10:42:00.000Z',
  },
  {
    scanId: 'scan-103',
    photoUrl: samplePhoto,
    detectedItem: 'Desktop CPU cabinet',
    itemConfidence: 0.79,
    visibleHazards: ['Broken casing edge'],
    hazardConfidences: { 'Broken casing edge': 0.77 },
    riskLevel: 'AMBER',
    riskConfidence: 0.76,
    reasonCodes: ['VISIBLE_CASING_DAMAGE', 'SUPERVISION_UNAVAILABLE'],
    reasonText: 'The saved mock result noted visible damage and no trained supervision at the time of assessment.',
    guidanceText: 'Isolate the item, use extra precautions and ask for trained supervision before continuing handling or storage.',
    guidanceSources: ['E-Safe approved handling guide — placeholder'],
    recyclerRecommended: true,
    contextAnswers: { warm: 'No', smell: 'No', residue: 'Not sure', connectedToPower: 'No', physicalDamage: 'Yes', basicPpe: 'Yes', trainedSupervision: 'No' },
    timestamp: '2026-08-29T16:18:00.000Z',
  },
  {
    scanId: 'scan-102',
    photoUrl: samplePhoto,
    detectedItem: 'Computer keyboard',
    itemConfidence: 0.91,
    visibleHazards: [],
    hazardConfidences: {},
    riskLevel: 'GREEN',
    riskConfidence: 0.72,
    reasonCodes: ['NO_OBVIOUS_SUPPORTED_VISIBLE_HAZARD'],
    reasonText: 'The supported visible checks did not identify an obvious hazard in this saved mock result.',
    guidanceText: 'No obvious supported visible hazard was identified. Continue basic collection or storage only with normal precautions.',
    guidanceSources: ['E-Safe approved handling guide — placeholder'],
    recyclerRecommended: false,
    contextAnswers: { warm: 'No', smell: 'No', residue: 'No', connectedToPower: 'No', physicalDamage: 'No', basicPpe: 'Yes', trainedSupervision: 'Yes' },
    timestamp: '2026-08-28T11:20:00.000Z',
  },
]

export const mockWorkerSummary = {
  scansThisWeek: 14,
  highRiskFindings: 2,
  nearbyRecyclers: 3,
}

// DEVELOPMENT ONLY: representative Pune / Pimpri-Chinchwad records. They are not a national database.
export const mockRecyclers = [
  {
    id: 'pune-ecycle-001',
    facilityName: 'Pune E-Cycle Centre (mock)',
    address: 'Bhosari MIDC, Pune, Maharashtra',
    latitude: 18.6298,
    longitude: 73.8486,
    contact: '+91 20 4000 1001',
    acceptedItemTypes: ['Batteries', 'Small electronics', 'Mobile phones'],
    authorisationReference: 'MPCB mock authorisation: PUN-EW-001',
    sourceUrl: 'https://example.org/e-safe/mock-pune-ecycle',
    lastVerifiedDate: '2026-08-21',
    distanceKm: 4.2,
    verified: true,
  },
  {
    id: 'pcmc-recovery-002',
    facilityName: 'PCMC Circuit Recovery (mock)',
    address: 'Chinchwad Industrial Area, Pimpri-Chinchwad, Maharashtra',
    latitude: 18.6367,
    longitude: 73.7919,
    contact: '+91 20 4000 1002',
    acceptedItemTypes: ['Computers', 'Circuit boards', 'UPS units'],
    authorisationReference: 'MPCB mock authorisation: PCMC-EW-002',
    sourceUrl: 'https://example.org/e-safe/mock-pcmc-recovery',
    lastVerifiedDate: '2026-08-16',
    distanceKm: 7.6,
    verified: true,
  },
  {
    id: 'pune-electronics-003',
    facilityName: 'Pune Electronics Collection Point (mock)',
    address: 'Hadapsar, Pune, Maharashtra',
    latitude: 18.5089,
    longitude: 73.926,
    contact: '+91 20 4000 1003',
    acceptedItemTypes: ['Small electronics', 'Monitors', 'Mixed e-waste'],
    authorisationReference: null,
    sourceUrl: 'https://example.org/e-safe/mock-pune-collection',
    lastVerifiedDate: '2026-07-30',
    distanceKm: 12.4,
    verified: false,
  },
]

export const mockAdminDashboard = {
  totalScans: 148,
  riskCounts: { GREEN: 71, AMBER: 39, RED: 18, UNCERTAIN: 20 },
  uncertainOrEscalated: 38,
  analysisFailures: 4,
  supportedItemClasses: [
    { label: 'Mobile phones', count: 52 },
    { label: 'Computer equipment', count: 43 },
    { label: 'Batteries', count: 31 },
    { label: 'Small electronics', count: 22 },
  ],
  recentIssues: [
    { id: 'issue-104', type: 'Uncertain result', detail: 'Photo had limited supported visible context.', timestamp: '2026-08-30T15:16:00.000Z' },
    { id: 'issue-103', type: 'Analysis fallback', detail: 'Mock analysis response was unavailable; worker was shown an uncertainty path.', timestamp: '2026-08-30T13:08:00.000Z' },
    { id: 'issue-102', type: 'Escalation', detail: 'Red result routed toward an authorised recycler pathway.', timestamp: '2026-08-29T11:47:00.000Z' },
  ],
}

export const mockAdminRecyclerRecords = [
  {
    id: 'pune-ecycle-001',
    facilityName: 'Pune E-Cycle Centre (mock)',
    address: 'Bhosari MIDC, Pune, Maharashtra',
    contact: '+91 20 4000 1001',
    acceptedItemTypes: ['Batteries', 'Small electronics', 'Mobile phones'],
    authorisationReference: 'MPCB mock authorisation: PUN-EW-001',
    sourceUrl: 'https://example.org/e-safe/mock-pune-ecycle',
    lastVerifiedDate: '2026-08-21',
    verified: true,
  },
  {
    id: 'pcmc-recovery-002',
    facilityName: 'PCMC Circuit Recovery (mock)',
    address: 'Chinchwad Industrial Area, Pimpri-Chinchwad, Maharashtra',
    contact: '+91 20 4000 1002',
    acceptedItemTypes: ['Computers', 'Circuit boards', 'UPS units'],
    authorisationReference: 'MPCB mock authorisation: PCMC-EW-002',
    sourceUrl: 'https://example.org/e-safe/mock-pcmc-recovery',
    lastVerifiedDate: '2026-08-16',
    verified: true,
  },
]

export const mockApprovedSafetyDocuments = [
  {
    id: 'doc-battery-001',
    title: 'Battery handling escalation guide (mock)',
    organisation: 'E-Safe programme',
    sourceUrl: 'https://example.org/e-safe/mock-battery-guide',
    publicationDate: '2026-07-12',
    documentType: 'Safety guidance',
    tags: ['Batteries', 'Swelling', 'RED'],
    active: true,
  },
  {
    id: 'doc-storage-002',
    title: 'Basic e-waste storage precautions (mock)',
    organisation: 'E-Safe programme',
    sourceUrl: 'https://example.org/e-safe/mock-storage-guide',
    publicationDate: '2026-06-04',
    documentType: 'Collection protocol',
    tags: ['Storage', 'GREEN', 'AMBER'],
    active: true,
  },
]

export const mockStandardMessages = [
  { id: 'risk-green-en-001', language: 'en', riskLevel: 'GREEN', text: 'No obvious supported visible hazard was identified. Continue basic collection or storage only with normal precautions.', verified: true },
  { id: 'risk-amber-en-001', language: 'en', riskLevel: 'AMBER', text: 'Isolate the item, use extra precautions and ask for trained supervision before continuing handling or storage.', verified: true },
  { id: 'risk-red-en-001', language: 'en', riskLevel: 'RED', text: 'Stop manual opening or handling. Isolate the item and route it through trained personnel or an authorised facility.', verified: true },
  { id: 'risk-uncertain-en-001', language: 'en', riskLevel: 'UNCERTAIN', text: 'Uncertain — isolate the item and ask a trained person.', verified: true },
]
