-- migrations/add_result_documents_table.sql
-- Admin-uploaded result documents returned to the user after processing

CREATE TABLE IF NOT EXISTS deceased_policy_result_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    label VARCHAR(500) NOT NULL,
    path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES deceased_policy_requests(id) ON DELETE CASCADE
);
