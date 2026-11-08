# AVCruOpps on Render

AVCruOpps is the freelancer-facing companion to AVBizOpps. Both sites use the same Supabase project. AVBizOpps remains the system of record for solicitations and contract awards; AVCruOpps displays only crew requirements published by OAV staff.

1. Apply `avbizopps-render/migrations/2026-11-08-avcruopps.sql` to the existing Supabase project.
2. Deploy this directory as a separate Render Static Site using `render.yaml`.
3. Add the AVCruOpps production and preview `/sign-in` URLs to Supabase Authentication redirect URLs.
4. Connect the custom `avcruopps.com` domain after production testing.

