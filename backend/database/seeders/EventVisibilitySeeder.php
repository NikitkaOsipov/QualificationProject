<?php

namespace Database\Seeders;

use App\Models\EventVisibility;
use Illuminate\Database\Seeder;

class EventVisibilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $visibilities = ['public', 'private', 'friends_only'];

        foreach ($visibilities as $visibility) {
            EventVisibility::firstOrCreate(['name' => $visibility]);
        }
    }
}
