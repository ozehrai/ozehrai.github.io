# OzEHR App Review (Website Inputs)

This is a quick product-capabilities snapshot derived from the existing web app routes under `apps/web/src/app/`.

## High-level modules observed

- Scheduling & appointments: `scheduling/`, `appointments/` (incl. `waitlist/`, `tasks/`, `analytics/`, `templates/`)
- Patient records: `patients/`, `chart/`, `vitals-monitoring/`
- Clinical documentation: `clinical-notes/`, `clinical-documentation/`, `clinical-templates/`, `template-builder/`, `forms-builder/`
- Messaging: `messages/`, `text-messages/`, `inbox/`, portal messaging under `portal/messages/`
- Telehealth: `telehealth/`, `virtual-care/`
- Medications & prescribing: `medications/`, `prescriptions/`, `e-prescribing/`, `med-reconciliation/`, `pharmacy-management/`
- Labs & imaging: `lab-results/`, `lab-integration/`, `imaging/`, `imaging-integration/`, `orders/`, `results/`
- Billing & revenue cycle: `billing/`, `insurance/`, `superbills/`, `revenue-cycle/`
- Analytics & reporting: `analytics/`, `reports/`, `provider-metrics/`, `quality-measures/`, `population-health/`
- Admin & IT controls: `admin/` (incl. `audit-logs/`, `security/`, `sso/`, `integrations/`, `permissions/`, `immunizations/`)
- AI assistant: `ai-assistant/` and `OzAIChat` component used in the root layout
- Student/patient portal: `portal/` and `patient-portal/`

## How this informed the marketing site

- Home page emphasizes core campus workflows (walk-ins, intake, portal messaging, IT expectations).
- Product page presents the platform as modular (core, student, clinical, admin) aligned to the app's route structure.
- Pricing page defaults to package-based "custom quote" until real numbers are finalized.
- Security page focuses on campus IT concerns that the app explicitly supports (SSO, audit logging, roles/permissions).
