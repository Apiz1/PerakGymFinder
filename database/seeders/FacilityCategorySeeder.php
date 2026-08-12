<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilityCategorySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            'Parking' => '🅿️',
            'Shower' => '🚿',
            'Locker Room' => '🔒',
            'Sauna' => '🧖',
            'Air Conditioning' => '❄️',
            'Personal Trainer' => '🏋️',
            'Free Weights' => '🏋️‍♂️',
            'Cardio Machines' => '🏃',
            'Group Classes' => '👥',
            'WiFi' => '📶',
            'Prayer Room' => '🕌',
            '24 Hours' => '🕐',
        ];

        foreach ($facilities as $name => $icon) {
            Facility::updateOrCreate(['name' => $name], ['icon' => $icon]);
        }

        $categories = [
            'Gym & Fitness',
            'CrossFit',
            'Yoga',
            'Muay Thai',
            'Boxing',
            'Swimming',
            'Martial Arts',
            'Pilates',
            'Zumba / Dance Fitness',
            'Powerlifting',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(['name' => $name]);
        }
    }
}