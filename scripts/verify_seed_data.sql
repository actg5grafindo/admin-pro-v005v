-- Verify Seeded Data

-- Check Users
SELECT 
    id, 
    email, 
    username, 
    role, 
    is_active, 
    created_at 
FROM users;

-- Check Profiles
SELECT 
    id, 
    user_id, 
    first_name, 
    last_name, 
    phone_number 
FROM profiles;

-- Check Projects
SELECT 
    id, 
    name, 
    description, 
    status, 
    owner_id 
FROM projects;

-- Check Tasks
SELECT 
    id, 
    project_id, 
    title, 
    description, 
    status, 
    assigned_to, 
    created_by 
FROM tasks;

-- Verify Relationships
SELECT 
    u.email, 
    p.name AS project_name, 
    t.title AS task_title
FROM users u
LEFT JOIN projects p ON u.id = p.owner_id
LEFT JOIN tasks t ON p.id = t.project_id
WHERE u.username = 'adminuser';
