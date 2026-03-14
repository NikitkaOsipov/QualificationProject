<?php

namespace Database\Factories;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start_date = Carbon::instance(
            fake()->dateTimeBetween('+1 days', '+1 month')
        );
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'start_date' => $start_date,
            'price' => fake()->randomElement([0, 5, 10, 20]),
            'user_id' => 1,
            'end_date' => $start_date->copy()->addDays(1),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
