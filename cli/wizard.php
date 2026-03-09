<?php

declare(strict_types=1);

/**
 * Balkanski kod Track Wizard
 *
 * CLI wizard that:
 * - asks for track fields in console
 * - reads OPENAI_API_KEY and OPENAI_MODEL from .env
 * - sends prompt to OpenAI
 * - generates names.safe and hints
 * - asks where to add the track (quiz/radio/both)
 * - updates appropriate config files
 *
 * Usage:
 *   php wizard.php
 *
 * .env example:
 *   OPENAI_API_KEY=
 *   OPENAI_MODEL=gpt-4o-mini
 */

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from CLI.\n");
    exit(1);
}

main();

function main(): void
{
    $env = loadEnv(__DIR__ . '/.env');

    $apiKey = $env['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY') ?: '';
    $model  = $env['OPENAI_MODEL'] ?? getenv('OPENAI_MODEL') ?: 'gpt-4o-mini';

    if ($apiKey === '') {
        fwrite(STDERR, "OPENAI_API_KEY not found in .env or environment.\n");
        exit(1);
    }

    echo "=== Balkanski kod Track Wizard ===\n\n";

    $id = askRequired('Track id (example: track-001)');
    $suno = ask('Suno URL', '');
    $serbian = askRequired('Serbian title');
    $russian = askRequired('Russian title');
    $original = askRequired('Original title');
    $difficulty = askDifficulty('Difficulty 1-5');
    $added = askDate('Added date YYYY-MM-DD');

    $context = askLongText(
        'Song context or lyrics',
        'Choose mode: [1] paste multiline text  [2] load from file  [3] skip'
    );

    $safeNotes = ask('Your wishes for safe title', '');
    $hintNotes = ask('Your wishes for hints', '');

    $localPath = "/tracks/{$id}.mp3";

    $userInput = [
        'id' => $id,
        'links' => [
            'local' => $localPath,
            'suno' => $suno,
        ],
        'names' => [
            'safe' => null,
            'serbian' => $serbian,
            'russian' => $russian,
            'original' => $original,
        ],
        'context' => $context,
        'preferences' => [
            'safe' => $safeNotes,
            'hints' => $hintNotes,
        ],
        'difficulty' => $difficulty,
        'dates' => [
            'added' => $added,
        ],
    ];

    echo "\nGenerating with OpenAI...\n\n";

    try {
        $generated = generateTrackData($apiKey, $model, $userInput);
    } catch (Throwable $e) {
        fwrite(STDERR, "OpenAI request failed: " . $e->getMessage() . "\n");
        exit(1);
    }

    // Build full track data
    $fullTrack = [
        'id' => $id,
        'links' => [
            'local' => $localPath,
            'suno' => $suno,
        ],
        'names' => [
            'safe' => $generated['names']['safe'] ?? '',
            'serbian' => $serbian,
            'russian' => $russian,
            'original' => $original,
        ],
        'hints' => array_values($generated['hints'] ?? []),
        'difficulty' => $difficulty,
        'dates' => [
            'added' => $added,
        ],
    ];

    // Build radio track data (only radio-specific fields)
    $radioTrack = [
        'id' => $id,
        'links' => [
            'local' => $localPath,
            'suno' => $suno,
        ],
        'names' => [
            'serbian' => $serbian,
            'russian' => $russian,
            'original' => $original,
        ],
        'dates' => [
            'added' => $added,
        ],
    ];

    echo "=== RESULT QUIZ TRACK ===\n";
    echo json_encode($fullTrack, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";

    echo "=== RESULT RADIO TRACK ===\n";
    echo json_encode($radioTrack, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";

    // Ask where to add the track
    echo "=== WHERE TO ADD TRACK ===\n";
    
    $addToQuiz = askYesNo('Add to quiz (tracks.ts)?', 'y');
    $addToRadio = askYesNo('Add to radio (radioTracks.ts)?', 'y');

    if ($addToQuiz) {
        addToQuizConfig($fullTrack);
        echo "✅ Added to quiz config\n";
    }

    if ($addToRadio) {
        addToRadioConfig($radioTrack);
        echo "✅ Added to radio config\n";
    }

    if (!$addToQuiz && !$addToRadio) {
        echo "⚠️  Track not added to any config\n";
    }

    echo "\n=== TS OBJECTS FOR REFERENCE ===\n";
    echo "Quiz track:\n";
    echo renderTsTrackObject($fullTrack) . "\n\n";
    
    echo "Radio track:\n";
    echo renderTsRadioTrackObject($radioTrack) . "\n";
}

function addToQuizConfig(array $track): void
{
    $configPath = __DIR__ . '/../src/shared/config/tracks.ts';
    
    if (!is_file($configPath)) {
        throw new RuntimeException("Quiz config file not found: {$configPath}");
    }

    $content = file_get_contents($configPath);
    if ($content === false) {
        throw new RuntimeException("Failed to read quiz config file");
    }

    // Find the position to insert the new track (before the closing ];)
    $insertPos = strrpos($content, '];');
    if ($insertPos === false) {
        throw new RuntimeException("Could not find tracks array end in quiz config");
    }

    // Check if we need to add a comma to the last track
    $contentBefore = substr($content, 0, $insertPos);
    $contentBefore = trim($contentBefore);
    if (!str_ends_with($contentBefore, ',')) {
        $contentBefore .= ',';
        $insertPos = strlen($contentBefore);
    }

    $newTrack = renderTsTrackObject($track);
    $newContent = substr($content, 0, $insertPos) . "\n  " . $newTrack . "\n" . substr($content, $insertPos);

    if (file_put_contents($configPath, $newContent) === false) {
        throw new RuntimeException("Failed to write quiz config file");
    }
}

function addToRadioConfig(array $track): void
{
    $configPath = __DIR__ . '/../src/shared/config/radioTracks.ts';
    
    if (!is_file($configPath)) {
        throw new RuntimeException("Radio config file not found: {$configPath}");
    }

    $content = file_get_contents($configPath);
    if ($content === false) {
        throw new RuntimeException("Failed to read radio config file");
    }

    // Find the position to insert the new track (before the closing ];)
    $insertPos = strrpos($content, '];');
    if ($insertPos === false) {
        throw new RuntimeException("Could not find radio tracks array end in radio config");
    }

    // Check if we need to add a comma to the last track
    $contentBefore = substr($content, 0, $insertPos);
    $contentBefore = trim($contentBefore);
    if (!str_ends_with($contentBefore, ',')) {
        $contentBefore .= ',';
        $insertPos = strlen($contentBefore);
    }

    $newTrack = renderTsRadioTrackObject($track);
    $newContent = substr($content, 0, $insertPos) . "\n  " . $newTrack . "\n" . substr($content, $insertPos);

    if (file_put_contents($configPath, $newContent) === false) {
        throw new RuntimeException("Failed to write radio config file");
    }
}

function askYesNo(string $label, string $default = 'y'): bool
{
    while (true) {
        $suffix = $default !== '' ? " [{$default}]" : '';
        fwrite(STDOUT, $label . $suffix . ': ');

        $line = fgets(STDIN);
        $value = $line === false ? '' : strtolower(trim($line));

        if ($value === '') {
            $value = $default;
        }

        if ($value === 'y' || $value === 'yes') {
            return true;
        }

        if ($value === 'n' || $value === 'no') {
            return false;
        }

        echo "Please enter 'y' or 'n'.\n";
    }
}

function loadEnv(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $vars = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES);

    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }

        $key = trim(substr($line, 0, $pos));
        $value = trim(substr($line, $pos + 1));

        if ($value !== '') {
            $first = $value[0];
            $last = $value[strlen($value) - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        $vars[$key] = $value;
    }

    return $vars;
}

function ask(string $label, string $default = ''): string
{
    $suffix = $default !== '' ? " [{$default}]" : '';
    fwrite(STDOUT, $label . $suffix . ': ');

    $line = fgets(STDIN);
    $value = $line === false ? '' : trim($line);

    return $value === '' ? $default : $value;
}

function askRequired(string $label): string
{
    while (true) {
        $value = ask($label);
        if ($value !== '') {
            return $value;
        }

        echo "This field is required.\n";
    }
}

function askDifficulty(string $label): int
{
    while (true) {
        $value = ask($label, '1');

        if (ctype_digit($value)) {
            $num = (int) $value;
            if ($num >= 1 && $num <= 5) {
                return $num;
            }
        }

        echo "Please enter a number from 1 to 5.\n";
    }
}

function askDate(string $label): string
{
    while (true) {
        $value = ask($label, date('Y-m-d'));
        $dt = DateTime::createFromFormat('Y-m-d', $value);
        $errors = DateTime::getLastErrors();

        $hasWarnings = is_array($errors) && (($errors['warning_count'] ?? 0) > 0);
        $hasErrors = is_array($errors) && (($errors['error_count'] ?? 0) > 0);

        if ($dt !== false && $dt->format('Y-m-d') === $value && !$hasWarnings && !$hasErrors) {
            return $value;
        }

        echo "Please enter date in YYYY-MM-DD format.\n";
    }
}

function askLongText(string $label, string $help = ''): string
{
    echo "\n{$label}\n";
    if ($help !== '') {
        echo $help . "\n";
    }

    while (true) {
        $mode = ask('Mode', '1');

        if ($mode === '3') {
            return '';
        }

        if ($mode === '2') {
            $path = askRequired('Path to text file');

            if (!is_file($path)) {
                echo "File not found: {$path}\n";
                continue;
            }

            $content = file_get_contents($path);
            if ($content === false) {
                echo "Failed to read file: {$path}\n";
                continue;
            }

            return trim(normalizeLineEndings($content));
        }

        if ($mode === '1') {
            echo "Paste text below. Finish with a line containing only END\n";

            $lines = [];
            while (true) {
                $line = fgets(STDIN);
                if ($line === false) {
                    break;
                }

                $line = rtrim($line, "\r\n");
                if ($line === 'END') {
                    break;
                }

                $lines[] = $line;
            }

            return trim(implode("\n", $lines));
        }

        echo "Unknown mode. Use 1 2 or 3.\n";
    }
}

function normalizeLineEndings(string $text): string
{
    return str_replace(["\r\n", "\r"], "\n", $text);
}

function generateTrackData(string $apiKey, string $model, array $userInput): array
{
    $systemPrompt = <<<'PROMPT'
You are helping fill one Track object for a music guessing game called Balkanski kod.

Return ONLY valid JSON with this exact shape:
{
  "names": {
    "safe": "string"
  },
  "hints": ["string", "string", "string"]
}

Rules:
- Output only JSON
- names.safe must be in Russian
- names.safe must be spoiler-safe and should not reveal the exact answer too directly
- hints must be in Russian
- hints should help guess the title not retell the whole story
- usually provide 3 hints
- hints should move from subtle to more direct
- hints must not be identical
- avoid awkward phrasing
- keep the result useful for a Russian-speaking audience
- if the song title is already too obvious then make safe more abstract but still thematic
PROMPT;

    $userPrompt = <<<'PROMPT'
Fill names.safe and hints for this track.

Input data:
%s

Additional requirements:
- names.serbian names.russian and names.original are already fixed and must not be rewritten
- context may contain either a short description of the song or full lyrics
- use context to infer imagery mood and title clues
- hints should point toward the song title
- difficulty should influence how direct the hints are
- if user preferences exist use them
PROMPT;

    $payload = [
        'model' => $model,
        'messages' => [
            [
                'role' => 'system',
                'content' => $systemPrompt,
            ],
            [
                'role' => 'user',
                'content' => sprintf(
                    $userPrompt,
                    json_encode(
                        $userInput,
                        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                    )
                ),
            ],
        ],
        // 'temperature' => 0.7,
        'response_format' => [
            'type' => 'json_object',
        ],
    ];

    $response = httpPostJson(
        'https://api.openai.com/v1/chat/completions',
        $payload,
        [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ]
    );

    $content = $response['choices'][0]['message']['content'] ?? null;
    if (!is_string($content) || $content === '') {
        throw new RuntimeException('Unexpected API response: missing choices[0].message.content');
    }

    $decoded = json_decode($content, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Model did not return valid JSON: ' . $content);
    }

    if (!isset($decoded['names']) || !is_array($decoded['names'])) {
        throw new RuntimeException('Missing names object in model response');
    }

    if (!isset($decoded['names']['safe']) || !is_string($decoded['names']['safe'])) {
        throw new RuntimeException('Missing names.safe in model response');
    }

    if (!isset($decoded['hints']) || !is_array($decoded['hints'])) {
        throw new RuntimeException('Missing hints array in model response');
    }

    $decoded['names']['safe'] = trim($decoded['names']['safe']);

    $decoded['hints'] = array_values(array_filter(
        array_map(
            static fn($item) => is_string($item) ? trim($item) : '',
            $decoded['hints']
        ),
        static fn($item) => $item !== ''
    ));

    if ($decoded['names']['safe'] === '') {
        throw new RuntimeException('Model returned empty names.safe');
    }

    if ($decoded['hints'] === []) {
        throw new RuntimeException('Model returned empty hints');
    }

    return $decoded;
}

function httpPostJson(string $url, array $payload, array $headers): array
{
    $ch = curl_init($url);

    if ($ch === false) {
        throw new RuntimeException('Failed to initialize cURL');
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
    ]);

    $raw = curl_exec($ch);

    if ($raw === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('cURL error: ' . $error);
    }

    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    $decoded = json_decode($raw, true);

    if ($status < 200 || $status >= 300) {
        $message = is_array($decoded)
            ? json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            : $raw;

        throw new RuntimeException("HTTP {$status}: {$message}");
    }

    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid JSON response: ' . $raw);
    }

    return $decoded;
}

function renderTsTrackObject(array $track): string
{
    $export = [];
    $export[] = '{';
    $export[] = "  id: '" . escapeTsString((string) $track['id']) . "',";
    $export[] = '  links: {';
    $export[] = "    local: '" . escapeTsString((string) $track['links']['local']) . "',";
    $export[] = "    suno: '" . escapeTsString((string) $track['links']['suno']) . "',";
    $export[] = '  },';
    $export[] = '  names: {';
    $export[] = "    safe: '" . escapeTsString((string) $track['names']['safe']) . "',";
    $export[] = "    serbian: '" . escapeTsString((string) $track['names']['serbian']) . "',";
    $export[] = "    russian: '" . escapeTsString((string) $track['names']['russian']) . "',";
    $export[] = "    original: '" . escapeTsString((string) $track['names']['original']) . "',";
    $export[] = '  },';
    $export[] = '  hints: [';

    foreach ($track['hints'] as $hint) {
        $export[] = "    '" . escapeTsString((string) $hint) . "',";
    }

    $export[] = '  ],';
    $export[] = '  difficulty: ' . (int) $track['difficulty'] . ',';
    $export[] = '  dates: {';
    $export[] = "    added: '" . escapeTsString((string) $track['dates']['added']) . "',";
    $export[] = '  },';
    $export[] = '},';

    return implode("\n", $export);
}

function renderTsRadioTrackObject(array $track): string
{
    $export = [];
    $export[] = '{';
    $export[] = "  id: '" . escapeTsString((string) $track['id']) . "',";
    $export[] = '  links: {';
    $export[] = "    local: '" . escapeTsString((string) $track['links']['local']) . "',";
    $export[] = "    suno: '" . escapeTsString((string) $track['links']['suno']) . "',";
    $export[] = '  },';
    $export[] = '  names: {';
    $export[] = "    serbian: '" . escapeTsString((string) $track['names']['serbian']) . "',";
    $export[] = "    russian: '" . escapeTsString((string) $track['names']['russian']) . "',";
    $export[] = "    original: '" . escapeTsString((string) $track['names']['original']) . "',";
    $export[] = '  },';
    $export[] = '  dates: {';
    $export[] = "    added: '" . escapeTsString((string) $track['dates']['added']) . "',";
    $export[] = '  },';
    $export[] = '},';

    return implode("\n", $export);
}

function escapeTsString(string $value): string
{
    $value = str_replace('\\', '\\\\', $value);
    $value = str_replace("'", "\\'", $value);
    $value = str_replace("\n", "\\n", $value);

    return $value;
}
