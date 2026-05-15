import { create } from 'zustand';
import { demoActivities } from '@/data/demo/demo-activities';
import { demoRoles } from '@/data/demo/demo-roles';
type DemoState={ activities: typeof demoActivities; roles: typeof demoRoles; addRole:(name:string)=>void; joinActivity:(id:string)=>void };
export const useDemoStore=create<DemoState>((set)=>({ activities:demoActivities, roles:demoRoles, addRole:(name)=>set(s=>({roles:[...s.roles,{id:crypto.randomUUID(),name,isSystem:false,permissions:[]}]})), joinActivity:(id)=>set(s=>({activities:s.activities.map(a=>a.id===id?{...a,participants:a.participants+1}:a)})) }));
