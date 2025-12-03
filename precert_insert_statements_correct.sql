-- =====================================================
-- INSERT Statements - CORRECT VERSION
-- Includes ALL 19 columns in correct order (snake_case first, then camelCase)
-- =====================================================

-- Clear existing data first (in reverse order of dependencies)
TRUNCATE TABLE "authorization" CASCADE;
TRUNCATE TABLE orders_details CASCADE;
TRUNCATE TABLE patient_details CASCADE;
TRUNCATE TABLE user_details CASCADE;
TRUNCATE TABLE provider_details CASCADE;
TRUNCATE TABLE insurance_details CASCADE;
TRUNCATE TABLE practice_details CASCADE;
-- Don't truncate roles_master - keep the ADMIN role we created

-- Step 1: Insert insurance_details (no dependencies)
INSERT INTO "insurance_details" VALUES (1,'Cape Peninsula and Surrounds',NULL,NULL,'INS001',NULL,NULL,'RAF-WC-002','Cape Town Regional Office','Western Cape Province',NULL,NULL,NULL),(2,'Central Free State',NULL,NULL,'INS002',NULL,NULL,'RAF-FS-005','Bloemfontein Regional Office','Free State Province',NULL,NULL,NULL),(3,'Central Free State',NULL,NULL,'INS003',NULL,NULL,'RAF-FS-005','Bloemfontein Regional Office','Free State Province',NULL,NULL,NULL);

-- Step 2: Insert practice_details
-- Column order: snake_case columns (1-11) then camelCase columns (12-19)
-- Both name_of_practice AND nameOfPractice are NOT NULL
-- Both tax_id AND taxId are NOT NULL
INSERT INTO "practice_details" 
("practice_id", "address", "contact_number", "contact_person", "email", "name_of_practice", "password", "practice_name", "practice_npi_number", "reset_token", "tax_id", "practiceId", "contactNumber", "contactPerson", "nameOfPractice", "practiceName", "practiceNpiNumber", "resetToken", "taxId")
VALUES 
(1, '123 Medical Center Dr', '555-0123', 'Admin', 'admin@practice.com', 'Default Medical Practice', 'password123', 'Default Practice', '1234567890', NULL, '12-3456789', 1, '555-0123', 'Admin', 'Default Medical Practice', 'Default Practice', '1234567890', NULL, '12-3456789');

-- Step 3: Insert provider_details (no dependencies)
INSERT INTO "provider_details" VALUES (1,NULL,NULL,'NPI001','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(2,NULL,NULL,'2345678901','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(3,NULL,NULL,'NPI002','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(4,NULL,NULL,'NPI003','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(5,NULL,NULL,'NPI004','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(6,NULL,NULL,'NPI005','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(7,NULL,NULL,'NPI006','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(8,NULL,NULL,'NPI007','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(9,NULL,NULL,'NPI008','','','',''),(10,NULL,NULL,'NPI009','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(11,NULL,NULL,'NPI010','info@metrotrauma.co.za','Dr. Sarah Johnson Medical Practice','Orthopedic Surgeon','52-3456789'),(12,NULL,NULL,'NPI011',' +27-12-345-6789','Central City Medical Associates','Neurosurgeon','85-6789012');

-- Step 4: Insert patient_details (references insurance_details)
INSERT INTO "patient_details" VALUES (1,'info@metrotrauma.co.za','RAF939963649','1997-05-02','2025-10-06','Whiplash injury from side-impact collision at intersection. Patient reports severe neck stiffness, pain radiating to shoulders, and limited range of motion. X-rays  and confirm cervical spine strain.',NULL,'Dr. Sarah Johnson Medical Practice','Sarah','2025-10-06','Sarah van der Merwe','','S13.4XXA','INS001','van','',NULL,NULL,'',NULL,NULL,'RAF939963649','2025-10-13'),(2,NULL,'PAT939963650','1997-05-02','2025-10-06','Whiplash injury from side-impact collision at intersection. Patient reports severe neck stiffness, pain radiating to shoulders, and limited range of motion. X-rays confirm cervical spine strain.',NULL,'',NULL,'2025-10-06','Sarah van der Merwe',NULL,'S13.4XXA','INS001',NULL,'',NULL,NULL,'',NULL,NULL,'','2025-10-13');

-- Step 5: Insert orders_details (might reference insurance, patient, provider)
-- Both snake_case AND camelCase columns are NOT NULL for:
-- - deleted_status / deletedStatus
-- - from_date_of_service / fromDateOfService  
-- - to_date_of_service / toDateOfService
-- - order_date / orderDate
-- - order_type / orderType
-- - units
INSERT INTO "orders_details" 
("order_id", "deleted_status", "from_date_of_service", "to_date_of_service", "order_date", "order_type", "units", "deletedStatus", "fromDateOfService", "toDateOfService", "orderDate", "orderType")
VALUES 
(1, false, '2025-10-13', '2025-10-13', '2025-10-06', 'DRAFT', 20, false, '2025-10-13', '2025-10-13', '2025-10-06', 'DRAFT'),
(3, false, '2025-10-24', '2025-10-24', '2025-10-20', 'DRAFT', 100, false, '2025-10-24', '2025-10-24', '2025-10-20', 'DRAFT');

-- Update with additional data for order 1
UPDATE "orders_details" SET 
    "order_description" = 'Morphine sulfate IV for severe pain control',
    "icddrugunits" = 'mg',
    "order_priority" = 'MEDIUM',
    "insurance_id" = 'INS001',
    "order_icd_code" = 'S13.4XXA',
    "order_status" = 'DRAFT',
    "provider_name" = 'Dr. Sarah Johnson Medical Practice',
    "provider_npi_number" = '2345678901',
    "uniquepatienti" = 'RAF939963649'
WHERE "order_id" = 1;

-- Update with additional data for order 3
UPDATE "orders_details" SET 
    "order_description" = 'Diazepam 5mg for muscle relaxation',
    "order_priority" = 'MEDIUM',
    "order_icd_code" = 'S36.032A ',
    "order_status" = 'DRAFT',
    "provider_name" = 'Central City Medical Associates',
    "provider_npi_number" = '5678901234',
    "uniquepatienti" = 'RAF382118404'
WHERE "order_id" = 3;

-- Step 6: Insert user_details (references roles_master - use existing role id=1)
-- Column order: id, admin_access, email, job_desc_read, job_desc_write, password, reset_token, resume_read, resume_write, user_name, role_type
INSERT INTO "user_details" (id, admin_access, email, job_desc_read, job_desc_write, password, reset_token, resume_read, resume_write, user_name, role_type)
VALUES (1, 0, 'divya@gmail.com', 0, 0, 'Divya@1234', NULL, 0, 0, 'prathvi', 1)
ON CONFLICT (id) DO UPDATE SET 
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    user_name = EXCLUDED.user_name;

-- Step 7: Insert authorization (references insurance, patient, provider, practice, order)
INSERT INTO "authorization" VALUES (2,NULL,NULL,NULL,'yet to submit','2025-10-31','2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,'saved',NULL,NULL,NULL,NULL,'draft','AUTH001',NULL,NULL,1,1,1,1,2),(3,NULL,NULL,NULL,'Pending','2025-10-31','2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,'saved',NULL,NULL,NULL,NULL,'draft','AUTH002',NULL,NULL,1,1,1,1,2),(4,NULL,NULL,NULL,'yet to submit','2025-10-31','2025-10-24',NULL,NULL,NULL,NULL,NULL,NULL,'saved',NULL,NULL,NULL,NULL,'draft','AUTH003',NULL,NULL,1,1,1,1,2),(5,NULL,NULL,NULL,'yet to submit','2025-11-03','2025-10-27',NULL,NULL,NULL,NULL,NULL,NULL,'saved',NULL,NULL,NULL,NULL,'draft','AUTH004',NULL,NULL,1,1,1,1,2),(6,NULL,NULL,NULL,'yet to submit','2025-11-04','2025-10-28',NULL,NULL,NULL,NULL,NULL,NULL,'saved',NULL,NULL,NULL,NULL,'draft','AUTH005',NULL,NULL,1,1,1,1,2);
