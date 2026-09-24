<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MissingCitiesSeeder extends Seeder
{
    private const CITIES = [
        ['id' => 41, 'name' => 'Ayer Tawar',      'district_id' => 6],
        ['id' => 42, 'name' => 'Langkap',         'district_id' => 8],
        ['id' => 43, 'name' => 'Changkat Jering', 'district_id' => 5],
        ['id' => 44, 'name' => 'Ulu Kinta',       'district_id' => 1],
        ['id' => 45, 'name' => 'Tambun',          'district_id' => 1],
        ['id' => 46, 'name' => 'Kuala Kurau',     'district_id' => 4],
        ['id' => 47, 'name' => 'Pusing',          'district_id' => 1],
        ['id' => 48, 'name' => 'Menglembu',       'district_id' => 1],
        ['id' => 49, 'name' => 'Pantai Remis',    'district_id' => 6],
        ['id' => 50, 'name' => 'Manong',          'district_id' => 7],
        ['id' => 51, 'name' => 'Batu Kurau',      'district_id' => 5],
        ['id' => 52, 'name' => 'Lahat',           'district_id' => 1],
    ];

    public function run(): void
    {
        foreach (self::CITIES as $city) {
            DB::table('cities')->updateOrInsert(
                ['id' => $city['id']],
                [
                    'name' => $city['name'],
                    'district_id' => $city['district_id'],
                ]
            );
        }

        // Postgres doesn't auto-advance the id sequence when you insert
        // explicit IDs — without this, the next city created through
        // Eloquent would collide with id 41+ and throw a duplicate key error.
        DB::statement("SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities))");

        $this->command->info('Seeded 12 missing Perak cities (ids 41-52).');
    }
}