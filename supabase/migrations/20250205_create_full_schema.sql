-- AdminPro Database Schema
-- Version: 1.0
-- Created on: 2025-02-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    username VARCHAR(50),  
    display_name VARCHAR(100),  
    theme VARCHAR(20) DEFAULT 'light',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'planning', -- planning, in_progress, completed, on_hold
    start_date DATE,
    end_date DATE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    visibility VARCHAR(20) DEFAULT 'private', -- private, team, public
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, review, done
    assignee_id UUID REFERENCES users(id),
    creator_id UUID REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    due_date DATE,
    estimated_hours NUMERIC(5,2),
    actual_hours NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Members Table
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, admin, member, viewer
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- Permissions Table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Role Permissions Table
CREATE TABLE role_permissions (
    role_name VARCHAR(20),
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_name, permission_id)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- login, logout, create_project, update_task, etc.
    entity_type VARCHAR(50) NOT NULL, -- users, projects, tasks, etc.
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_comments_task ON comments(task_id);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_comments_modtime
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert Initial Permissions
INSERT INTO permissions (id, name, description) VALUES
    (uuid_generate_v4(), 'read_users', 'View user information'),
    (uuid_generate_v4(), 'create_users', 'Create new users'),
    (uuid_generate_v4(), 'update_users', 'Update user information'),
    (uuid_generate_v4(), 'delete_users', 'Delete users'),
    (uuid_generate_v4(), 'read_projects', 'View projects'),
    (uuid_generate_v4(), 'create_projects', 'Create new projects'),
    (uuid_generate_v4(), 'update_projects', 'Update project details'),
    (uuid_generate_v4(), 'delete_projects', 'Delete projects'),
    (uuid_generate_v4(), 'read_tasks', 'View tasks'),
    (uuid_generate_v4(), 'create_tasks', 'Create new tasks'),
    (uuid_generate_v4(), 'update_tasks', 'Update task details'),
    (uuid_generate_v4(), 'delete_tasks', 'Delete tasks');

-- Insert Role Permissions
INSERT INTO role_permissions (role_name, permission_id)
SELECT 'admin', id FROM permissions;

-- Insert Test User
WITH test_user AS (
    INSERT INTO users (
        username, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role
    ) VALUES (
        'adminpro_admin', 
        'admin@adminpro.com', 
        '$2a$10$1234567890abcdef1234567890abcdef', -- Hashed password example
        'Admin', 
        'User', 
        'admin'
    )
    RETURNING id
)
-- Insert Test Profile
INSERT INTO profiles (user_id, bio, location)
SELECT id, 'AdminPro System Administrator', 'Indonesia'
FROM test_user;

-- Insert Test Project
WITH test_user AS (
    SELECT id FROM users WHERE username = 'adminpro_admin'
)
INSERT INTO projects (
    name, 
    description, 
    owner_id, 
    status, 
    priority, 
    visibility
) VALUES (
    'AdminPro Initial Project', 
    'First project created for system testing', 
    (SELECT id FROM test_user),
    'planning', 
    'medium', 
    'private'
);
