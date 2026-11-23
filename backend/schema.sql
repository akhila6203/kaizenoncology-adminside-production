CREATE DATABASE IF NOT EXISTS kimsrenova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kimsrenova;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'editor') NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hospitals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  city VARCHAR(120) NOT NULL,
  address TEXT,
  phone VARCHAR(40) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS specialities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  icon_image VARCHAR(255) DEFAULT NULL,
  banner_image VARCHAR(255) DEFAULT NULL,
  short_description TEXT,
  about_content LONGTEXT,
  team_section_title VARCHAR(180) DEFAULT NULL,
  team_section_subtitle VARCHAR(255) DEFAULT NULL,
  chairman_name VARCHAR(160) DEFAULT NULL,
  chairman_designation VARCHAR(160) DEFAULT NULL,
  chairman_photo VARCHAR(255) DEFAULT NULL,
  chairman_message LONGTEXT,
  about_image VARCHAR(255) DEFAULT NULL,
  meta_title VARCHAR(180) DEFAULT NULL,
  meta_description VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  icon_image VARCHAR(255) DEFAULT NULL,
  description TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id INT UNSIGNED NOT NULL,
  heading VARCHAR(255) NOT NULL,
  paragraph LONGTEXT NULL,
  image VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_svcsec_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_section_points (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id INT UNSIGNED NOT NULL,
  point_text TEXT NOT NULL,
  image VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_svcpoint_section FOREIGN KEY (section_id) REFERENCES service_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id INT UNSIGNED NOT NULL,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_svcfaq_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;




CREATE TABLE IF NOT EXISTS doctors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  designation VARCHAR(160) DEFAULT NULL,
  speciality_id INT UNSIGNED DEFAULT NULL,
  photo VARCHAR(255) DEFAULT NULL,
  license_number VARCHAR(80) DEFAULT NULL,
  hospital_location VARCHAR(255) DEFAULT NULL,
  short_bio LONGTEXT,
  experience_years INT DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  meta_title VARCHAR(180) DEFAULT NULL,
  meta_description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_speciality
    FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctor_hospitals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT UNSIGNED NOT NULL,
  hospital_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_doctor_hospital (doctor_id, hospital_id),
  CONSTRAINT fk_dh_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  CONSTRAINT fk_dh_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctor_qualifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT UNSIGNED NOT NULL,
  qualification VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_dq_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctor_expertise (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT UNSIGNED NOT NULL,
  expertise VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_de_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS health_library (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  category ENUM('Article', 'Treatment', 'Technology', 'Ailment') NOT NULL DEFAULT 'Article',
  thumbnail VARCHAR(255) DEFAULT NULL,
  content LONGTEXT,
  speciality_id INT UNSIGNED DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  meta_title VARCHAR(180) DEFAULT NULL,
  meta_description VARCHAR(255) DEFAULT NULL,
  patient_name VARCHAR(160) DEFAULT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  country VARCHAR(120) DEFAULT NULL,
  disease VARCHAR(220) DEFAULT NULL,
  previous_reports VARCHAR(255) DEFAULT NULL,
  treatment_start_date DATE DEFAULT NULL,
  treatment_end_date DATE DEFAULT NULL,
  amount DECIMAL(12,2) DEFAULT NULL,
  hospital_name VARCHAR(160) DEFAULT NULL,
  post_op_details LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hl_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS our_stories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(160) NOT NULL,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  thumbnail VARCHAR(255) DEFAULT NULL,
  story_content LONGTEXT,
  speciality_id INT UNSIGNED DEFAULT NULL,
  doctor_id INT UNSIGNED DEFAULT NULL,
  video_url VARCHAR(255) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_story_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL,
  CONSTRAINT fk_story_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blogs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  author_name VARCHAR(160) DEFAULT NULL,
  thumbnail VARCHAR(255) DEFAULT NULL,
  category VARCHAR(80) DEFAULT NULL,
  content LONGTEXT,
  tags JSON DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  meta_title VARCHAR(180) DEFAULT NULL,
  meta_description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(160) NOT NULL,
  patient_photo VARCHAR(255) DEFAULT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  message TEXT NOT NULL,
  speciality_id INT UNSIGNED DEFAULT NULL,
  doctor_id INT UNSIGNED DEFAULT NULL,
  video_url VARCHAR(255) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_testimonial_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE SET NULL,
  CONSTRAINT fk_testimonial_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_care_treatment_areas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  area_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_care_treatment_area_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_subspecialities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  is_default_active TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subspec_slug (speciality_id, slug),
  CONSTRAINT fk_subspec_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_team (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  caption VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_team_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS treatments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  short_description TEXT,
  content LONGTEXT,
  thumbnail VARCHAR(255) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ailments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  short_description TEXT,
  content LONGTEXT,
  thumbnail VARCHAR(255) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS technologies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  short_description TEXT,
  content LONGTEXT,
  thumbnail VARCHAR(255) DEFAULT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_treatments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  treatment_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_spec_treatment (speciality_id, treatment_id),
  CONSTRAINT fk_st_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE,
  CONSTRAINT fk_st_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- CREATE TABLE IF NOT EXISTS speciality_ailment_items (
--   id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   speciality_id INT UNSIGNED NOT NULL,
--   name VARCHAR(220) NOT NULL,
--   sort_order INT NOT NULL DEFAULT 0,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_sai_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE
-- ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_ailment_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  title VARCHAR(220) NOT NULL,
  description TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sai_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_ailments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  ailment_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_spec_ailment (speciality_id, ailment_id),
  CONSTRAINT fk_sa_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE,
  CONSTRAINT fk_sa_ailment FOREIGN KEY (ailment_id) REFERENCES ailments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS speciality_technologies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  speciality_id INT UNSIGNED NOT NULL,
  technology_id INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_spec_tech (speciality_id, technology_id),
  CONSTRAINT fk_stech_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id) ON DELETE CASCADE,
  CONSTRAINT fk_stech_technology FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
) ENGINE=InnoDB;




CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NOT NULL,

  password VARCHAR(255) DEFAULT NULL,

  status ENUM(
    'pending',
    'active',
    'blocked'
  ) NOT NULL DEFAULT 'pending',

  email_verified_at DATETIME DEFAULT NULL,

  activation_token_hash VARCHAR(64) DEFAULT NULL,
  activation_token_expires_at DATETIME DEFAULT NULL,

  reset_token_hash VARCHAR(64) DEFAULT NULL,
  reset_token_expires_at DATETIME DEFAULT NULL,

  last_login_at DATETIME DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_customer_email (email),
  INDEX idx_activation_token (activation_token_hash),
  INDEX idx_reset_token (reset_token_hash)
) ENGINE=InnoDB;







-- Run ONCE in kimsrenova; existing blogs are preserved.
-- ALTER TABLE blogs ADD COLUMN speciality_id INT UNSIGNED NULL AFTER category;
-- ALTER TABLE blogs ADD COLUMN short_description TEXT NULL AFTER content;
-- ALTER TABLE blogs ADD INDEX idx_blogs_speciality (speciality_id);


-- CREATE TABLE IF NOT EXISTS case_studies (
--  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
--  title VARCHAR(220) NOT NULL, slug VARCHAR(240) NOT NULL UNIQUE,
--  thumbnail VARCHAR(255) NULL, speciality_id INT UNSIGNED NULL,
--  short_description TEXT NULL, content LONGTEXT NULL,
--  is_published TINYINT(1) NOT NULL DEFAULT 1,
--  published_at DATETIME NULL,
--  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--  KEY idx_case_speciality (speciality_id), KEY idx_case_published (is_published,created_at)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Run once in kimsrenova. Existing tables are not modified.
USE kimsrenova;

CREATE TABLE IF NOT EXISTS patient_profiles (
 customer_id INT UNSIGNED PRIMARY KEY,
 patient_number VARCHAR(32) NOT NULL UNIQUE,
 personal JSON NULL, passport JSON NULL, visa JSON NULL, medical JSON NULL,
 treatment JSON NULL, hospital JSON NULL, stay JSON NULL, travel JSON NULL,
 appointments JSON NULL, payments JSON NULL, journey JSON NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_patient_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_documents (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 customer_id INT UNSIGNED NOT NULL,
 section_id VARCHAR(40) NOT NULL,
 category VARCHAR(100) NOT NULL,
 original_name VARCHAR(255) NOT NULL,
 stored_name VARCHAR(120) NOT NULL UNIQUE,
 mime_type VARCHAR(120) NOT NULL,
 file_size INT UNSIGNED NOT NULL,
 uploaded_by_type ENUM('patient','admin') NOT NULL,
 uploaded_by_id INT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_patient_documents_customer(customer_id),
 FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_activity_logs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 customer_id INT UNSIGNED NOT NULL,
 actor_type ENUM('patient','admin') NOT NULL,
 actor_id INT UNSIGNED NOT NULL,
 action VARCHAR(100) NOT NULL,
 section_id VARCHAR(40) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_patient_activity_customer(customer_id),
 FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;



-- ALTER TABLE speciality_ailment_items
--   CHANGE COLUMN name title VARCHAR(220) NOT NULL,
--   ADD COLUMN description TEXT NULL AFTER title;

-- ALTER TABLE doctors
-- ADD COLUMN about LONGTEXT DEFAULT NULL,
-- ADD COLUMN academics_achievements LONGTEXT DEFAULT NULL;

-- ALTER TABLE `partners`
-- ADD COLUMN `website_url` VARCHAR(1000) NULL AFTER `logo`;


-- CREATE TABLE speciality_images (
--     id INT NOT NULL AUTO_INCREMENT,
--     speciality_id INT UNSIGNED NOT NULL,
--     image_path VARCHAR(500) NOT NULL,
--     alt_text VARCHAR(255) DEFAULT NULL,
--     sort_order INT NOT NULL DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     PRIMARY KEY (id),
--     KEY idx_speciality_images_speciality_id (speciality_id),

--     CONSTRAINT fk_speciality_images_speciality
--         FOREIGN KEY (speciality_id)
--         REFERENCES specialities(id)
--         ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ALTER TABLE specialities
-- ADD COLUMN when_to_consult VARCHAR(500) NULL
-- AFTER about_content;

-- ALTER TABLE specialities
-- ADD COLUMN icon_name VARCHAR(100) NULL AFTER name;



-- CREATE TABLE hospital_contacts (
--     id INT NOT NULL AUTO_INCREMENT,
--     location_name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) DEFAULT NULL,
--     phone VARCHAR(50) DEFAULT NULL,
--     alt_phone VARCHAR(50) DEFAULT NULL,
--     address TEXT DEFAULT NULL,
--     location_url TEXT DEFAULT NULL,
--     sort_order INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--         ON UPDATE CURRENT_TIMESTAMP,
--     PRIMARY KEY (id)
-- );

-- ALTER TABLE settings
-- ADD COLUMN meta_keywords TEXT NULL,
-- ADD COLUMN meta_description TEXT NULL;





CREATE TABLE IF NOT EXISTS technology_sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  technology_id INT UNSIGNED NOT NULL,
  heading VARCHAR(255) NOT NULL,
  paragraph LONGTEXT NULL,
  image VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_techsec_technology FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS technology_section_points (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id INT UNSIGNED NOT NULL,
  point_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_techpoint_section FOREIGN KEY (section_id) REFERENCES technology_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS technology_faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  technology_id INT UNSIGNED NOT NULL,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_techfaq_technology FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- CREATE TABLE technology_specialities (
--     technology_id INT NOT NULL,
--     speciality_id INT NOT NULL,

--     PRIMARY KEY (technology_id, speciality_id),

--     CONSTRAINT fk_technology_specialities_technology
--         FOREIGN KEY (technology_id)
--         REFERENCES technologies(id)
--         ON DELETE CASCADE,

--     CONSTRAINT fk_technology_specialities_speciality
--         FOREIGN KEY (speciality_id)
--         REFERENCES specialities(id)
--         ON DELETE CASCADE
-- );


-- ALTER TABLE settings
-- ADD COLUMN logo2 VARCHAR(500) DEFAULT NULL;


CREATE TABLE IF NOT EXISTS homepage_slides (
    id INT NOT NULL AUTO_INCREMENT,

    image VARCHAR(500) DEFAULT NULL,
    eyebrow VARCHAR(255) DEFAULT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,

    primary_text VARCHAR(255) DEFAULT NULL,
    primary_path VARCHAR(500) DEFAULT NULL,

    secondary_text VARCHAR(255) DEFAULT NULL,
    secondary_path VARCHAR(500) DEFAULT NULL,

    sort_order INT DEFAULT 0,

    status ENUM('active', 'inactive') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
);


