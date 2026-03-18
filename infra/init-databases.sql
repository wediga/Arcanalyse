SELECT 'CREATE DATABASE umami' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'umami')\gexec
SELECT 'CREATE DATABASE listmonk' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'listmonk')\gexec
SELECT 'CREATE DATABASE formbricks' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'formbricks')\gexec
