// Hoisted: shared seed lives at `services/apis/mocks/_seed.ts` so non-admin
// mocks can use the same helpers without crossing the admin boundary.
// Existing admin/* mocks import from `./_seed` — this re-export keeps
// them working unchanged.
export * from '../_seed'
