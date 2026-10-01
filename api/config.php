<?php

return [
    'host' => getenv('HIBAH_DB_HOST') ?: '127.0.0.1',
    'port' => (int) (getenv('HIBAH_DB_PORT') ?: 3306),
    'database' => getenv('HIBAH_DB_NAME') ?: 'hibah_peternakan',
    'username' => getenv('HIBAH_DB_USER') ?: 'root',
    'password' => getenv('HIBAH_DB_PASSWORD') ?: '',
];