-- Active: 1767112952723@@127.0.0.1@5432@gravity
-- ==================================================
-- INSERT USERS (Base table)
-- ==================================================


-- ==================================================
-- INSERT USERS (Base table)
-- ==================================================
INSERT INTO gravity."User" ( 
    id, email, password, phone, "alternatePhone", role, "isActive", "isVerified", 
    "emailVerified", "phoneVerified", "lastLogin", "createdAt", "updatedAt", 
    name, "profileImage", bio, "dateOfBirth", gender, address, city, state, pincode,
    "twoFactorEnabled", "loginAttempts"
) VALUES
('cm7jv6k8k0000xjrcso65x1qj', 'admin@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543210', NULL, 'SUPER_ADMIN', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Rajesh Kumar', '/avatars/rajesh.jpg', 'Platform administrator', '1985-05-15', 'MALE', '123 Admin St', 'Mumbai', 'Maharashtra', '400001', false, 0),
('cm7jv6k8k0001xjrcso65x1qk', 'moderator@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543211', NULL, 'ADMIN', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Priya Sharma', '/avatars/priya.jpg', 'Content moderator', '1990-08-20', 'FEMALE', '456 Admin Ave', 'Delhi', 'Delhi', '110001', false, 0),

('cm7jv6k8k0002xjrcso65x1ql', 'arjun.sharma@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543212', '+919876543213', 'TEACHER', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Dr. Arjun Sharma', '/avatars/arjun.jpg', 'Quantum Physics expert with 10+ years experience', '1980-03-10', 'MALE', '789 Teacher Lane', 'Bangalore', 'Karnataka', '560001', false, 0),
('cm7jv6k8k0003xjrcso65x1qm', 'neha.gupta@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543214', NULL, 'TEACHER', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Prof. Neha Gupta', '/avatars/neha.jpg', 'Electromagnetism specialist from IIT Delhi', '1982-07-25', 'FEMALE', '321 Teacher Road', 'Pune', 'Maharashtra', '411001', false, 0),
('cm7jv6k8k0004xjrcso65x1qn', 'rahul.verma@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543215', '+919876543216', 'TEACHER', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Dr. Rahul Verma', '/avatars/rahul.jpg', 'Relativity and Astrophysics researcher', '1978-11-12', 'MALE', '654 Teacher Colony', 'Chennai', 'Tamil Nadu', '600001', false, 0),
('cm7jv6k8k0005xjrcso65x1qo', 'priya.singh@gravity.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543217', NULL, 'TEACHER', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Prof. Priya Singh', '/avatars/priya_teacher.jpg', 'Classical Mechanics expert', '1984-09-30', 'FEMALE', '987 Teacher Nagar', 'Kolkata', 'West Bengal', '700001', false, 0),

('cm7jv6k8k0006xjrcso65x1qp', 'rohan.kumar@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543218', NULL, 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Rohan Kumar', '/avatars/rohan.jpg', NULL, '2005-04-15', 'MALE', '123 Student Hostel', 'Delhi', 'Delhi', '110001', false, 0),
('cm7jv6k8k0007xjrcso65x1qq', 'ishita.patel@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543219', '+919876543220', 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Ishita Patel', '/avatars/ishita.jpg', NULL, '2006-08-22', 'FEMALE', '456 Student Apartments', 'Ahmedabad', 'Gujarat', '380001', false, 0),
('cm7jv6k8k0008xjrcso65x1qr', 'aditya.singh@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543221', NULL, 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Aditya Singh', '/avatars/aditya.jpg', NULL, '2005-11-03', 'MALE', '789 Student Block', 'Lucknow', 'Uttar Pradesh', '226001', false, 0),
('cm7jv6k8k0009xjrcso65x1qs', 'ananya.desai@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543222', '+919876543223', 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Ananya Desai', '/avatars/ananya.jpg', NULL, '2006-02-18', 'FEMALE', '321 Student Avenue', 'Pune', 'Maharashtra', '411001', false, 0),
('cm7jv6k8k0010xjrcso65x1qt', 'vikram.singh@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543224', NULL, 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Vikram Singh', '/avatars/vikram.jpg', NULL, '2005-07-09', 'MALE', '654 Student Housing', 'Jaipur', 'Rajasthan', '302001', false, 0),
('cm7jv6k8k0011xjrcso65x1qu', 'sneha.reddy@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543225', '+919876543226', 'STUDENT', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sneha Reddy', '/avatars/sneha.jpg', NULL, '2006-05-12', 'FEMALE', '987 Student Complex', 'Hyderabad', 'Telangana', '500001', false, 0),

('cm7jv6k8k0012xjrcso65x1qv', 'suresh.patel@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543227', NULL, 'GUARDIAN', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Suresh Patel', '/avatars/suresh.jpg', NULL, '1975-09-20', 'MALE', '456 Guardian Enclave', 'Ahmedabad', 'Gujarat', '380001', false, 0),
('cm7jv6k8k0013xjrcso65x1qw', 'sunita.kumar@example.com', '$2b$10$R2UDeyBqsuGtTrNcvN7X6e3Nci15bhHf/u/lF8KTElRim09ZtZw62', '+919876543228', '+919876543229', 'GUARDIAN', true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sunita Kumar', '/avatars/sunita.jpg', NULL, '1978-03-15', 'FEMALE', '789 Guardian Street', 'Delhi', 'Delhi', '110001', false, 0);
-- ==================================================
-- INSERT TEACHER PROFILES
-- ==================================================
INSERT INTO gravity."Teacher" (
    id, "userId", name, bio, qualification, expertise, "profileImage", 
    designation, institute, experience, "gstNumber", "panNumber", "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0014xjrcso65x1qx', 'cm7jv6k8k0002xjrcso65x1ql', 'Dr. Arjun Sharma', 'Quantum Physics expert with 10+ years experience', 'Ph.D. in Physics from IIT Bombay', ARRAY['Quantum Mechanics', 'Particle Physics', 'Mathematical Physics'], '/avatars/arjun.jpg', 'Senior Professor', 'IIT Bombay', 12, '27AABCD1234E1Z5', 'ABCDE1234F', NOW(), NOW()),
('cm7jv6k8k0015xjrcso65x1qy', 'cm7jv6k8k0003xjrcso65x1qm', 'Prof. Neha Gupta', 'Electromagnetism specialist from IIT Delhi', 'M.Sc. Physics, IIT Delhi', ARRAY['Electromagnetism', 'Optics', 'Waves'], '/avatars/neha.jpg', 'Associate Professor', 'IIT Delhi', 8, '27AABCD5678E1Z5', 'FGHIJ5678K', NOW(), NOW()),
('cm7jv6k8k0016xjrcso65x1qz', 'cm7jv6k8k0004xjrcso65x1qn', 'Dr. Rahul Verma', 'Relativity and Astrophysics researcher', 'Ph.D. in Astrophysics from IISc', ARRAY['Relativity', 'Astrophysics', 'Cosmology'], '/avatars/rahul.jpg', 'Professor', 'IISc Bangalore', 15, '27AABCD9101E1Z5', 'KLMNO9101P', NOW(), NOW()),
('cm7jv6k8k0017xjrcso65x1r0', 'cm7jv6k8k0005xjrcso65x1qo', 'Prof. Priya Singh', 'Classical Mechanics expert', 'M.Sc. Physics, University of Delhi', ARRAY['Classical Mechanics', 'Thermodynamics', 'Fluid Mechanics'], '/avatars/priya_teacher.jpg', 'Assistant Professor', 'University of Delhi', 6, '27AABCD1213E1Z5', 'PQRST1213U', NOW(), NOW());

-- ==================================================
-- INSERT STUDENT PROFILES
-- ==================================================

-- First, verify the existing User IDs
-- Run this query to see what User IDs actually exist:
-- SELECT id, email, role FROM public."User";

-- Then use the correct User IDs in your Student INSERT:


-- Run this query to see all users and their IDs
SELECT id, email, role FROM gravity."User" WHERE role = 'STUDENT';


INSERT INTO gravity."Student" (
    id, "userId", name, "dateOfBirth", gender, address, city, state, pincode,
    institute, "educationLevel", class, board, "hscYear", "guardianId",
    "preferredSubjects", "learningGoals", "examTargets", "createdAt", "updatedAt"
) VALUES
(
    'student_rohan_001', 
    'cm7jv6k8k0007xjrcso65x1qq',  -- This should match an existing User ID
    'Rohan Kumar', 
    '2005-04-15', 
    'MALE', 
    '123 Student Hostel', 
    'Delhi', 
    'Delhi', 
    '110001', 
    'Delhi Public School', 
    'High School', 
    '12', 
    'CBSE', 
    2024, 
    NULL,  -- Set guardianId to NULL initially, update later if needed
    ARRAY['Physics', 'Mathematics'], 
    ARRAY['IIT JEE Advanced', 'Research in Physics'], 
    ARRAY['JEE Advanced', 'IIT JAM'], 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'student_ishita_002', 
    'cm7jv6k8k0008xjrcso65x1qr',  -- This should match an existing User ID
    'Ishita Patel', 
    '2006-08-22', 
    'FEMALE', 
    '456 Student Apartments', 
    'Ahmedabad', 
    'Gujarat', 
    '380001', 
    'St. Xavier''s School', 
    'High School', 
    '11', 
    'CBSE', 
    2025, 
    NULL,
    ARRAY['Physics', 'Chemistry'], 
    ARRAY['NEET', 'Medical Entrance'], 
    ARRAY['NEET', 'AIIMS'], 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'student_aditya_003', 
    'cm7jv6k8k0009xjrcso65x1qs',  -- This should match an existing User ID
    'Aditya Singh', 
    '2005-11-03', 
    'MALE', 
    '789 Student Block', 
    'Lucknow', 
    'Uttar Pradesh', 
    '226001', 
    'City Montessori School', 
    'High School', 
    '12', 
    'ICSE', 
    2024, 
    NULL,
    ARRAY['Physics', 'Mathematics'], 
    ARRAY['IIT JEE', 'Engineering'], 
    ARRAY['JEE Main', 'JEE Advanced'], 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'student_ananya_004', 
    'cm7jv6k8k0010xjrcso65x1qt',  -- This should match an existing User ID
    'Ananya Desai', 
    '2006-02-18', 
    'FEMALE', 
    '321 Student Avenue', 
    'Pune', 
    'Maharashtra', 
    '411001', 
    'Pune International School', 
    'High School', 
    '11', 
    'State Board', 
    2025, 
    NULL,
    ARRAY['Physics', 'Biology'], 
    ARRAY['NEET', 'Medical College'], 
    ARRAY['NEET', 'AIIMS'], 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'student_vikram_005', 
    'cm7jv6k8k0011xjrcso65x1qu',  -- This should match an existing User ID
    'Vikram Singh', 
    '2005-07-09', 
    'MALE', 
    '654 Student Housing', 
    'Jaipur', 
    'Rajasthan', 
    '302001', 
    'Maharaja School', 
    'High School', 
    '12', 
    'CBSE', 
    2024, 
    NULL,
    ARRAY['Physics', 'Mathematics'], 
    ARRAY['JEE Advanced', 'IIT'], 
    ARRAY['JEE Main', 'JEE Advanced', 'BITSAT'], 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);


-- ==================================================
-- INSERT GUARDIAN PROFILES
-- ==================================================
INSERT INTO gravity."Guardian" (
    id, "userId", name, relationship, occupation, income, "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0024xjrcso65x1r7', 'cm7jv6k8k0012xjrcso65x1qv', 'Suresh Patel', 'Father', 'Business Owner', 2500000, NOW(), NOW()),
('cm7jv6k8k0025xjrcso65x1r8', 'cm7jv6k8k0013xjrcso65x1qw', 'Sunita Kumar', 'Mother', 'School Teacher', 1800000, NOW(), NOW());

-- ==================================================
-- INSERT NOTIFICATION PREFERENCES
-- ==================================================
INSERT INTO gravity."NotificationPreference" (
    id, "userId", "emailEnabled", "smsEnabled", "whatsappEnabled", "inappEnabled", "pushEnabled", preferences, "createdAt", "updatedAt"
)
SELECT 
    gen_random_uuid()::text, 
    id, 
    true, true, false, true, true,
    '{"PAYMENT_REMINDER": true, "EXAM_UPDATE": true, "CLASS_REMINDER": true}'::json,
    NOW(), NOW()
FROM gravity."User";

-- ==================================================
-- INSERT COURSES
-- ==================================================

-- Run this query to see all users and their IDs
-- Check all teachers with their User IDs and Teacher IDs
SELECT 
    t.id as teacher_id,
    t.name as teacher_name,
    u.id as user_id,
    u.email
FROM gravity."Teacher" t
JOIN gravity."User" u ON t."userId" = u.id;
INSERT INTO gravity."Course" (
    id, title, slug, description, subject, category, thumbnail, "teacherId", duration, level, price, "isFree", "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0026xjrcso65x1r9', 'Quantum Physics Fundamentals', 'quantum-physics-fundamentals', 'Complete introduction to Quantum Mechanics', 'Physics', 'Science', '/courses/quantum.jpg', 'cm7jv6k8k0014xjrcso65x1qx', 45, 'BEGINNER', 4999.00, false, NOW(), NOW()),
('cm7jv6k8k0027xjrcso65x1ra', 'Electromagnetism Mastery', 'electromagnetism-mastery', 'Comprehensive course on Electromagnetism', 'Physics', 'Science', '/courses/em.jpg', 'cm7jv6k8k0015xjrcso65x1qy', 60, 'INTERMEDIATE', 5999.00, false, NOW(), NOW()),
('cm7jv6k8k0028xjrcso65x1rb', 'Relativity and Astrophysics', 'relativity-astrophysics', 'Einstein''s theories and beyond', 'Physics', 'Science', '/courses/relativity.jpg', 'cm7jv6k8k0016xjrcso65x1qz', 50, 'ADVANCED', 6999.00, false, NOW(), NOW()),
('cm7jv6k8k0029xjrcso65x1rc', 'Classical Mechanics', 'classical-mechanics', 'Newtonian mechanics to Lagrangian', 'Physics', 'Science', '/courses/mechanics.jpg', 'cm7jv6k8k0017xjrcso65x1r0', 40, 'BEGINNER', 3999.00, true, NOW(), NOW());

-- ==================================================
-- INSERT BATCHES
-- ==================================================
INSERT INTO gravity."Batch" (
    id, name, slug, "courseId", "teacherId", subject, description, mode, "maxStudents", "currentEnrollments", "startDate", "endDate", price, "isActive", "isPublished", "enrollmentOpen", "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0030xjrcso65x1rd', 'Quantum Physics Batch - 2024', 'quantum-batch-2024', 'cm7jv6k8k0029xjrcso65x1rc', 'cm7jv6k8k0014xjrcso65x1qx', 'Quantum Physics', 'Intensive course on Quantum Mechanics', 'ONLINE', 50, 12, '2024-06-01 00:00:00', '2024-08-30 00:00:00', 4999.00, true, true, true, NOW(), NOW()),
('cm7jv6k8k0031xjrcso65x1re', 'Electromagnetism Advanced', 'em-advanced-2024', 'cm7jv6k8k0028xjrcso65x1rb', 'cm7jv6k8k0014xjrcso65x1qx', 'Electromagnetism', 'Deep dive into Maxwell''s equations', 'ONLINE', 40, 8, '2024-06-15 00:00:00', '2024-09-15 00:00:00', 5999.00, true, true, true, NOW(), NOW()),
('cm7jv6k8k0032xjrcso65x1rf', 'Relativity Crash Course', 'relativity-crash-2024', 'cm7jv6k8k0027xjrcso65x1ra', 'cm7jv6k8k0014xjrcso65x1qx', 'Relativity', 'Special and General Relativity', 'HYBRID', 30, 5, '2024-07-01 00:00:00', '2024-08-15 00:00:00', 6999.00, true, true, true, NOW(), NOW()),
('cm7jv6k8k0033xjrcso65x1rg', 'Classical Mechanics Foundation', 'mechanics-foundation-2024', 'cm7jv6k8k0026xjrcso65x1r9', 'cm7jv6k8k0015xjrcso65x1qy', 'Mechanics', 'Fundamentals of Classical Mechanics', 'OFFLINE', 25, 3, '2024-05-15 00:00:00', '2024-07-15 00:00:00', 3999.00, true, true, true, NOW(), NOW());

-- ==================================================
-- INSERT ENROLLMENTS
-- ==================================================
INSERT INTO gravity."Enrollment" (
    id, "studentId", "batchId", status, "appliedAt", "paymentStatus", "totalFees", "paidAmount", "dueAmount", "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0034xjrcso65x1rh', 'cm7jv6k8k0018xjrcso65x1r1', 'cm7jv6k8k0030xjrcso65x1rd', 'APPROVED', NOW() - INTERVAL '30 days', 'COMPLETED', 4999.00, 4999.00, 0, NOW(), NOW()),
('cm7jv6k8k0035xjrcso65x1ri', 'cm7jv6k8k0019xjrcso65x1r2', 'cm7jv6k8k0030xjrcso65x1rd', 'APPROVED', NOW() - INTERVAL '25 days', 'COMPLETED', 4999.00, 4999.00, 0, NOW(), NOW()),
('cm7jv6k8k0036xjrcso65x1rj', 'cm7jv6k8k0020xjrcso65x1r3', 'cm7jv6k8k0031xjrcso65x1re', 'PENDING', NOW() - INTERVAL '5 days', 'PENDING', 5999.00, 0, 5999.00, NOW(), NOW()),
('cm7jv6k8k0037xjrcso65x1rk', 'cm7jv6k8k0021xjrcso65x1r4', 'cm7jv6k8k0032xjrcso65x1rf', 'APPROVED', NOW() - INTERVAL '15 days', 'PARTIAL', 6999.00, 3500.00, 3499.00, NOW(), NOW()),
('cm7jv6k8k0038xjrcso65x1rl', 'cm7jv6k8k0022xjrcso65x1r5', 'cm7jv6k8k0033xjrcso65x1rg', 'WAITLISTED', NOW() - INTERVAL '2 days', 'PENDING', 3999.00, 0, 3999.00, NOW(), NOW());

-- ==================================================
-- INSERT PAYMENTS
-- ==================================================
INSERT INTO gravity."Payment" (
    id, "enrollmentId", "studentId", amount, "paidAmount", method, status, "transactionId", "paymentDate", "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0039xjrcso65x1rm', 'cm7jv6k8k0034xjrcso65x1rh', 'cm7jv6k8k0018xjrcso65x1r1', 4999.00, 4999.00, 'ONLINE', 'COMPLETED', 'TXN' || floor(random() * 1000000)::text, NOW() - INTERVAL '30 days', NOW(), NOW()),
('cm7jv6k8k0040xjrcso65x1rn', 'cm7jv6k8k0035xjrcso65x1ri', 'cm7jv6k8k0019xjrcso65x1r2', 4999.00, 4999.00, 'CARD', 'COMPLETED', 'TXN' || floor(random() * 1000000)::text, NOW() - INTERVAL '25 days', NOW(), NOW()),
('cm7jv6k8k0041xjrcso65x1ro', 'cm7jv6k8k0037xjrcso65x1rk', 'cm7jv6k8k0021xjrcso65x1r4', 3500.00, 3500.00, 'UPI', 'COMPLETED', 'TXN' || floor(random() * 1000000)::text, NOW() - INTERVAL '15 days', NOW(), NOW());

-- ==================================================
-- INSERT QUIZZES
-- ==================================================
INSERT INTO public."Quiz" (
    id, title, slug, description, "teacherId", "batchId", "timeLimit", "totalMarks", "passingMarks", status, difficulty, subject, "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0042xjrcso65x1rp', 'Quantum Mechanics Basics Quiz', 'quantum-basics-quiz', 'Test your understanding of quantum fundamentals', 'cm7jv6k8k0014xjrcso65x1qx', 'cm7jv6k8k0030xjrcso65x1rd', 30, 50, 20, 'PUBLISHED', 'BEGINNER', 'Quantum Physics', NOW(), NOW()),
('cm7jv6k8k0043xjrcso65x1rq', 'Maxwell''s Equations Test', 'maxwell-equations-test', 'Practice problems on Maxwell''s equations', 'cm7jv6k8k0015xjrcso65x1qy', 'cm7jv6k8k0031xjrcso65x1re', 45, 75, 45, 'PUBLISHED', 'INTERMEDIATE', 'Electromagnetism', NOW(), NOW()),
('cm7jv6k8k0044xjrcso65x1rr', 'Relativity Concepts', 'relativity-concepts', 'Special and General Relativity questions', 'cm7jv6k8k0016xjrcso65x1qz', 'cm7jv6k8k0032xjrcso65x1rf', 60, 100, 60, 'DRAFT', 'ADVANCED', 'Relativity', NOW(), NOW());

-- ==================================================
-- INSERT QUESTIONS
-- ==================================================
INSERT INTO public."Question" (
    id, "quizId", text, type, options, "correctAnswer", explanation, marks, "order", difficulty, topic, "createdAt", "updatedAt"
) VALUES
-- Questions for Quantum Basics Quiz
('cm7jv6k8k0045xjrcso65x1rs', 'cm7jv6k8k0042xjrcso65x1rp', 'What is the de Broglie wavelength of a particle?', 'MCQ', '["λ = h/p", "λ = hf", "λ = h/mv²", "λ = mc²"]'::json, '0', 'The de Broglie wavelength is given by λ = h/p where h is Planck''s constant and p is momentum.', 5, 1, 'BEGINNER', 'Wave-Particle Duality', NOW(), NOW()),
('cm7jv6k8k0046xjrcso65x1rt', 'cm7jv6k8k0042xjrcso65x1rp', 'The Heisenberg Uncertainty Principle states:', 'MCQ', '["Δx Δp ≥ ħ/2", "Δx Δp ≤ ħ/2", "ΔE Δt ≥ ħ", "E = hf"]'::json, '0', 'The uncertainty principle states that the product of uncertainties in position and momentum is at least ħ/2.', 5, 2, 'BEGINNER', 'Uncertainty Principle', NOW(), NOW()),
('cm7jv6k8k0047xjrcso65x1ru', 'cm7jv6k8k0042xjrcso65x1rp', 'Which of the following is NOT a quantum number?', 'MCQ', '["Principal", "Azimuthal", "Magnetic", "Velocity"]'::json, '3', 'Velocity is a classical concept, not a quantum number. The quantum numbers are principal, azimuthal, magnetic, and spin.', 5, 3, 'BEGINNER', 'Quantum Numbers', NOW(), NOW());

-- ==================================================
-- INSERT POSTS
-- ==================================================
INSERT INTO public."Post" (
    id, title, content, slug, type, status, visibility, "teacherId", views, "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0048xjrcso65x1rv', 'Understanding Quantum Entanglement', 'Quantum entanglement is a physical phenomenon that occurs when a pair or group of particles interact in ways such that the quantum state of each particle cannot be described independently...', 'quantum-entanglement-explained', 'TEXT', 'PUBLISHED', 'PUBLIC', 'cm7jv6k8k0014xjrcso65x1qx', 1250, NOW() - INTERVAL '10 days', NOW()),
('cm7jv6k8k0049xjrcso65x1rw', '5 Tips for Mastering Electromagnetism', 'Electromagnetism can be challenging. Here are 5 proven strategies to master this subject...', 'electromagnetism-tips', 'TEXT', 'PUBLISHED', 'PUBLIC', 'cm7jv6k8k0015xjrcso65x1qy', 850, NOW() - INTERVAL '7 days', NOW()),
('cm7jv6k8k0050xjrcso65x1rx', 'The Beauty of General Relativity', 'Einstein''s theory of general relativity describes gravity not as a force, but as a curvature of spacetime...', 'general-relativity-beauty', 'TEXT', 'PUBLISHED', 'PUBLIC', 'cm7jv6k8k0016xjrcso65x1qz', 2100, NOW() - INTERVAL '5 days', NOW());

-- ==================================================
-- INSERT COMMENTS
-- ==================================================
INSERT INTO public."Comment" (
    id, content, "postId", "studentId", likes, status, "createdAt", "updatedAt"
) VALUES
('cm7jv6k8k0051xjrcso65x1ry', 'This explanation really helped me understand entanglement! Thanks Dr. Sharma.', 'cm7jv6k8k0048xjrcso65x1rv', 'cm7jv6k8k0018xjrcso65x1r1', 5, 'ACTIVE', NOW() - INTERVAL '9 days', NOW()),
('cm7jv6k8k0052xjrcso65x1rz', 'Could you explain more about Bell''s theorem?', 'cm7jv6k8k0048xjrcso65x1rv', 'cm7jv6k8k0019xjrcso65x1r2', 2, 'ACTIVE', NOW() - INTERVAL '8 days', NOW()),
('cm7jv6k8k0053xjrcso65x1s0', 'Tip #3 about visualization really worked for me!', 'cm7jv6k8k0049xjrcso65x1rw', 'cm7jv6k8k0020xjrcso65x1r3', 3, 'ACTIVE', NOW() - INTERVAL '6 days', NOW());

-- ==================================================
-- INSERT POST REACTIONS
-- ==================================================
INSERT INTO public."PostReaction" (
    id, "postId", "studentId", type, "createdAt"
) VALUES
('cm7jv6k8k0054xjrcso65x1s1', 'cm7jv6k8k0048xjrcso65x1rv', 'cm7jv6k8k0018xjrcso65x1r1', 'LIKE', NOW() - INTERVAL '9 days'),
('cm7jv6k8k0055xjrcso65x1s2', 'cm7jv6k8k0048xjrcso65x1rv', 'cm7jv6k8k0019xjrcso65x1r2', 'LOVE', NOW() - INTERVAL '8 days'),
('cm7jv6k8k0056xjrcso65x1s3', 'cm7jv6k8k0049xjrcso65x1rw', 'cm7jv6k8k0020xjrcso65x1r3', 'HELPFUL', NOW() - INTERVAL '6 days');

-- ==================================================
-- INSERT NOTIFICATIONS
-- ==================================================
INSERT INTO public."Notification" (
    id, "userId", type, channel, title, message, data, "isRead", "createdAt"
) VALUES
('cm7jv6k8k0057xjrcso65x1s4', 'cm7jv6k8k0018xjrcso65x1r1', 'CLASS_REMINDER', 'INAPP', 'Class Reminder', 'Your Quantum Physics class starts in 1 hour', '{"batchId": "cm7jv6k8k0030xjrcso65x1rd", "time": "10:00 AM"}'::json, false, NOW() - INTERVAL '1 day'),
('cm7jv6k8k0058xjrcso65x1s5', 'cm7jv6k8k0019xjrcso65x1r2', 'EXAM_UPDATE', 'EMAIL', 'Quiz Available', 'A new quiz "Quantum Basics" is now available', '{"quizId": "cm7jv6k8k0042xjrcso65x1rp"}'::json, false, NOW() - INTERVAL '2 days'),
('cm7jv6k8k0059xjrcso65x1s6', 'cm7jv6k8k0021xjrcso65x1r4', 'PAYMENT_REMINDER', 'WHATSAPP', 'Payment Due Reminder', 'Your installment payment of ₹3500 is due in 3 days', '{"enrollmentId": "cm7jv6k8k0037xjrcso65x1rk", "amount": 3500}'::json, false, NOW() - INTERVAL '3 days');

-- ==================================================
-- UPDATE SEQUENCES (if using serial IDs)
-- ==================================================
-- Note: If you're using sequences, uncomment and run these:
-- SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User") + 1);
-- Add similar for other tables with serial IDs



INSERT INTO gravity."Course" (
  id,
  title,
  slug,
  description,
  subject,
  category,
  "teacherId",
  price,
  "isFree",
  level,
  duration,
  "createdAt",
  "updatedAt"
) VALUES
('crs_001', 'Complete Physics for JEE Advanced', 'complete-physics-jee-advanced', 'Comprehensive physics course covering all topics for JEE Advanced with problem-solving techniques', 'Physics', 'Science', 'cm7jv6k8k0014xjrcso65x1qx', 25000, false, 'ADVANCED', 200, NOW(), NOW()),

('crs_002', 'Quantum Mechanics Fundamentals', 'quantum-mechanics-fundamentals', 'Deep dive into quantum physics concepts with mathematical foundations', 'Physics', 'Science', 'cm7jv6k8k0015xjrcso65x1qy', 15000, false, 'INTERMEDIATE', 60, NOW(), NOW()),

('crs_003', 'Electromagnetism Mastery', 'electromagnetism-mastery', 'Complete electromagnetism course from basics to advanced', 'Physics', 'Science', 'cm7jv6k8k0016xjrcso65x1qz', 18000, false, 'ADVANCED', 80, NOW(), NOW()),

('crs_004', 'NEET Physics Crash Course', 'neet-physics-crash-course', 'Intensive course for NEET physics preparation', 'Physics', 'Science', 'cm7jv6k8k0014xjrcso65x1qx', 12000, false, 'INTERMEDIATE', 40, NOW(), NOW()),

('crs_005', 'Class 11 Physics - Complete', 'class-11-physics-complete', 'Full syllabus coverage for CBSE Class 11 Physics', 'Physics', 'Science', 'cm7jv6k8k0015xjrcso65x1qy', 10000, false, 'BEGINNER', 120, NOW(), NOW()),

('crs_006', 'Free Physics Fundamentals', 'free-physics-fundamentals', 'Basic physics concepts for beginners - Free course', 'Physics', 'Science', 'cm7jv6k8k0016xjrcso65x1qz', 0, true, 'BEGINNER', 20, NOW(), NOW());

SELECT * FROM gravity."Course";


INSERT INTO gravity."Batch" (
  id,
  name,
  slug,
  "courseId",
  "teacherId",
  subject,
  mode,
  "startDate",
  "endDate",
  price,
  "maxStudents",
  "enrollmentOpen",
  "isPublished",
  "createdAt",
  "updatedAt"
) VALUES
('bch_001', 'JEE Advanced 2024 - Morning Batch', 'jee-advanced-2024-morning', 'crs_001', 'cm7jv6k8k0014xjrcso65x1qx', 'Physics', 'ONLINE', '2024-01-15 06:00:00', '2024-05-15 08:00:00', 25000, 50, true, true, NOW(), NOW()),

('bch_002', 'JEE Advanced 2024 - Evening Batch', 'jee-advanced-2024-evening', 'crs_001', 'cm7jv6k8k0014xjrcso65x1qx', 'Physics', 'ONLINE', '2024-01-15 18:00:00', '2024-05-15 20:00:00', 25000, 50, true, true, NOW(), NOW()),

('bch_003', 'Quantum Physics - Weekend Batch', 'quantum-physics-weekend', 'crs_002', 'cm7jv6k8k0015xjrcso65x1qy', 'Quantum Physics', 'HYBRID', '2024-02-01 09:00:00', '2024-04-30 12:00:00', 15000, 30, true, true, NOW(), NOW()),

('bch_004', 'Electromagnetism - Evening Batch', 'electromagnetism-evening', 'crs_003', 'cm7jv6k8k0016xjrcso65x1qz', 'Electromagnetism', 'ONLINE', '2024-01-20 19:00:00', '2024-03-20 21:00:00', 18000, 40, true, true, NOW(), NOW()),

('bch_005', 'NEET Physics - Crash Course', 'neet-physics-crash', 'crs_004', 'cm7jv6k8k0014xjrcso65x1qx', 'Physics', 'ONLINE', '2024-02-10 17:00:00', '2024-03-30 19:00:00', 12000, 100, true, true, NOW(), NOW()),

('bch_006', 'Class 11 Physics - Morning Batch', 'class11-physics-morning', 'crs_005', 'cm7jv6k8k0015xjrcso65x1qy', 'Physics', 'OFFLINE', '2024-01-10 07:00:00', '2024-04-30 09:00:00', 10000, 40, true, true, NOW(), NOW()),

('bch_007', 'Free Physics Demo Batch', 'free-physics-demo', 'crs_006', 'cm7jv6k8k0016xjrcso65x1qz', 'Physics', 'ONLINE', '2024-01-01 10:00:00', '2024-12-31 11:00:00', 0, 500, true, true, NOW(), NOW());



SELECT * FROM gravity."Student";


INSERT INTO gravity."Enrollment" (
  id,
  "studentId",
  "batchId",
  status,
  "paymentStatus",
  "totalFees",
  "paidAmount",
  "dueAmount",
  "progressPercentage",
  "createdAt",
  "updatedAt"
) VALUES
('enr_001', 'student_rohan_001', 'bch_001', 'APPROVED', 'COMPLETED', 25000, 25000, 0, 75.5, NOW(), NOW()),
('enr_002', 'student_ishita_002', 'bch_005', 'APPROVED', 'COMPLETED', 12000, 12000, 0, 60.0, NOW(), NOW()),
('enr_003', 'student_aditya_003', 'bch_001', 'APPROVED', 'PARTIAL', 25000, 15000, 10000, 45.2, NOW(), NOW()),
('enr_004', 'student_ananya_004', 'bch_002', 'APPROVED', 'COMPLETED', 25000, 25000, 0, 82.3, NOW(), NOW()),
('enr_005', 'student_vikram_005', 'bch_004', 'APPROVED', 'COMPLETED', 18000, 18000, 0, 55.8, NOW(), NOW());



INSERT INTO gravity."Payment" (
  id,
  "enrollmentId",
  "studentId",
  amount,
  "paidAmount",
  method,
  status,
  "transactionId",
  "paymentGateway",
  "paymentDate",
  "invoiceNumber",
  "createdAt",
  "updatedAt"
) VALUES
('pay_001', 'enr_001', 'student_rohan_001', 25000, 25000, 'ONLINE', 'COMPLETED', 'TXN_1001', 'Razorpay', NOW(), 'INV_2024_001', NOW(), NOW()),
('pay_002', 'enr_002', 'student_ishita_002', 12000, 12000, 'UPI', 'COMPLETED', 'TXN_1002', 'Razorpay', NOW(), 'INV_2024_002', NOW(), NOW()),
('pay_003', 'enr_003', 'student_aditya_003', 15000, 15000, 'CARD', 'COMPLETED', 'TXN_1003', 'Stripe', NOW(), 'INV_2024_003', NOW(), NOW()),
('pay_004', 'enr_004', 'student_ananya_004', 25000, 25000, 'NET_BANKING', 'COMPLETED', 'TXN_1004', 'Razorpay', NOW(), 'INV_2024_004', NOW(), NOW()),
('pay_005', 'enr_005', 'student_vikram_005', 18000, 18000, 'ONLINE', 'COMPLETED', 'TXN_1005', 'Razorpay', NOW(), 'INV_2024_005', NOW(), NOW());

