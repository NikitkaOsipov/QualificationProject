<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Music & Concerts',
            'Sports',
            'Technology',
            'Business & Networking',
            'Art & Design',
            'Food & Drink',
            'Travel & Adventure',
            'Health & Fitness',
            'Gaming',
            'Education & Learning',
            'Charity & Causes',
            'Entertainment',
            'Fashion & Beauty',
            'Film & Theater',
            'Literature & Writing',
            'Comedy',
            'Dance & Movement',
            'Family Friendly',
            'Photography',
            'Workshops & Classes',
            'Party & Nightlife',
            'Community',
            'Outdoor Activities',
            'Wellness & Meditation',
            'Automotive',
            'Real Estate & Investment',
            'Wedding & Events',
            'Hobbies & Crafts',
            'Science',
            'Historical',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }
    }
}

