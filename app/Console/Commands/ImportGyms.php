<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Gym;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportGyms extends Command
{
    protected $signature = 'import:gyms {path=storage/app/imports/gyms_import_ready.json}';

    protected $description = 'Import the cleaned Perak gym dataset (scraped via Apify, cleaned and city-mapped)';

    public function handle(): int
    {
        $path = base_path($this->argument('path'));

        if (! file_exists($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $records = json_decode(file_get_contents($path), true);
        $this->info('Loaded ' . count($records) . ' records.');

        $created = 0;
        $skipped = 0;
        $failed = [];
        $categoryCache = [];

        $bar = $this->output->createProgressBar(count($records));
        $bar->start();

        foreach ($records as $record) {
            $bar->advance();

            // Skip if already imported (safe to re-run the command)
            if (Gym::where('google_place_id', $record['placeId'])->exists()) {
                $skipped++;
                continue;
            }

            try {
                DB::transaction(function () use ($record, &$created, &$categoryCache) {
                    $gym = Gym::create([
                        'owner_id' => null,
                        'name' => $record['name'],
                        'slug' => $this->uniqueSlug($record['name']),
                        'description' => null,
                        'address' => $record['address'],
                        'state_id' => $record['state_id'],
                        'district_id' => $record['district_id'],
                        'city_id' => $record['city_id'],
                        'latitude' => $record['lat'] ?: null,
                        'longitude' => $record['lng'] ?: null,
                        'whatsapp_number' => null,
                        'phone_number' => $record['phone'] ?: null,
                        'email' => null,
                        'website' => $this->cleanWebsite($record['website']),
                        'google_place_id' => $record['placeId'],
                        'google_maps_url' => $record['googleMapsUrl'],
                        'source' => 'scraped',
                        'status' => 'approved',
                    ]);

                    // Borderline entries (yoga, martial arts, etc.) get tagged
                    // with their real category instead of sitting as a plain "Gym".
                    if ($record['is_borderline'] && ! empty($record['categoryName'])) {
                        $categoryName = $record['categoryName'];

                        if (! isset($categoryCache[$categoryName])) {
                            $categoryCache[$categoryName] = Category::firstOrCreate(['name' => $categoryName])->id;
                        }

                        $gym->categories()->sync([$categoryCache[$categoryName]]);
                    }

                    $created++;
                });
            } catch (\Throwable $e) {
                $failed[] = $record['name'] . ' — ' . $e->getMessage();
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Created: {$created}");
        $this->info("Skipped (already imported): {$skipped}");
        $this->info('New categories created: ' . count($categoryCache));

        if ($failed) {
            $this->error(count($failed) . ' records failed:');
            foreach ($failed as $f) {
                $this->line('  - ' . $f);
            }
        }

        return self::SUCCESS;
    }

    /**
     * Appends a numeric suffix on collision rather than trusting scraped
     * names to be unique — several "Fitness Center" style names repeat
     * across different towns in this dataset.
     */
    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (Gym::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * A few scraped "website" values are actually Google search-result
     * redirect links or social profile URLs with long tracking params that
     * exceed the column length — and aren't real business websites anyway.
     * Null them out rather than truncating into a broken URL.
     */
    private function cleanWebsite(?string $url): ?string
    {
        if (empty($url) || strlen($url) > 255) {
            return null;
        }

        return $url;
    }
}