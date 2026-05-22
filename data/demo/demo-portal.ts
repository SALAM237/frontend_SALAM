export const demoAdminUser = {
  initials: 'NS',
  name: 'Nadia Simo',
  role: 'Super Admin',
  poste: 'Presidente du bureau',
};

export const demoMemberProfile = {
  id: 'SALAM-2026-014',
  firstName: 'Amina',
  lastName: 'Diallo',
  initials: 'AD',
  email: 'amina.diallo.demo@salam.org',
  phone: '+212 6 45 22 18 90',
  city: 'Rabat',
  antenne: 'Rabat - Sale',
  profession: 'Ingenieure data',
  memberSince: '15/03/2022',
  status: 'Membre actif',
  cotisation: 'A jour',
  validUntil: '31/12/2026',
};

export const demoCotisations = [
  { id: 'COT-2026-001', member: 'Amina Diallo', label: 'Cotisation annuelle 2026', amount: 5000, status: 'paid', dueDate: '2026-01-31', paidAt: '2026-01-12', invoiceId: 'SALAM-FACT-2026-0001', receiptId: 'SALAM-RECU-2026-0001' },
  { id: 'COT-2026-002', member: 'Boris Tamko', label: 'Cotisation annuelle 2026', amount: 5000, status: 'pending', dueDate: '2026-01-31', paidAt: null, invoiceId: 'SALAM-FACT-2026-0002', receiptId: null },
  { id: 'COT-2026-003', member: 'Youssef Mansouri', label: 'Cotisation annuelle 2026', amount: 5000, status: 'late', dueDate: '2026-01-31', paidAt: null, invoiceId: 'SALAM-FACT-2026-0003', receiptId: null },
  { id: 'COT-2025-014', member: 'Amina Diallo', label: 'Cotisation annuelle 2025', amount: 5000, status: 'paid', dueDate: '2025-01-31', paidAt: '2025-01-09', invoiceId: 'SALAM-FACT-2025-0014', receiptId: 'SALAM-RECU-2025-0014' },
];

export const demoInvoices = [
  { id: 'SALAM-FACT-2026-0001', member: 'Amina Diallo', label: 'Cotisation annuelle 2026', amount: 5000, status: 'paid', issuedAt: '2026-01-10', dueDate: '2026-01-31', paidAt: '2026-01-12' },
  { id: 'SALAM-FACT-2026-0009', member: 'Sophie Nkolo', label: 'Participation gala SALAM', amount: 12000, status: 'sent', issuedAt: '2026-04-18', dueDate: '2026-06-30', paidAt: null },
  { id: 'SALAM-FACT-2026-0015', member: 'Boris Tamko', label: 'Cotisation annuelle 2026', amount: 5000, status: 'draft', issuedAt: '2026-05-03', dueDate: '2026-06-30', paidAt: null },
];

export const demoDocuments = [
  { id: 'SALAM-RECU-2026-0001', title: 'Reçu de cotisation 2026', type: 'RECU', size: 'A4', updatedAt: '12/01/2026' },
  { id: 'SALAM-FACT-2026-0001', title: 'Facture cotisation 2026', type: 'FACTURE', size: 'A4', updatedAt: '10/01/2026' },
  { id: 'DOC-001', title: 'Reglement interieur SALAM', type: 'PDF', size: '1.2 Mo', updatedAt: '12/05/2026' },
  { id: 'DOC-002', title: 'Convocation Assemblee Generale', type: 'PDF', size: '820 Ko', updatedAt: '08/05/2026' },
  { id: 'DOC-003', title: 'Guide nouvel adherent', type: 'PDF', size: '2.4 Mo', updatedAt: '02/05/2026' },
];

export const demoAuditLogs = [
  { id: 'LOG-001', actor: 'Nadia Simo', action: 'Validation adherent', target: 'Amina Diallo', date: '20/05/2026 10:42' },
  { id: 'LOG-002', actor: 'Demo Bot', action: 'Publication actualite', target: 'Lancement mentorat', date: '19/05/2026 17:10' },
  { id: 'LOG-003', actor: 'Nadia Simo', action: 'Generation facture', target: 'FAC-2026-015', date: '18/05/2026 09:21' },
];

export const demoCards = [
  { id: 'CARD-014', member: 'Amina Diallo', number: 'SALAM-2026-014', status: 'active', issuedAt: '15/03/2022' },
  { id: 'CARD-021', member: 'Boris Tamko', number: 'SALAM-2026-021', status: 'pending', issuedAt: '04/02/2026' },
  { id: 'CARD-029', member: 'Youssef Mansouri', number: 'SALAM-2026-029', status: 'active', issuedAt: '12/04/2026' },
];
