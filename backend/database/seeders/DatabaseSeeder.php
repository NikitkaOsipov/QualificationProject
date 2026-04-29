<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Test User 2',
            'email' => 'test2@example.com',
        ]);
        User::factory()->create([
            'name' => 'Test User 3',
            'email' => 'test3@example.com',
        ]);
        User::factory()->create([
            'name' => 'Test User 4',
            'email' => 'test4@example.com',
        ]);
        User::factory()->create([
            'name' => 'Nikita',
            'email' => 'no.accenture.bootcamp@gmail.com',
            'role' => 'admin',
        ]);

        collect(range(1, 20))->each(function (int $index) {
            User::factory()->create([
                'name' => sprintf('Demo User %02d', $index),
                'email' => sprintf('demo.user%02d@example.com', $index),
            ]);
        });

        $this->call(CategorySeeder::class);
        $this->call(EventVisibilitySeeder::class);
        $this->call(EventSeeder::class);
    }
}
