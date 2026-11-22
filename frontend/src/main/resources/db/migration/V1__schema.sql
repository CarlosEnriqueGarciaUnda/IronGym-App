-- Script inicial de creación de tablas. Carlos: Revisar que no falte la tabla de roles.


CREATE TABLE roles (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(30) NOT NULL UNIQUE
);
CREATE TABLE users (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(120) NOT NULL,
 email VARCHAR(160) NOT NULL UNIQUE,
 phone VARCHAR(20),
 password_hash VARCHAR(100) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_roles (
 user_id BIGINT NOT NULL, role_id BIGINT NOT NULL,
 PRIMARY KEY(user_id, role_id),
 CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id),
 CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE TABLE plans (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(80) NOT NULL UNIQUE,
 price DECIMAL(10,2) NOT NULL, duration_days INT NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE memberships (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL, plan_id BIGINT NOT NULL,
 start_date DATE NOT NULL, end_date DATE NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
 CONSTRAINT fk_m_user FOREIGN KEY (user_id) REFERENCES users(id),
 CONSTRAINT fk_m_plan FOREIGN KEY (plan_id) REFERENCES plans(id),
 INDEX idx_member_end (end_date), INDEX idx_member_user (user_id)
);
CREATE TABLE payments (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL, membership_id BIGINT NULL,
 amount DECIMAL(10,2) NOT NULL, method VARCHAR(30) NOT NULL,
 paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 status VARCHAR(20) NOT NULL DEFAULT 'PAGADO',
 CONSTRAINT fk_pay_user FOREIGN KEY (user_id) REFERENCES users(id),
 CONSTRAINT fk_pay_member FOREIGN KEY (membership_id) REFERENCES memberships(id),
 INDEX idx_payment_date (paid_at)
);
CREATE TABLE attendances (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL, recorded_by BIGINT NULL,
 check_in DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id),
 CONSTRAINT fk_att_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id),
 INDEX idx_att_date (check_in)
);
CREATE TABLE revoked_tokens (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, token_hash VARCHAR(64) NOT NULL UNIQUE,
 expires_at DATETIME NOT NULL
);
CREATE TABLE password_reset_tokens (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL,
 token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL, used BOOLEAN NOT NULL DEFAULT FALSE,
 CONSTRAINT fk_rst_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE notification_logs (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL,
 channel VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL,
 message VARCHAR(600) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_not_user FOREIGN KEY (user_id) REFERENCES users(id)
);
