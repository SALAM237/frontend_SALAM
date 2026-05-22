export const demoTreasuryOverview = {
  kpis: {
    balance: 2385000,
    income: 3120000,
    expense: 735000,
    pendingAdhesions: 420000,
    activeMembers: 86,
    expectedAdhesions: 860000,
    paidAdhesions: 440000,
    recoveryRate: 51,
    membershipFee: 10000,
    donations: 960000,
    partners: 720000,
    assetsCount: 18,
    assetsValue: 1460000,
  },
  monthly: [
    { month: 'Jan', income: 380000, expense: 90000 },
    { month: 'Fev', income: 420000, expense: 110000 },
    { month: 'Mar', income: 610000, expense: 160000 },
    { month: 'Avr', income: 760000, expense: 185000 },
    { month: 'Mai', income: 950000, expense: 190000 },
  ],
  sources: [
    { source: 'Adhesions', amount: 440000, color: '#0f8f4d' },
    { source: 'Dons', amount: 960000, color: '#f5b400' },
    { source: 'Partenaires', amount: 720000, color: '#2563eb' },
    { source: 'Activites', amount: 520000, color: '#c62828' },
    { source: 'Subventions', amount: 480000, color: '#7c3aed' },
  ],
  transactions: [
    { id: 'TR-001', kind: 'Encaissement', label: 'Don diaspora Rabat', amount: 350000, date: '2026-05-20', status: 'Valide' },
    { id: 'TR-002', kind: 'Decaissement', label: 'Location salle mentorat', amount: 120000, date: '2026-05-18', status: 'Comptabilise' },
    { id: 'TR-003', kind: 'Encaissement', label: 'Partenariat entreprise', amount: 500000, date: '2026-05-14', status: 'Valide' },
  ],
};

export const demoOpportunities = [
  { id: 'opp-1', title: 'Stage data analyst - Douala', type: 'Stage', company: 'DataBridge CM', location: 'Douala', visibility: 'public', status: 'published', deadline: '2026-06-15' },
  { id: 'opp-2', title: 'Bourse master ingenierie - Rabat', type: 'Bourse', company: 'Partenaire Maroc', location: 'Rabat', visibility: 'public', status: 'published', deadline: '2026-07-01' },
  { id: 'opp-3', title: 'Appel a mentors alumni', type: 'Mentorat', company: 'SALAM', location: 'Hybride', visibility: 'members', status: 'pending', deadline: '2026-06-05' },
];

export const demoNetworkingPosts = [
  { id: 'net-1', author: 'Amina Diallo', title: 'Recherche intervenant cloud', category: 'Expertise', status: 'pending', date: '2026-05-21' },
  { id: 'net-2', author: 'Boris Tamko', title: 'Retour experience insertion professionnelle', category: 'Temoignage', status: 'published', date: '2026-05-18' },
  { id: 'net-3', author: 'Sophie Nkolo', title: 'Besoin contact RH a Yaounde', category: 'Emploi', status: 'pending', date: '2026-05-16' },
];

export const demoChatLeads = [
  { id: 'lead-1', name: 'Prospect donateur', email: 'donateur@example.com', requestType: 'don', profileType: 'donateur', score: 82, temperature: 'chaud', status: 'new', summary: 'Souhaite soutenir les actions orientation et mentorat.' },
  { id: 'lead-2', name: 'Entreprise partenaire', email: 'contact@entreprise.cm', requestType: 'partenariat', profileType: 'partenaire', score: 76, temperature: 'chaud', status: 'contacted', summary: 'Propose un partenariat autour de stages et conferences.' },
  { id: 'lead-3', name: 'Parent futur etudiant', email: 'parent@example.com', requestType: 'orientation', profileType: 'parent', score: 44, temperature: 'tiede', status: 'in_progress', summary: 'Demande des informations pour etudier au Maroc.' },
];

export const demoBoardMembers = [
  { role: 'Presidente', name: 'Nadia Simo', city: 'Yaounde', email: 'presidence@salam-cameroun.com' },
  { role: 'Secretaire general', name: 'Boris Tamko', city: 'Casablanca', email: 'secretariat@salam-cameroun.com' },
  { role: 'Tresoriere', name: 'Amina Diallo', city: 'Rabat', email: 'tresorerie@salam-cameroun.com' },
  { role: 'Censeur', name: 'Sophie Nkolo', city: 'Douala', email: 'controle@salam-cameroun.com' },
  { role: 'Conseiller', name: 'Youssef Mansouri', city: 'Marrakech', email: 'conseil@salam-cameroun.com' },
];

export const demoValidationQueue = [
  { id: 'val-1', type: 'Adherent', title: 'Validation dossier Youssef Mansouri', priority: 'Haute', date: '2026-05-21' },
  { id: 'val-2', type: 'Opportunite', title: 'Bourse master ingenierie - Rabat', priority: 'Normale', date: '2026-05-20' },
  { id: 'val-3', type: 'Networking', title: 'Recherche intervenant cloud', priority: 'Normale', date: '2026-05-19' },
];
