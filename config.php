<?php
$host = 'localhost';
$user = 'root';
$password = ''; // XAMPP default
$dbname = 'smart_resume_builder';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
