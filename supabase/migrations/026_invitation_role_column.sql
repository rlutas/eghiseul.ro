-- Add role column to employee_invitations table
-- Allows specifying which role the invited user should get (employee, avocat, manager, operator, contabil)
ALTER TABLE employee_invitations
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'employee';
