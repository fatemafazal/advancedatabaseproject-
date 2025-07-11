<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);




require 'config.php'; // Contains $conn = new mysqli(...)

header('Content-Type: application/json');

// Read incoming JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!$data || !isset($data['personalInfo'])) {
    echo json_encode(["status" => "error", "message" => "Invalid or empty JSON data"]);
    exit;
}

try {
    $conn->begin_transaction();

    // PERSONAL INFO
    $p = $data['personalInfo'];
    $email = $p['email'];

    // Insert or update user info
    $stmt = $conn->prepare("INSERT INTO users (email, first_name, last_name, phone, job_title, location, website, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            first_name = VALUES(first_name), 
            last_name = VALUES(last_name),
            phone = VALUES(phone),
            job_title = VALUES(job_title),
            location = VALUES(location),
            website = VALUES(website),
            summary = VALUES(summary)");
    $stmt->bind_param("ssssssss", $email, $p['firstName'], $p['lastName'], $p['phone'],
        $p['jobTitle'], $p['location'], $p['website'], $p['summary']);
    $stmt->execute();

    // CALL STORED PROCEDURE to create new resume version
    $conn->query("CALL InsertResumeVersion('$email')");

    // Get the newly inserted resume_id (most recent)
    $result = $conn->query("SELECT id FROM resumes WHERE email = '$email' ORDER BY version DESC LIMIT 1");
    $row = $result->fetch_assoc();
    $resume_id = $row['id'];

    // EXPERIENCE SECTION
    if (!empty($data['experience'])) {
        $stmt = $conn->prepare("INSERT INTO experience (resume_id, title, company, start_date, end_date, location, achievements)
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['experience'] as $exp) {
            $achievements = implode("\\n", $exp['achievements']);
            $start = formatDate($exp['startDate']);
            $end = formatDate($exp['endDate']);
            $stmt->bind_param("issssss", $resume_id, $exp['position'], $exp['company'], $start, $end, $exp['location'], $achievements);
            $stmt->execute();
        }
    }

    // EDUCATION SECTION
    if (!empty($data['education'])) {
        $stmt = $conn->prepare("INSERT INTO education (resume_id, school, degree, field_of_study, start_date, end_date, location, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['education'] as $edu) {
            $start = formatDate($edu['startDate']);
            $end = formatDate($edu['endDate']);
            $stmt->bind_param("isssssss", $resume_id, $edu['school'], $edu['degree'], $edu['fieldOfStudy'],
                $start, $end, $edu['location'], $edu['description']);
            $stmt->execute();
        }
    }

    // SKILLS SECTION
    if (!empty($data['skills'])) {
        $stmt = $conn->prepare("INSERT INTO skills (resume_id, skill_name, level)
            VALUES (?, ?, ?)");
        foreach ($data['skills'] as $skill) {
            $stmt->bind_param("iss", $resume_id, $skill['name'], $skill['level']);
            $stmt->execute();
        }
    }

    // PROJECTS SECTION
    if (!empty($data['projects'])) {
        $stmt = $conn->prepare("INSERT INTO projects (resume_id, name, start_date, end_date, url, description)
            VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($data['projects'] as $proj) {
            $start = formatDate($proj['startDate']);
            $end = formatDate($proj['endDate']);
            $stmt->bind_param("isssss", $resume_id, $proj['name'], $start, $end, $proj['url'], $proj['description']);
            $stmt->execute();
        }
    }

    // COMMIT
    $conn->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

// Converts "MM/YYYY" to "YYYY-MM-01", handles "Present"
function formatDate($input) {
    if (!$input || strtolower($input) === "present") {
        return null;
    }
    $parts = explode("/", $input); // e.g., 05/2024
    return (count($parts) === 2) ? "{$parts[1]}-{$parts[0]}-01" : null;
}
?>
