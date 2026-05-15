export const demoRoles = [
 { id:'r1', name:'SUPER_ADMIN', isSystem:true, permissions:['*'] },
 { id:'r2', name:'PRESIDENT', isSystem:true, permissions:['members.read','activities.publish','messages.send'] },
 { id:'r3', name:'CHARGE_CULTUREL', isSystem:true, permissions:['activities.create','activities.update','gallery.upload'] },
 { id:'r4', name:'CHARGE_SPORT', isSystem:true, permissions:['activities.create','activities.update'] },
 { id:'r5', name:'CHARGEE_COMMUNICATION', isSystem:true, permissions:['news.create','news.publish','gallery.moderate'] },
 { id:'r6', name:'CHARGE_IT', isSystem:true, permissions:['settings.read','audit.read'] },
 { id:'r7', name:'ADHERENT', isSystem:true, permissions:['activities.read','messages.send'] }
];
