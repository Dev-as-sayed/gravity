-- Active: 1767112952723@@127.0.0.1@5432@gravity
-- ==================================================
-- PHYSICS EDUCATION PLATFORM - COMPLETE DATASET
-- ==================================================

-- ==================================================
-- USERS & PROFILES
-- ==================================================

-- Users (Base users)
INSERT INTO gravity."User" (id, email, password, phone, role, name, bio, "updatedAt") VALUES
('usr_admin_001', 'admin@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543210', 'SUPER_ADMIN', 'Dr. Rajesh Kumar', 'Founder & Head of Physics', NOW()),
('usr_teacher_001', 'dr.sharma@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543211', 'TEACHER', 'Dr. Amit Sharma', 'Senior Physics Faculty, IIT Delhi Alumnus', NOW()),
('usr_teacher_002', 'neha.gupta@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543212', 'TEACHER', 'Neha Gupta', 'Quantum Physics Specialist', NOW()),
('usr_teacher_003', 'rahul.verma@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543213', 'TEACHER', 'Rahul Verma', 'Electromagnetism Expert', NOW()),
('usr_teacher_004', 'priya.singh@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543214', 'TEACHER', 'Priya Singh', 'Mechanics & Thermodynamics', NOW()),
('usr_mod_001', 'moderator@gravityphysics.com', '$2a$10$hashedpassword123', '+919876543215', 'MODERATOR', 'Ankit Mehta', 'Content Moderator', NOW()),
('usr_student_001', 'student.rahul@email.com', '$2a$10$hashedpassword123', '+919876543216', 'STUDENT', 'Rahul Sharma', 'JEE Aspirant 2024', NOW()),
('usr_student_002', 'priya.patel@email.com', '$2a$10$hashedpassword123', '+919876543217', 'STUDENT', 'Priya Patel', 'NEET Aspirant', NOW()),
('usr_student_003', 'akash.kumar@email.com', '$2a$10$hashedpassword123', '+919876543218', 'STUDENT', 'Akash Kumar', 'Physics Enthusiast', NOW()),
('usr_student_004', 'neha.verma@email.com', '$2a$10$hashedpassword123', '+919876543219', 'STUDENT', 'Neha Verma', 'JEE Advanced Target', NOW()),
('usr_student_005', 'vikram.singh@email.com', '$2a$10$hashedpassword123', '+919876543220', 'STUDENT', 'Vikram Singh', 'Olympiad Prep', NOW()),
('usr_student_006', 'anjali.mishra@email.com', '$2a$10$hashedpassword123', '+919876543221', 'STUDENT', 'Anjali Mishra', 'Boards + JEE', NOW()),
('usr_student_007', 'rohit.jain@email.com', '$2a$10$hashedpassword123', '+919876543222', 'STUDENT', 'Rohit Jain', 'Dropper - JEE 2025', NOW()),
('usr_student_008', 'sneha.reddy@email.com', '$2a$10$hashedpassword123', '+919876543223', 'STUDENT', 'Sneha Reddy', 'NEET Aspirant', NOW()),
('usr_guardian_001', 'parent.sharma@email.com', '$2a$10$hashedpassword123', '+919876543224', 'GUARDIAN', 'Mr. Sharma', 'Parent of Rahul Sharma', NOW());

-- Teachers
INSERT INTO "Teacher" (id, userId, name, bio, qualification, expertise, experience, designation, institute) VALUES
('tch_001', 'usr_teacher_001', 'Dr. Amit Sharma', 'PhD in Physics with 15+ years of teaching experience', 'Ph.D. IIT Delhi', ARRAY['Physics', 'Mathematics', 'Quantum Mechanics'], 15, 'Senior Physics Faculty', 'Gravity Physics'),
('tch_002', 'usr_teacher_002', 'Neha Gupta', 'M.Sc. Physics, Quantum Computing Specialist', 'M.Sc. BHU Varanasi', ARRAY['Quantum Physics', 'Atomic Physics', 'Modern Physics'], 8, 'Associate Faculty', 'Gravity Physics'),
('tch_003', 'usr_teacher_003', 'Rahul Verma', 'B.Tech IIT Bombay, Electronics Expert', 'B.Tech IIT Bombay', ARRAY['Electromagnetism', 'Optics', 'Electronics'], 10, 'Senior Faculty', 'Gravity Physics'),
('tch_004', 'usr_teacher_004', 'Priya Singh', 'M.Tech IIT Kanpur, Mechanical Engineer', 'M.Tech IIT Kanpur', ARRAY['Mechanics', 'Thermodynamics', 'Fluid Mechanics'], 7, 'Faculty', 'Gravity Physics');

-- Moderators
INSERT INTO "Moderator" (id, userId, name, assignedBy, permissions) VALUES
('mod_001', 'usr_mod_001', 'Ankit Mehta', 'usr_admin_001', '{"canDeletePosts": true, "canBanUsers": false, "canApproveContent": true}');

-- Students
INSERT INTO "Student" (id, userId, name, institute, educationLevel, class, board, hscYear, group, preferredSubjects, examTargets, guardianId) VALUES
('std_001', 'usr_student_001', 'Rahul Sharma', 'Delhi Public School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics', 'Mathematics'], ARRAY['JEE Main', 'JEE Advanced'], 'grd_001'),
('std_002', 'usr_student_002', 'Priya Patel', 'St. Xavier''s College', 'High School', '12', 'ICSE', 2024, 'Science', ARRAY['Physics', 'Biology'], ARRAY['NEET'], NULL),
('std_003', 'usr_student_003', 'Akash Kumar', 'Kendriya Vidyalaya', 'High School', '11', 'CBSE', 2025, 'Science', ARRAY['Physics', 'Chemistry'], ARRAY['JEE Main'], NULL),
('std_004', 'usr_student_004', 'Neha Verma', 'Army Public School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics', 'Mathematics'], ARRAY['JEE Advanced', 'Olympiad'], 'grd_001'),
('std_005', 'usr_student_005', 'Vikram Singh', 'Modern School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics'], ARRAY['JEE Main', 'BITSAT'], NULL),
('std_006', 'usr_student_006', 'Anjali Mishra', 'DAV Public School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics', 'Mathematics'], ARRAY['JEE Main'], NULL),
('std_007', 'usr_student_007', 'Rohit Jain', 'Delhi Public School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics', 'Mathematics'], ARRAY['JEE Advanced'], NULL),
('std_008', 'usr_student_008', 'Sneha Reddy', 'Chirec Public School', 'High School', '12', 'CBSE', 2024, 'Science', ARRAY['Physics', 'Biology'], ARRAY['NEET'], NULL);

-- Guardians
INSERT INTO "Guardian" (id, userId, name, relationship, occupation) VALUES
('grd_001', 'usr_guardian_001', 'Mr. Sharma', 'Father', 'Engineer');

-- ==================================================
-- COURSES & BATCHES
-- ==================================================

-- Courses
INSERT INTO "Course" (id, title, slug, description, subject, category, teacherId, price, isFree, level, duration, createdAt) VALUES
('crs_001', 'Complete Physics for JEE Advanced', 'complete-physics-jee-advanced', 'Comprehensive physics course covering all topics for JEE Advanced with problem-solving techniques', 'Physics', 'Science', 'tch_001', 25000, false, 'ADVANCED', 200, NOW()),
('crs_002', 'Quantum Mechanics Fundamentals', 'quantum-mechanics-fundamentals', 'Deep dive into quantum physics concepts with mathematical foundations', 'Physics', 'Science', 'tch_002', 15000, false, 'INTERMEDIATE', 60, NOW()),
('crs_003', 'Electromagnetism Mastery', 'electromagnetism-mastery', 'Complete electromagnetism course from basics to advanced', 'Physics', 'Science', 'tch_003', 18000, false, 'ADVANCED', 80, NOW()),
('crs_004', 'NEET Physics Crash Course', 'neet-physics-crash-course', 'Intensive course for NEET physics preparation', 'Physics', 'Science', 'tch_001', 12000, false, 'INTERMEDIATE', 40, NOW()),
('crs_005', 'Class 11 Physics - Complete', 'class-11-physics-complete', 'Full syllabus coverage for CBSE Class 11 Physics', 'Physics', 'Science', 'tch_004', 10000, false, 'BEGINNER', 120, NOW()),
('crs_006', 'Free Physics Fundamentals', 'free-physics-fundamentals', 'Basic physics concepts for beginners - Free course', 'Physics', 'Science', 'tch_001', 0, true, 'BEGINNER', 20, NOW());

-- Batches
INSERT INTO "Batch" (id, name, slug, courseId, teacherId, subject, mode, startDate, endDate, price, maxStudents, enrollmentOpen, isPublished, createdAt) VALUES
('bch_001', 'JEE Advanced 2024 - Morning Batch', 'jee-advanced-2024-morning', 'crs_001', 'tch_001', 'Physics', 'ONLINE', '2024-01-15 06:00:00', '2024-05-15 08:00:00', 25000, 50, true, true, NOW()),
('bch_002', 'JEE Advanced 2024 - Evening Batch', 'jee-advanced-2024-evening', 'crs_001', 'tch_001', 'Physics', 'ONLINE', '2024-01-15 18:00:00', '2024-05-15 20:00:00', 25000, 50, true, true, NOW()),
('bch_003', 'Quantum Physics - Weekend Batch', 'quantum-physics-weekend', 'crs_002', 'tch_002', 'Quantum Physics', 'HYBRID', '2024-02-01 09:00:00', '2024-04-30 12:00:00', 15000, 30, true, true, NOW()),
('bch_004', 'Electromagnetism - Evening Batch', 'electromagnetism-evening', 'crs_003', 'tch_003', 'Electromagnetism', 'ONLINE', '2024-01-20 19:00:00', '2024-03-20 21:00:00', 18000, 40, true, true, NOW()),
('bch_005', 'NEET Physics - Crash Course', 'neet-physics-crash', 'crs_004', 'tch_001', 'Physics', 'ONLINE', '2024-02-10 17:00:00', '2024-03-30 19:00:00', 12000, 100, true, true, NOW()),
('bch_006', 'Class 11 Physics - Morning Batch', 'class11-physics-morning', 'crs_005', 'tch_004', 'Physics', 'OFFLINE', '2024-01-10 07:00:00', '2024-04-30 09:00:00', 10000, 40, true, true, NOW()),
('bch_007', 'Free Physics Demo Batch', 'free-physics-demo', 'crs_006', 'tch_001', 'Physics', 'ONLINE', '2024-01-01 10:00:00', '2024-12-31 11:00:00', 0, 500, true, true, NOW());

-- ==================================================
-- ENROLLMENTS
-- ==================================================

INSERT INTO "Enrollment" (id, studentId, batchId, status, paymentStatus, totalFees, paidAmount, dueAmount, progressPercentage, createdAt) VALUES
('enr_001', 'std_001', 'bch_001', 'APPROVED', 'COMPLETED', 25000, 25000, 0, 75.5, NOW()),
('enr_002', 'std_002', 'bch_005', 'APPROVED', 'COMPLETED', 12000, 12000, 0, 60.0, NOW()),
('enr_003', 'std_003', 'bch_001', 'APPROVED', 'PARTIAL', 25000, 15000, 10000, 45.2, NOW()),
('enr_004', 'std_004', 'bch_002', 'APPROVED', 'COMPLETED', 25000, 25000, 0, 82.3, NOW()),
('enr_005', 'std_005', 'bch_004', 'APPROVED', 'COMPLETED', 18000, 18000, 0, 55.8, NOW()),
('enr_006', 'std_006', 'bch_001', 'PENDING', 'PENDING', 25000, 0, 25000, 0, NOW()),
('enr_007', 'std_007', 'bch_003', 'APPROVED', 'COMPLETED', 15000, 15000, 0, 90.1, NOW()),
('enr_008', 'std_008', 'bch_005', 'APPROVED', 'PARTIAL', 12000, 6000, 6000, 35.5, NOW()),
('enr_009', 'std_001', 'bch_003', 'APPROVED', 'COMPLETED', 15000, 15000, 0, 85.0, NOW()),
('enr_010', 'std_003', 'bch_007', 'APPROVED', 'COMPLETED', 0, 0, 0, 30.0, NOW());

-- ==================================================
-- PAYMENTS
-- ==================================================

INSERT INTO gravity."Payment" (id, enrollmentId, studentId, amount, paidAmount, method, status, transactionId, paymentGateway, paymentDate, invoiceNumber) VALUES
('pay_001', 'enr_001', 'std_001', 25000, 25000, 'ONLINE', 'COMPLETED', 'TXN_1001', 'Razorpay', NOW(), 'INV_2024_001'),
('pay_002', 'enr_002', 'std_002', 12000, 12000, 'UPI', 'COMPLETED', 'TXN_1002', 'Razorpay', NOW(), 'INV_2024_002'),
('pay_003', 'enr_003', 'std_003', 15000, 15000, 'CARD', 'COMPLETED', 'TXN_1003', 'Stripe', NOW(), 'INV_2024_003'),
('pay_004', 'enr_004', 'std_004', 25000, 25000, 'NET_BANKING', 'COMPLETED', 'TXN_1004', 'Razorpay', NOW(), 'INV_2024_004'),
('pay_005', 'enr_005', 'std_005', 18000, 18000, 'ONLINE', 'COMPLETED', 'TXN_1005', 'Razorpay', NOW(), 'INV_2024_005'),
('pay_006', 'enr_007', 'std_007', 15000, 15000, 'UPI', 'COMPLETED', 'TXN_1006', 'PhonePe', NOW(), 'INV_2024_006'),
('pay_007', 'enr_008', 'std_008', 6000, 6000, 'CARD', 'PARTIAL', 'TXN_1007', 'Stripe', NOW(), 'INV_2024_007'),
('pay_008', 'enr_009', 'std_001', 15000, 15000, 'ONLINE', 'COMPLETED', 'TXN_1008', 'Razorpay', NOW(), 'INV_2024_008');

-- ==================================================
-- QUIZZES & QUESTIONS
-- ==================================================

-- Quizzes
INSERT INTO "Quiz" (id, title, description, teacherId, batchId, timeLimit, totalMarks, passingMarks, negativeMarking, status, subject, difficulty, createdAt) VALUES
('qz_001', 'Mechanics Basics Quiz', 'Test your understanding of Newton''s Laws and Kinematics', 'tch_001', 'bch_001', 30, 50, 30, 0.25, 'PUBLISHED', 'Mechanics', 'INTERMEDIATE', NOW()),
('qz_002', 'Quantum Physics Fundamentals', 'Schrödinger equation, wave functions, and quantum states', 'tch_002', 'bch_003', 45, 100, 60, 0.33, 'PUBLISHED', 'Quantum Physics', 'ADVANCED', NOW()),
('qz_003', 'Electromagnetism - Maxwell''s Equations', 'Comprehensive test on EM theory', 'tch_003', 'bch_004', 40, 75, 45, 0.25, 'PUBLISHED', 'Electromagnetism', 'ADVANCED', NOW()),
('qz_004', 'NEET Physics - Mock Test 1', 'Full syllabus mock test for NEET preparation', 'tch_001', 'bch_005', 60, 180, 108, 0.25, 'PUBLISHED', 'Physics', 'INTERMEDIATE', NOW()),
('qz_005', 'Class 11 - Kinematics', 'Motion in straight line and plane', 'tch_004', 'bch_006', 25, 40, 24, 0, 'PUBLISHED', 'Kinematics', 'BEGINNER', NOW()),
('qz_006', 'JEE Advanced - Rotational Motion', 'Advanced level problems on rigid body dynamics', 'tch_001', 'bch_002', 50, 120, 72, 0.5, 'PUBLISHED', 'Rotational Mechanics', 'EXPERT', NOW());

-- Questions for Quiz 1 (Mechanics)
INSERT INTO "Question" (id, quizId, text, type, options, correctAnswer, explanation, marks, negativeMarks, order) VALUES
('q_001', 'qz_001', 'A ball is thrown vertically upward with velocity 20 m/s. What is the maximum height reached? (g = 10 m/s²)', 'MCQ', '["10 m", "15 m", "20 m", "25 m"]', '{"answer": 2}', 'Using v² = u² - 2gh, at max height v=0, so h = u²/2g = 400/20 = 20m', 5, 1.25, 1),
('q_002', 'qz_001', 'Newton''s First Law is also known as:', 'MCQ', '["Law of Inertia", "Law of Force", "Law of Action-Reaction", "Law of Gravitation"]', '{"answer": 0}', 'Newton''s First Law describes inertia - objects maintain their state of motion unless acted upon by external force', 5, 1.25, 2),
('q_003', 'qz_001', 'A force of 10 N acts on a 2 kg mass. What is the acceleration?', 'MCQ', '["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"]', '{"answer": 1}', 'F = ma, so a = F/m = 10/2 = 5 m/s²', 5, 1.25, 3),
('q_004', 'qz_001', 'Which of Newton''s laws explains rocket propulsion?', 'MCQ', '["First Law", "Second Law", "Third Law", "Law of Gravitation"]', '{"answer": 2}', 'Rockets work on action-reaction principle - third law of motion', 5, 1.25, 4),
('q_005', 'qz_001', 'A car of mass 1000 kg moving at 20 m/s comes to rest in 5 seconds. Find the braking force.', 'MCQ', '["2000 N", "4000 N", "5000 N", "10000 N"]', '{"answer": 1}', 'a = (v-u)/t = (0-20)/5 = -4 m/s², F = ma = 1000 × 4 = 4000 N', 5, 1.25, 5);

-- Questions for Quiz 2 (Quantum Physics)
INSERT INTO "Question" (id, quizId, text, type, options, correctAnswer, explanation, marks, negativeMarks, order) VALUES
('q_006', 'qz_002', 'What does the Schrödinger equation describe?', 'MCQ', '["Motion of particles", "Wave function evolution", "Energy quantization", "Spin of electrons"]', '{"answer": 1}', 'The Schrödinger equation describes how the quantum state (wave function) of a physical system changes over time', 10, 3.33, 1),
('q_007', 'qz_002', 'The uncertainty principle states that:', 'MCQ', '["Δx × Δp ≥ ħ/2", "ΔE × Δt ≤ ħ", "Δx × Δp = 0", "E = mc²"]', '{"answer": 0}', 'Heisenberg''s uncertainty principle: Δx Δp ≥ ħ/2', 10, 3.33, 2),
('q_008', 'qz_002', 'What is the de Broglie wavelength of an electron moving with velocity 10⁶ m/s? (h = 6.63×10⁻³⁴ Js, mₑ = 9.1×10⁻³¹ kg)', 'MCQ', '["7.28 × 10⁻¹⁰ m", "6.63 × 10⁻¹⁰ m", "9.1 × 10⁻¹⁰ m", "3.64 × 10⁻¹⁰ m"]', '{"answer": 0}', 'λ = h/mv = 6.63×10⁻³⁴/(9.1×10⁻³¹ × 10⁶) = 7.28×10⁻¹⁰ m', 10, 3.33, 3);

-- ==================================================
-- QUIZ ATTEMPTS & RESULTS
-- ==================================================

INSERT INTO "QuizAttempt" (id, quizId, studentId, attemptNumber, startTime, endTime, score, percentage, isPassed, isCompleted) VALUES
('qa_001', 'qz_001', 'std_001', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes', 35, 70, true, true),
('qa_002', 'qz_001', 'std_004', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '28 minutes', 42, 84, true, true),
('qa_003', 'qz_002', 'std_007', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes', 75, 75, true, true),
('qa_004', 'qz_002', 'std_001', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '42 minutes', 82, 82, true, true),
('qa_005', 'qz_003', 'std_005', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '35 minutes', 55, 73.3, true, true),
('qa_006', 'qz_004', 'std_002', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '55 minutes', 120, 66.7, true, true),
('qa_007', 'qz_004', 'std_008', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '58 minutes', 95, 52.8, false, true),
('qa_008', 'qz_006', 'std_004', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '45 minutes', 85, 70.8, true, true);

INSERT INTO "QuizResult" (id, attemptId, studentId, quizId, totalMarks, obtainedMarks, percentage, rank, totalParticipants) VALUES
('qr_001', 'qa_001', 'std_001', 'qz_001', 50, 35, 70, 3, 15),
('qr_002', 'qa_002', 'std_004', 'qz_001', 50, 42, 84, 1, 15),
('qr_003', 'qa_003', 'std_007', 'qz_002', 100, 75, 75, 2, 12),
('qr_004', 'qa_004', 'std_001', 'qz_002', 100, 82, 82, 1, 12),
('qr_005', 'qa_005', 'std_005', 'qz_003', 75, 55, 73.3, 3, 8),
('qr_006', 'qa_006', 'std_002', 'qz_004', 180, 120, 66.7, 5, 25),
('qr_007', 'qa_007', 'std_008', 'qz_004', 180, 95, 52.8, 18, 25),
('qr_008', 'qa_008', 'std_004', 'qz_006', 120, 85, 70.8, 2, 10);

-- ==================================================
-- EXAMS
-- ==================================================

INSERT INTO "Exam" (id, title, description, teacherId, batchId, type, subject, fullMarks, passMarks, examDate, startTime, endTime, duration, status, createdAt) VALUES
('ex_001', 'JEE Advanced Mock Test - Paper 1', 'Full syllabus mock test for JEE Advanced', 'tch_001', 'bch_001', 'Mock Test', 'Physics', 180, 90, '2024-03-15', '2024-03-15 09:00:00', '2024-03-15 12:00:00', 180, 'SCHEDULED', NOW()),
('ex_002', 'Quantum Physics Mid-Term', 'Mid-term examination for quantum physics course', 'tch_002', 'bch_003', 'Model Test', 'Quantum Physics', 100, 50, '2024-03-10', '2024-03-10 10:00:00', '2024-03-10 12:00:00', 120, 'COMPLETED', NOW()),
('ex_003', 'Electromagnetism - Final Exam', 'Comprehensive final exam', 'tch_003', 'bch_004', 'Final', 'Electromagnetism', 150, 75, '2024-03-20', '2024-03-20 14:00:00', '2024-03-20 17:00:00', 180, 'DRAFT', NOW()),
('ex_004', 'NEET Physics - Weekly Test', 'Weekly assessment for NEET batch', 'tch_001', 'bch_005', 'Weekly', 'Physics', 90, 45, '2024-02-25', '2024-02-25 16:00:00', '2024-02-25 18:00:00', 120, 'RESULT_PUBLISHED', NOW());

-- Exam Results
INSERT INTO "ExamResult" (id, examId, studentId, obtainedMarks, totalMarks, percentage, grade, rank, percentile, createdAt) VALUES
('er_001', 'ex_002', 'std_007', 85, 100, 85, 'A', 1, 98.5, NOW()),
('er_002', 'ex_002', 'std_001', 78, 100, 78, 'B+', 2, 92.0, NOW()),
('er_003', 'ex_004', 'std_002', 68, 90, 75.6, 'B', 4, 85.0, NOW()),
('er_004', 'ex_004', 'std_008', 52, 90, 57.8, 'C', 12, 45.0, NOW());

-- ==================================================
-- ASSIGNMENTS
-- ==================================================

INSERT INTO "Assignment" (id, title, description, teacherId, batchId, type, totalMarks, passingMarks, dueDate, status, createdAt) VALUES
('asg_001', 'Kinematics Problem Set', 'Practice problems on motion in 1D and 2D', 'tch_001', 'bch_001', 'HOMEWORK', 50, 25, '2024-02-20 23:59:59', 'PUBLISHED', NOW()),
('asg_002', 'Quantum Mechanics - Problem Set 1', 'Schrödinger equation and wave functions', 'tch_002', 'bch_003', 'PRACTICE', 100, 50, '2024-02-25 23:59:59', 'PUBLISHED', NOW()),
('asg_003', 'Electrostatics Assignment', 'Problems on Coulomb''s law and electric fields', 'tch_003', 'bch_004', 'HOMEWORK', 75, 38, '2024-02-28 23:59:59', 'PUBLISHED', NOW()),
('asg_004', 'NEET Physics - Practice Set 1', 'Previous year NEET questions', 'tch_001', 'bch_005', 'PRACTICE', 90, 45, '2024-02-22 23:59:59', 'PUBLISHED', NOW());

-- Assignment Submissions
INSERT INTO "AssignmentSubmission" (id, assignmentId, studentId, submittedAt, status, obtainedMarks, feedback, gradedBy, gradedAt) VALUES
('sub_001', 'asg_001', 'std_001', '2024-02-19 20:30:00', 'GRADED', 42, 'Good work! Few mistakes in 2D motion', 'tch_001', NOW()),
('sub_002', 'asg_001', 'std_004', '2024-02-18 15:45:00', 'GRADED', 48, 'Excellent! Keep it up', 'tch_001', NOW()),
('sub_003', 'asg_002', 'std_007', '2024-02-24 22:00:00', 'GRADED', 85, 'Great understanding of quantum concepts', 'tch_002', NOW()),
('sub_004', 'asg_002', 'std_001', '2024-02-24 21:15:00', 'GRADED', 92, 'Outstanding!', 'tch_002', NOW()),
('sub_005', 'asg_004', 'std_002', '2024-02-21 18:30:00', 'GRADED', 68, 'Need more practice on optics', 'tch_001', NOW());

-- ==================================================
-- ATTENDANCE
-- ==================================================

INSERT INTO "Attendance" (id, studentId, batchId, date, status, checkInTime, checkOutTime, markedBy) VALUES
('att_001', 'std_001', 'bch_001', '2024-02-01', 'PRESENT', '2024-02-01 06:00:00', '2024-02-01 08:00:00', 'tch_001'),
('att_002', 'std_001', 'bch_001', '2024-02-02', 'PRESENT', '2024-02-02 06:00:00', '2024-02-02 08:00:00', 'tch_001'),
('att_003', 'std_001', 'bch_001', '2024-02-03', 'LATE', '2024-02-03 06:15:00', '2024-02-03 08:00:00', 'tch_001'),
('att_004', 'std_004', 'bch_002', '2024-02-01', 'PRESENT', '2024-02-01 18:00:00', '2024-02-01 20:00:00', 'tch_001'),
('att_005', 'std_004', 'bch_002', '2024-02-02', 'PRESENT', '2024-02-02 18:00:00', '2024-02-02 20:00:00', 'tch_001'),
('att_006', 'std_007', 'bch_003', '2024-02-03', 'PRESENT', '2024-02-03 09:00:00', '2024-02-03 12:00:00', 'tch_002'),
('att_007', 'std_002', 'bch_005', '2024-02-10', 'PRESENT', '2024-02-10 17:00:00', '2024-02-10 19:00:00', 'tch_001'),
('att_008', 'std_002', 'bch_005', '2024-02-11', 'ABSENT', NULL, NULL, 'tch_001');

-- ==================================================
-- LIVE SESSIONS
-- ==================================================

INSERT INTO "LiveSession" (id, title, description, teacherId, batchId, startTime, endTime, duration, platform, meetingUrl, isLive, isCompleted, createdAt) VALUES
('ls_001', 'Kinematics - Motion in 1D', 'Introduction to position, velocity, acceleration', 'tch_001', 'bch_001', '2024-02-05 06:00:00', '2024-02-05 08:00:00', 120, 'Zoom', 'https://zoom.us/j/123456789', false, true, NOW()),
('ls_002', 'Newton''s Laws of Motion', 'Detailed explanation with examples', 'tch_001', 'bch_001', '2024-02-07 06:00:00', '2024-02-07 08:00:00', 120, 'Zoom', 'https://zoom.us/j/123456790', false, true, NOW()),
('ls_003', 'Quantum States and Wave Functions', 'Introduction to quantum mechanics', 'tch_002', 'bch_003', '2024-02-10 09:00:00', '2024-02-10 12:00:00', 180, 'Google Meet', 'https://meet.google.com/abc-defg-hij', false, true, NOW()),
('ls_004', 'Schrödinger Equation - Part 1', 'Time-dependent and time-independent equations', 'tch_002', 'bch_003', '2024-02-17 09:00:00', '2024-02-17 12:00:00', 180, 'Google Meet', 'https://meet.google.com/abc-defg-hij', false, false, NOW()),
('ls_005', 'Electric Fields and Gauss Law', 'Electromagnetism basics', 'tch_003', 'bch_004', '2024-02-12 19:00:00', '2024-02-12 21:00:00', 120, 'Zoom', 'https://zoom.us/j/123456791', false, true, NOW());

-- Live Session Attendance
INSERT INTO "LiveSessionAttendance" (id, sessionId, studentId, joinedAt, leftAt, duration, isPresent) VALUES
('lsa_001', 'ls_001', 'std_001', '2024-02-05 06:00:00', '2024-02-05 08:00:00', 7200, true),
('lsa_002', 'ls_001', 'std_004', '2024-02-05 06:05:00', '2024-02-05 08:00:00', 6900, true),
('lsa_003', 'ls_002', 'std_001', '2024-02-07 06:00:00', '2024-02-07 08:00:00', 7200, true),
('lsa_004', 'ls_003', 'std_007', '2024-02-10 09:00:00', '2024-02-10 12:00:00', 10800, true),
('lsa_005', 'ls_003', 'std_001', '2024-02-10 09:10:00', '2024-02-10 12:00:00', 10200, true);

-- ==================================================
-- DOUBTS
-- ==================================================

INSERT INTO "Doubt" (id, title, description, studentId, batchId, subject, status, priority, assignedTo, createdAt) VALUES
('dbt_001', 'Confusion about Newton''s Third Law', 'How does action-reaction pair work when a person is walking? The force on ground and on person - are they equal?', 'std_001', 'bch_001', 'Mechanics', 'ANSWERED', 'MEDIUM', 'tch_001', NOW() - INTERVAL '5 days'),
('dbt_002', 'Schrödinger equation interpretation', 'What exactly is the physical meaning of the wave function ψ? Is it a real wave or just probability?', 'std_007', 'bch_003', 'Quantum Physics', 'OPEN', 'HIGH', 'tch_002', NOW() - INTERVAL '2 days'),
('dbt_003', 'Electric field inside conductor', 'Why is electric field zero inside a conductor? Need intuitive explanation.', 'std_005', 'bch_004', 'Electromagnetism', 'ANSWERED', 'LOW', 'tch_003', NOW() - INTERVAL '3 days'),
('dbt_004', 'Projectile motion time of flight', 'In projectile motion, why is time of flight same for complementary angles?', 'std_003', 'bch_001', 'Kinematics', 'RESOLVED', 'MEDIUM', 'tch_001', NOW() - INTERVAL '4 days');

-- Doubt Answers
INSERT INTO "DoubtAnswer" (id, doubtId, teacherId, content, isOfficial, isAccepted, createdAt) VALUES
('dba_001', 'dbt_001', 'tch_001', 'Great question! When a person walks, they push the ground backward. By Newton''s Third Law, the ground pushes the person forward with equal magnitude. This forward force is what propels the person. The forces act on different objects (ground and person), so they don''t cancel out.', true, true, NOW() - INTERVAL '4 days'),
('dba_002', 'dbt_003', 'tch_003', 'Inside a conductor, free electrons rearrange themselves to cancel any external electric field. In electrostatic equilibrium, the net field must be zero because any field would cause current flow until equilibrium is reached.', true, true, NOW() - INTERVAL '2 days'),
('dba_003', 'dbt_004', 'tch_001', 'For projectile motion, T = 2u sinθ/g. For complementary angles (θ and 90°-θ), sinθ and cosθ give same product. So time of flight is equal for pairs like 30° and 60°.', true, true, NOW() - INTERVAL '3 days');

-- ==================================================
-- POSTS & COMMUNITY CONTENT
-- ==================================================

-- Posts
INSERT INTO "Post" (id, title, content, type, status, visibility, teacherId, batchId, views, shares, isFeatured, createdAt) VALUES
('pst_001', '5 Tips to Master Physics for JEE', 'Physics requires conceptual clarity and consistent practice. Here are 5 proven strategies...', 'TEXT', 'PUBLISHED', 'PUBLIC', 'tch_001', NULL, 1250, 45, true, NOW() - INTERVAL '10 days'),
('pst_002', 'Understanding Quantum Entanglement', 'Quantum entanglement is a phenomenon where particles become interconnected...', 'TEXT', 'PUBLISHED', 'PUBLIC', 'tch_002', NULL, 890, 32, true, NOW() - INTERVAL '8 days'),
('pst_003', 'Important Formulas for JEE Advanced', 'Here''s a comprehensive formula sheet for JEE Advanced Physics...', 'TEXT', 'PUBLISHED', 'STUDENTS_ONLY', 'tch_001', 'bch_001', 342, 18, false, NOW() - INTERVAL '5 days'),
('pst_004', 'Doubt Thread: Rotational Motion', 'Post your doubts related to rotational motion here', 'TEXT', 'PUBLISHED', 'BATCH_ONLY', 'tch_001', 'bch_002', 156, 5, false, NOW() - INTERVAL '3 days');

-- Post Reactions
INSERT INTO "PostReaction" (id, postId, studentId, type, createdAt) VALUES
('pr_001', 'pst_001', 'std_001', 'LIKE', NOW() - INTERVAL '9 days'),
('pr_002', 'pst_001', 'std_004', 'LOVE', NOW() - INTERVAL '9 days'),
('pr_003', 'pst_001', 'std_003', 'HELPFUL', NOW() - INTERVAL '9 days'),
('pr_004', 'pst_002', 'std_007', 'LIKE', NOW() - INTERVAL '7 days'),
('pr_005', 'pst_002', 'std_001', 'WOW', NOW() - INTERVAL '7 days');

-- Comments
INSERT INTO "Comment" (id, content, postId, studentId, createdAt) VALUES
('cmt_001', 'Thank you for these tips! Really helpful for my preparation.', 'pst_001', 'std_003', NOW() - INTERVAL '9 days'),
('cmt_002', 'Could you explain the concept of quantum tunneling in more detail?', 'pst_002', 'std_007', NOW() - INTERVAL '7 days'),
('cmt_003', 'This formula sheet is exactly what I needed!', 'pst_003', 'std_004', NOW() - INTERVAL '4 days');

-- Comment Reactions
INSERT INTO "CommentReaction" (id, commentId, studentId, type, createdAt) VALUES
('cr_001', 'cmt_001', 'std_001', 'LIKE', NOW() - INTERVAL '9 days'),
('cr_002', 'cmt_002', 'std_001', 'HELPFUL', NOW() - INTERVAL '7 days');

-- ==================================================
-- ANNOUNCEMENTS
-- ==================================================

INSERT INTO "Announcement" (id, title, content, batchId, isUrgent, isPinned, createdBy, createdAt) VALUES
('ann_001', 'JEE Advanced Mock Test Schedule', 'The first mock test will be held on March 15th, 2024 from 9 AM to 12 PM. Please be online 15 minutes early.', 'bch_001', true, true, 'tch_001', NOW() - INTERVAL '7 days'),
('ann_002', 'Class Reschedule Notice', 'Due to unavoidable circumstances, tomorrow''s class is rescheduled to Friday 6 PM.', 'bch_002', true, false, 'tch_001', NOW() - INTERVAL '2 days'),
('ann_003', 'Assignment Submission Deadline Extended', 'The Quantum Physics assignment deadline has been extended to Feb 25th.', 'bch_003', false, false, 'tch_002', NOW() - INTERVAL '3 days'),
('ann_004', 'Doubt Solving Session Tomorrow', 'Special doubt clearing session for Electromagnetism tomorrow at 8 PM.', 'bch_004', false, true, 'tch_003', NOW() - INTERVAL '1 day');

-- ==================================================
-- NOTIFICATIONS
-- ==================================================

INSERT INTO "Notification" (id, userId, type, channel, title, message, isRead, createdAt) VALUES
('not_001', 'usr_student_001', 'CLASS_REMINDER', 'INAPP', 'Class Reminder', 'Your Mechanics class starts in 30 minutes', false, NOW() - INTERVAL '1 hour'),
('not_002', 'usr_student_001', 'EXAM_UPDATE', 'EMAIL', 'Exam Schedule Updated', 'JEE Advanced Mock Test scheduled for March 15th', true, NOW() - INTERVAL '7 days'),
('not_003', 'usr_student_002', 'PAYMENT_REMINDER', 'SMS', 'Payment Due', 'Your installment payment of ₹6000 is due on Feb 25th', false, NOW() - INTERVAL '2 days'),
('not_004', 'usr_student_007', 'DOUBT_RESOLVED', 'INAPP', 'Doubt Resolved', 'Your doubt about Schrödinger equation has been answered', false, NOW() - INTERVAL '1 day'),
('not_005', 'usr_student_004', 'RESULT_ANNOUNCEMENT', 'INAPP', 'Quiz Results Published', 'Your Quantum Physics quiz results are now available', true, NOW() - INTERVAL '2 days');

-- ==================================================
-- STUDENT PROGRESS
-- ==================================================

INSERT INTO "StudentProgress" (id, studentId, batchId, avgQuizScore, avgExamScore, attendance, assignmentsCompleted, totalAssignments, weakTopics, strongTopics, lastActive, updatedAt) VALUES
('sp_001', 'std_001', 'bch_001', 76.5, 78.0, 85.5, 4, 5, ARRAY['Rotational Motion', 'Waves'], ARRAY['Kinematics', 'Newton''s Laws'], NOW(), NOW()),
('sp_002', 'std_001', 'bch_003', 87.0, 85.0, 90.0, 2, 2, ARRAY['Quantum Statistics'], ARRAY['Wave Functions', 'Schrödinger Equation'], NOW(), NOW()),
('sp_003', 'std_004', 'bch_002', 77.4, NULL, 92.0, 3, 3, ARRAY['Thermodynamics'], ARRAY['Mechanics', 'Kinematics'], NOW(), NOW()),
('sp_004', 'std_007', 'bch_003', 78.5, 85.0, 88.0, 2, 2, ARRAY['Matrix Mechanics'], ARRAY['Wave-Particle Duality'], NOW(), NOW()),
('sp_005', 'std_002', 'bch_005', 60.2, 75.6, 70.0, 1, 3, ARRAY['Optics', 'Modern Physics'], ARRAY['Mechanics'], NOW(), NOW());

-- ==================================================
-- BATCH MATERIALS
-- ==================================================

INSERT INTO "BatchMaterial" (id, batchId, title, description, type, fileUrl, uploadedBy, downloads, views, createdAt) VALUES
('mat_001', 'bch_001', 'Kinematics Formula Sheet', 'Complete formula sheet for kinematics', 'NOTE', 'https://storage.gravityphysics.com/kinematics_formula.pdf', 'tch_001', 45, 128, NOW() - INTERVAL '15 days'),
('mat_002', 'bch_001', 'Newton''s Laws Problem Set', '50 practice problems with solutions', 'PRACTICE_SET', 'https://storage.gravityphysics.com/newton_problems.pdf', 'tch_001', 38, 95, NOW() - INTERVAL '10 days'),
('mat_003', 'bch_003', 'Quantum Mechanics Lecture 1 - Video', 'Introduction to quantum mechanics', 'VIDEO', 'https://storage.gravityphysics.com/qm_lecture1.mp4', 'tch_002', 28, 156, NOW() - INTERVAL '20 days'),
('mat_004', 'bch_004', 'Electrostatics Notes', 'Comprehensive notes on electrostatics', 'NOTE', 'https://storage.gravityphysics.com/electrostatics.pdf', 'tch_003', 32, 87, NOW() - INTERVAL '12 days');

-- ==================================================
-- COURSE REVIEWS
-- ==================================================

INSERT INTO "BatchReview" (id, batchId, studentId, rating, comment, pros, cons, createdAt) VALUES
('br_001', 'bch_001', 'std_001', 5, 'Excellent course! Dr. Sharma explains concepts very clearly.', ARRAY['Great teaching', 'Good problem sets', 'Regular doubt sessions'], ARRAY['Fast pace sometimes'], NOW() - INTERVAL '5 days'),
('br_002', 'bch_001', 'std_003', 4, 'Very helpful for JEE preparation', ARRAY['Comprehensive coverage', 'Good study material'], ARRAY['More practice problems needed'], NOW() - INTERVAL '3 days'),
('br_003', 'bch_003', 'std_007', 5, 'Best quantum physics course I''ve taken!', ARRAY['Deep insights', 'Mathematical rigor'], ARRAY['None'], NOW() - INTERVAL '2 days');

-- ==================================================
-- CERTIFICATES
-- ==================================================

INSERT INTO "Certificate" (id, certificateNumber, type, title, studentId, teacherId, batchId, issueDate, pdfUrl, createdAt) VALUES
('cert_001', 'GPHY-CERT-2024-001', 'COURSE_COMPLETION', 'Quantum Physics Fundamentals', 'std_007', 'tch_002', 'bch_003', NOW() - INTERVAL '1 day', 'https://storage.gravityphysics.com/certificates/std007_qm.pdf', NOW() - INTERVAL '1 day'),
('cert_002', 'GPHY-CERT-2024-002', 'ACHIEVEMENT', 'Top Performer - Mechanics', 'std_004', 'tch_001', 'bch_002', NOW() - INTERVAL '3 days', 'https://storage.gravityphysics.com/certificates/std004_mech.pdf', NOW() - INTERVAL '3 days');

-- ==================================================
-- SUPPORT TICKETS
-- ==================================================

INSERT INTO "SupportTicket" (id, ticketNumber, userId, subject, description, category, priority, status, createdAt) VALUES
('stk_001', 'TKT-2024-001', 'usr_student_003', 'Unable to access recorded lectures', 'The recorded lectures for last week are showing error when I try to play them', 'TECHNICAL', 'MEDIUM', 'RESOLVED', NOW() - INTERVAL '5 days'),
('stk_002', 'TKT-2024-002', 'usr_student_008', 'Payment gateway issue', 'My payment was deducted but enrollment not showing', 'PAYMENT', 'HIGH', 'IN_PROGRESS', NOW() - INTERVAL '2 days'),
('stk_003', 'TKT-2024-003', 'usr_guardian_001', 'Want to upgrade my child''s batch', 'Please guide me on upgrading from morning to evening batch', 'ACCOUNT', 'LOW', 'OPEN', NOW() - INTERVAL '1 day');

-- Ticket Messages
INSERT INTO "TicketMessage" (id, ticketId, senderId, message, createdAt) VALUES
('tkm_001', 'stk_001', 'usr_student_003', 'I have tried multiple browsers but still can''t access the recordings', NOW() - INTERVAL '5 days'),
('tkm_002', 'stk_001', 'usr_mod_001', 'We have fixed the issue. Please try again now.', NOW() - INTERVAL '4 days'),
('tkm_003', 'stk_002', 'usr_student_008', 'Transaction ID: TXN_1007, Amount: ₹6000', NOW() - INTERVAL '2 days'),
('tkm_004', 'stk_002', 'usr_admin_001', 'We are looking into this. Will update within 24 hours.', NOW() - INTERVAL '1 day');

-- ==================================================
-- USER ACTIVITY LOGS
-- ==================================================

INSERT INTO "UserActivity" (id, userId, action, entity, entityId, createdAt) VALUES
('ua_001', 'usr_student_001', 'LOGIN', NULL, NULL, NOW() - INTERVAL '2 hours'),
('ua_002', 'usr_student_001', 'VIEW_BATCH', 'Batch', 'bch_001', NOW() - INTERVAL '1 hour'),
('ua_003', 'usr_student_001', 'TAKE_QUIZ', 'Quiz', 'qz_001', NOW() - INTERVAL '30 minutes'),
('ua_004', 'usr_student_004', 'LOGIN', NULL, NULL, NOW() - INTERVAL '3 hours'),
('ua_005', 'usr_student_004', 'DOWNLOAD_MATERIAL', 'BatchMaterial', 'mat_001', NOW() - INTERVAL '2 hours'),
('ua_006', 'usr_teacher_001', 'CREATE_ANNOUNCEMENT', 'Announcement', 'ann_001', NOW() - INTERVAL '1 day'),
('ua_007', 'usr_teacher_002', 'GRADE_ASSIGNMENT', 'Assignment', 'asg_002', NOW() - INTERVAL '12 hours');

-- ==================================================
-- SYSTEM CONFIGURATION
-- ==================================================

INSERT INTO "SystemConfig" (id, key, value, category, description, isPublic, createdAt) VALUES
('cfg_001', 'platform_name', '"Gravity Physics"', 'general', 'Name of the platform', true, NOW()),
('cfg_002', 'max_batch_size', '50', 'batches', 'Maximum students per batch', false, NOW()),
('cfg_003', 'default_pass_percentage', '40', 'grading', 'Default passing percentage', false, NOW()),
('cfg_004', 'quiz_retake_delay_hours', '24', 'quizzes', 'Hours to wait before quiz retake', false, NOW()),
('cfg_005', 'maintenance_mode', 'false', 'system', 'Platform maintenance status', true, NOW());

-- ==================================================
-- COUPONS
-- ==================================================

INSERT INTO "Coupon" (id, code, description, discountType, discountValue, validFrom, validUntil, maxUses, usedCount, isActive, createdAt) VALUES
('cpn_001', 'JEE2024', '10% off on JEE Advanced batches', 'PERCENTAGE', 10, '2024-01-01', '2024-05-31', 100, 25, true, NOW()),
('cpn_002', 'NEET50', '₹500 off on NEET course', 'FIXED', 500, '2024-01-01', '2024-04-30', 50, 12, true, NOW()),
('cpn_003', 'EARLYBIRD20', '20% early bird discount', 'PERCENTAGE', 20, '2024-01-01', '2024-02-15', 30, 8, true, NOW());

-- ==================================================
-- REFERRALS
-- ==================================================

INSERT INTO "Referral" (id, referrerId, referredId, code, status, createdAt) VALUES
('ref_001', 'usr_student_001', 'usr_student_003', 'REF-RAHUL-001', 'COMPLETED', NOW() - INTERVAL '10 days'),
('ref_002', 'usr_student_004', 'usr_student_006', 'REF-NEHA-001', 'COMPLETED', NOW() - INTERVAL '7 days'),
('ref_003', 'usr_student_001', 'usr_student_005', 'REF-RAHUL-002', 'PENDING', NOW() - INTERVAL '3 days');

-- ==================================================
-- SUBSCRIPTION PLANS & TEACHER SUBSCRIPTIONS
-- ==================================================

INSERT INTO "SubscriptionPlan" (id, name, description, price, durationDays, billingCycle, maxStudents, maxBatches, isPopular, isActive, createdAt) VALUES
('plan_001', 'Basic Teacher Plan', 'For individual teachers starting out', 1999, 30, 'MONTHLY', 50, 3, false, true, NOW()),
('plan_002', 'Professional Plan', 'For established teachers with multiple batches', 4999, 30, 'MONTHLY', 200, 10, true, true, NOW()),
('plan_003', 'Institute Plan', 'For coaching institutes and large teams', 14999, 30, 'MONTHLY', 1000, 50, false, true, NOW()),
('plan_004', 'Annual Professional', 'Yearly subscription for professionals', 49990, 365, 'YEARLY', 200, 10, true, true, NOW());

INSERT INTO "TeacherSubscription" (id, teacherId, planId, startDate, endDate, isActive, autoRenew, paymentStatus, createdAt) VALUES
('ts_001', 'tch_001', 'plan_002', '2024-01-01', '2024-01-31', true, true, 'COMPLETED', NOW()),
('ts_002', 'tch_002', 'plan_002', '2024-01-15', '2024-02-14', true, true, 'COMPLETED', NOW()),
('ts_003', 'tch_003', 'plan_001', '2024-01-01', '2024-01-31', true, true, 'COMPLETED', NOW()),
('ts_004', 'tch_004', 'plan_001', '2024-02-01', '2024-03-02', true, true, 'PENDING', NOW());

-- ==================================================
-- LEADS
-- ==================================================

INSERT INTO "Lead" (id, name, phone, email, source, interest, status, score, createdAt) VALUES
('lead_001', 'Amit Kumar', '+919876543225', 'amit.kumar@email.com', 'Facebook', 'JEE Advanced', 'NEW', 75, NOW() - INTERVAL '2 days'),
('lead_002', 'Sunita Sharma', '+919876543226', 'sunita@email.com', 'Website', 'NEET', 'CONTACTED', 85, NOW() - INTERVAL '5 days'),
('lead_003', 'Rajesh Patel', '+919876543227', 'rajesh@email.com', 'WhatsApp', 'Class 11 Physics', 'QUALIFIED', 90, NOW() - INTERVAL '7 days'),
('lead_004', 'Meera Iyer', '+919876543228', 'meera@email.com', 'Referral', 'Quantum Physics', 'NEW', 60, NOW() - INTERVAL '1 day');

-- ==================================================
-- NOTIFICATION PREFERENCES
-- ==================================================

INSERT INTO "NotificationPreference" (id, userId, emailEnabled, smsEnabled, whatsappEnabled, inappEnabled, pushEnabled, createdAt) VALUES
('np_001', 'usr_student_001', true, true, false, true, true, NOW()),
('np_002', 'usr_student_002', true, false, false, true, false, NOW()),
('np_003', 'usr_teacher_001', true, true, true, true, true, NOW()),
('np_004', 'usr_guardian_001', true, true, false, true, false, NOW());

-- ==================================================
-- DEVICE TOKENS
-- ==================================================

INSERT INTO "DeviceToken" (id, userId, token, platform, deviceId, isActive, createdAt) VALUES
('dev_001', 'usr_student_001', 'fcm_token_rahul_001', 'android', 'device_android_001', true, NOW()),
('dev_002', 'usr_student_004', 'apns_token_neha_001', 'ios', 'device_ios_001', true, NOW());

-- ==================================================
-- SESSIONS
-- ==================================================

INSERT INTO "Session" (id, userId, token, refreshToken, ipAddress, device, isActive, expiresAt, createdAt) VALUES
('sess_001', 'usr_student_001', 'session_token_001', 'refresh_token_001', '192.168.1.1', 'Chrome on Windows', true, NOW() + INTERVAL '7 days', NOW()),
('sess_002', 'usr_teacher_001', 'session_token_002', 'refresh_token_002', '192.168.1.2', 'Firefox on Mac', true, NOW() + INTERVAL '7 days', NOW());

-- ==================================================
-- AUDIT LOGS
-- ==================================================

INSERT INTO "AuditLog" (id, userId, action, entity, entityId, changes, ipAddress, createdAt) VALUES
('aud_001', 'usr_admin_001', 'CREATE_BATCH', 'Batch', 'bch_001', '{"name": "JEE Advanced 2024 - Morning Batch"}', '192.168.1.100', NOW() - INTERVAL '30 days'),
('aud_002', 'usr_teacher_001', 'UPDATE_QUIZ', 'Quiz', 'qz_001', '{"status": "PUBLISHED"}', '192.168.1.101', NOW() - INTERVAL '15 days'),
('aud_003', 'usr_mod_001', 'DELETE_COMMENT', 'Comment', 'cmt_003', '{"reason": "Inappropriate content"}', '192.168.1.102', NOW() - INTERVAL '2 days');

-- ==================================================
-- POLLS
-- ==================================================

INSERT INTO "Poll" (id, postId, question, options, multipleChoice, totalVotes, createdAt) VALUES
('poll_001', 'pst_001', 'Which topic do you find most challenging?', '[{"id": "1", "text": "Rotational Motion", "votes": 15}, {"id": "2", "text": "Electromagnetism", "votes": 25}, {"id": "3", "text": "Quantum Physics", "votes": 30}, {"id": "4", "text": "Thermodynamics", "votes": 10}]', false, 80, NOW() - INTERVAL '9 days');

INSERT INTO "PollVote" (id, pollId, studentId, selectedOptions, createdAt) VALUES
('pv_001', 'poll_001', 'std_001', ARRAY['3'], NOW() - INTERVAL '9 days'),
('pv_002', 'poll_001', 'std_003', ARRAY['2'], NOW() - INTERVAL '9 days'),
('pv_003', 'poll_001', 'std_004', ARRAY['1'], NOW() - INTERVAL '9 days'),
('pv_004', 'poll_001', 'std_007', ARRAY['3'], NOW() - INTERVAL '9 days');

-- ==================================================
-- POST BOOKMARKS & COLLECTIONS
-- ==================================================

INSERT INTO "PostCollection" (id, name, description, slug, studentId, isPublic, createdAt) VALUES
('col_001', 'Important JEE Topics', 'Collection of important posts for JEE preparation', 'jee-important-topics', 'std_001', false, NOW() - INTERVAL '10 days');

INSERT INTO "PostBookmark" (id, postId, studentId, collectionId, createdAt) VALUES
('pb_001', 'pst_001', 'std_001', 'col_001', NOW() - INTERVAL '9 days'),
('pb_002', 'pst_003', 'std_001', 'col_001', NOW() - INTERVAL '4 days');

-- ==================================================
-- POST VIEWS & SHARES
-- ==================================================

INSERT INTO "PostView" (id, postId, studentId, viewedAt, duration) VALUES
('pv_001', 'pst_001', 'std_001', NOW() - INTERVAL '9 days', 120),
('pv_002', 'pst_001', 'std_003', NOW() - INTERVAL '9 days', 85),
('pv_003', 'pst_002', 'std_007', NOW() - INTERVAL '7 days', 95);

INSERT INTO "PostShare" (id, postId, studentId, platform, createdAt) VALUES
('ps_001', 'pst_001', 'std_001', 'whatsapp', NOW() - INTERVAL '8 days'),
('ps_002', 'pst_002', 'std_007', 'copy_link', NOW() - INTERVAL '6 days');

-- ==================================================
-- BLOG POSTS
-- ==================================================

INSERT INTO "Blog" (id, title, slug, content, teacherId, featuredImage, isPublished, publishedAt, views, likes, createdAt) VALUES
('blog_001', 'Complete Guide to JEE Physics Preparation', 'jee-physics-complete-guide', 'Physics is often considered the most challenging subject in JEE...', 'tch_001', 'https://storage.gravityphysics.com/blogs/jee-guide.jpg', true, NOW() - INTERVAL '20 days', 2500, 189, NOW() - INTERVAL '20 days'),
('blog_002', 'Quantum Computing for Beginners', 'quantum-computing-basics', 'Quantum computing leverages quantum mechanics principles...', 'tch_002', 'https://storage.gravityphysics.com/blogs/quantum-computing.jpg', true, NOW() - INTERVAL '15 days', 1800, 145, NOW() - INTERVAL '15 days'),
('blog_003', 'How to Score 180/180 in NEET Physics', 'neet-physics-perfect-score', 'Scoring full marks in NEET Physics requires strategy...', 'tch_001', 'https://storage.gravityphysics.com/blogs/neet-physics.jpg', true, NOW() - INTERVAL '10 days', 3200, 267, NOW() - INTERVAL '10 days');

INSERT INTO "BlogComment" (id, blogId, name, email, content, isApproved, createdAt) VALUES
('bc_001', 'blog_001', 'Physics Lover', 'student@email.com', 'Very helpful article! Thank you for the insights.', true, NOW() - INTERVAL '19 days'),
('bc_002', 'blog_002', 'Curious Mind', 'curious@email.com', 'Can you recommend some resources to learn more about quantum gates?', true, NOW() - INTERVAL '14 days');

-- ==================================================
-- INSTALLMENTS
-- ==================================================

INSERT INTO "Installment" (id, enrollmentId, amount, dueDate, status, createdAt) VALUES
('inst_001', 'enr_003', 10000, '2024-03-15', 'PENDING', NOW()),
('inst_002', 'enr_008', 6000, '2024-03-10', 'PENDING', NOW());

-- ==================================================
-- BATCH SCHEDULE (JSON data for schedule field)
-- ==================================================

UPDATE "Batch" SET schedule = '{"monday": "06:00-08:00", "wednesday": "06:00-08:00", "friday": "06:00-08:00"}' WHERE id = 'bch_001';
UPDATE "Batch" SET schedule = '{"tuesday": "18:00-20:00", "thursday": "18:00-20:00", "saturday": "10:00-12:00"}' WHERE id = 'bch_002';
UPDATE "Batch" SET schedule = '{"saturday": "09:00-12:00", "sunday": "09:00-12:00"}' WHERE id = 'bch_003';
UPDATE "Batch" SET schedule = '{"monday": "19:00-21:00", "wednesday": "19:00-21:00", "friday": "19:00-21:00"}' WHERE id = 'bch_004';
UPDATE "Batch" SET schedule = '{"monday": "17:00-19:00", "tuesday": "17:00-19:00", "thursday": "17:00-19:00", "saturday": "16:00-18:00"}' WHERE id = 'bch_005';
UPDATE "Batch" SET schedule = '{"monday": "07:00-09:00", "wednesday": "07:00-09:00", "friday": "07:00-09:00"}' WHERE id = 'bch_006';

-- ==================================================
-- UPDATE STATS (aggregated data)
-- ==================================================

-- Update Course stats
UPDATE "Course" SET totalBatches = (SELECT COUNT(*) FROM "Batch" WHERE "courseId" = "Course".id);
UPDATE "Course" SET totalStudents = (SELECT COUNT(DISTINCT "studentId") FROM "Enrollment" e JOIN "Batch" b ON e."batchId" = b.id WHERE b."courseId" = "Course".id AND e.status = 'APPROVED');

-- Update Teacher stats
UPDATE "Teacher" SET totalStudents = (SELECT COUNT(DISTINCT e."studentId") FROM "Enrollment" e JOIN "Batch" b ON e."batchId" = b.id WHERE b."teacherId" = "Teacher".id AND e.status = 'APPROVED');
UPDATE "Teacher" SET totalBatches = (SELECT COUNT(*) FROM "Batch" WHERE "teacherId" = "Teacher".id);
UPDATE "Teacher" SET totalCourses = (SELECT COUNT(*) FROM "Course" WHERE "teacherId" = "Teacher".id);

-- Update Batch stats
UPDATE "Batch" SET currentEnrollments = (SELECT COUNT(*) FROM "Enrollment" WHERE "batchId" = "Batch".id AND status = 'APPROVED');
UPDATE "Batch" SET averageRating = (SELECT COALESCE(AVG(rating), 0) FROM "BatchReview" WHERE "batchId" = "Batch".id);
UPDATE "Batch" SET totalReviews = (SELECT COUNT(*) FROM "BatchReview" WHERE "batchId" = "Batch".id);

-- ==================================================
-- VIEWS FOR ANALYTICS
-- ==================================================

-- Create view for student performance summary
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    s.id AS student_id,
    s.name AS student_name,
    COUNT(DISTINCT qr.id) AS quizzes_taken,
    AVG(qr.percentage) AS avg_quiz_score,
    COUNT(DISTINCT er.id) AS exams_taken,
    AVG(er.percentage) AS avg_exam_score,
    COUNT(DISTINCT asg.id) AS assignments_submitted
FROM "Student" s
LEFT JOIN "QuizResult" qr ON s.id = qr."studentId"
LEFT JOIN "ExamResult" er ON s.id = er."studentId"
LEFT JOIN "AssignmentSubmission" asg ON s.id = asg."studentId"
GROUP BY s.id, s.name;

-- Create view for batch performance
CREATE OR REPLACE VIEW batch_performance AS
SELECT 
    b.id AS batch_id,
    b.name AS batch_name,
    b."currentEnrollments",
    COUNT(DISTINCT e."studentId") AS enrolled_students,
    AVG(sp."avgQuizScore") AS avg_batch_quiz_score,
    AVG(sp.attendance) AS avg_attendance
FROM "Batch" b
LEFT JOIN "Enrollment" e ON b.id = e."batchId" AND e.status = 'APPROVED'
LEFT JOIN "StudentProgress" sp ON b.id = sp."batchId"
GROUP BY b.id, b.name, b."currentEnrollments";

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollment_batch_status ON "Enrollment"("batchId", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_student_status ON "Payment"("studentId", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_date ON "Attendance"("date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_student ON "QuizAttempt"("studentId", "quizId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_created ON "Post"("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doubt_status ON "Doubt"("status", "assignedTo");