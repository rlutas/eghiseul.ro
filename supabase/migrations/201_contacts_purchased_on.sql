-- 201: Buyers imported from the sister sites get a warm-up text that names the
-- site they actually bought from.
--
-- Set only for contacts imported from cazierjudiciaronline.com or ecazier.ro.
-- NULL means the contact comes from eghiseul.ro, so the existing text applies.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS purchased_on text
  CHECK (purchased_on IS NULL OR purchased_on IN ('cazierjudiciaronline', 'ecazier'));

COMMENT ON COLUMN public.contacts.purchased_on IS
  'Sister site where this contact bought, when it was not eghiseul.ro. Selects the warm-up wording.';

NOTIFY pgrst, 'reload schema';
