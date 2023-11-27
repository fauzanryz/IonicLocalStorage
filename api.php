<?php
header("Content-Type: application/json");

// Database configuration
$dbHost = "localhost";
$dbName = "todo_db";
$dbUser = "root";
$dbPassword = "";


// Create a MySQLi connection
$mysqli = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get Todo list
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $mysqli->query("SELECT * FROM todo");
    $todos = [];
    
    while ($row = $result->fetch_assoc()) {
        $todos[] = $row;
    }

    echo json_encode($todos);
}

// Add new Todo
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data["task_name"])) {
        $taskName = $data["task_name"];
        $mysqli->query("INSERT INTO todo (task_name) VALUES ('$taskName')");
        echo json_encode(["message" => "Todo added successfully"]);
    } else {
        echo json_encode(["error" => "Task name is required"]);
    }
}

// Update Todo status
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];
    $completed = $data["completed"];

    $mysqli->query("UPDATE todo SET completed = $completed WHERE id = $id");
    echo json_encode(["message" => "Todo status updated successfully"]);
}

// Delete Todo
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data["id"];

    $mysqli->query("DELETE FROM todo WHERE id = $id");
    echo json_encode(["message" => "Todo deleted successfully"]);
}

// Close the MySQLi connection
$mysqli->close();
?>