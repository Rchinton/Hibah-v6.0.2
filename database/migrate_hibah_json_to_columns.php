<?php

declare(strict_types=1);

$config = require __DIR__ . '/../api/config.php';
$dsn = sprintf(
    'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
    $config['host'],
    $config['port'],
    $config['database']
);
$pdo = new PDO($dsn, $config['username'], $config['password'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$columns = $pdo->query('SHOW COLUMNS FROM db_hibah')->fetchAll();
if (!array_filter($columns, static fn (array $column): bool => $column['Field'] === 'data_values')) {
    fwrite(STDOUT, "Kolom data_values tidak ditemukan; tidak ada migrasi diperlukan.\n");
    exit(0);
}

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS db_hibah_json_backup (
        id VARCHAR(80) NOT NULL PRIMARY KEY,
        no_id VARCHAR(64) NOT NULL,
        data_values JSON NOT NULL,
        backed_up_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     ) ENGINE=InnoDB'
);
$pdo->exec(
    'INSERT INTO db_hibah_json_backup (id, no_id, data_values)
     SELECT id, no_id, data_values FROM db_hibah
     ON DUPLICATE KEY UPDATE no_id = VALUES(no_id), data_values = VALUES(data_values)'
);

$fields = $pdo->query('SELECT field_key, field_type FROM db_field')->fetchAll();
$fieldTypes = [];
foreach ($fields as $field) {
    $fieldTypes[$field['field_key']] = $field['field_type'];
}

$records = $pdo->query('SELECT id, data_values FROM db_hibah')->fetchAll();
$allKeys = array_keys($fieldTypes);
foreach ($records as $record) {
    $values = json_decode($record['data_values'], true, 512, JSON_THROW_ON_ERROR);
    $allKeys = array_merge($allKeys, array_keys($values));
}
$allKeys = array_values(array_unique($allKeys));
$reserved = ['id', 'no_id', 'status', 'created_label', 'created_at', 'updated_at', 'data_values'];
$existingNames = array_column($columns, 'Field');

foreach ($allKeys as $key) {
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,119}$/', $key) || in_array(strtolower($key), $reserved, true)) {
        throw new RuntimeException("Field key tidak aman untuk nama kolom: {$key}");
    }
    if (!in_array($key, $existingNames, true)) {
        $pdo->exec('ALTER TABLE db_hibah ADD COLUMN `' . $key . '` LONGTEXT NULL');
        $existingNames[] = $key;
    }
}

$pdo->beginTransaction();
try {
    $updateSql = 'UPDATE db_hibah SET ' . implode(', ', array_map(static fn (string $key): string => '`' . $key . '` = :' . $key, $allKeys)) . ' WHERE id = :id';
    $update = $pdo->prepare($updateSql);
    foreach ($records as $record) {
        $values = json_decode($record['data_values'], true, 512, JSON_THROW_ON_ERROR);
        $parameters = ['id' => $record['id']];
        foreach ($allKeys as $key) {
            $value = $values[$key] ?? null;
            $parameters[$key] = is_array($value)
                ? json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)
                : ($value === null ? null : (string) $value);
        }
        $update->execute($parameters);
    }
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    throw $error;
}

$pdo->exec('ALTER TABLE db_hibah DROP COLUMN data_values');
fwrite(STDOUT, sprintf("Migrasi selesai: %d record, %d kolom dinamis. Backup JSON ada di db_hibah_json_backup.\n", count($records), count($allKeys)));