<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\District;
use App\Models\State;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Seeds Perak state, its 12 official districts, and major towns/cities
     * within each — this is what powers the state -> district -> city
     * dropdown chain on the "register your gym" and search filter forms.
     */
    public function run(): void
    {
        $perak = State::updateOrCreate(
            ['slug' => 'perak'],
            ['name' => 'Perak']
        );

        $districts = [
            'Kinta' => ['Ipoh', 'Batu Gajah', 'Chemor', 'Simpang Pulai', 'Tanjung Rambutan'],
            'Batang Padang' => ['Tapah', 'Bidor', 'Sungkai', 'Chenderiang'],
            'Kampar' => ['Kampar', 'Gopeng', 'Malim Nawar'],
            'Kerian' => ['Parit Buntar', 'Bagan Serai', 'Tanjung Piandang'],
            'Larut, Matang dan Selama' => ['Taiping', 'Kamunting', 'Selama', 'Matang'],
            'Manjung' => ['Seri Manjung', 'Sitiawan', 'Lumut', 'Pangkor'],
            'Kuala Kangsar' => ['Kuala Kangsar', 'Sungai Siput', 'Padang Rengas'],
            'Hilir Perak' => ['Teluk Intan', 'Selekoh'],
            'Hulu Perak' => ['Gerik', 'Lenggong', 'Pengkalan Hulu'],
            'Bagan Datuk' => ['Bagan Datuk', 'Hutan Melintang'],
            'Muallim' => ['Tanjung Malim', 'Behrang', 'Slim River'],
            'Perak Tengah' => ['Seri Iskandar', 'Parit', 'Bota', 'Kampung Gajah'],
        ];

        foreach ($districts as $districtName => $cities) {
            $district = District::updateOrCreate(
                ['state_id' => $perak->id, 'name' => $districtName],
            );

            foreach ($cities as $cityName) {
                City::updateOrCreate([
                    'district_id' => $district->id,
                    'name' => $cityName,
                ]);
            }
        }
    }
}