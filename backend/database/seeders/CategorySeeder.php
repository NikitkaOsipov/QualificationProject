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
            'Muzika un koncerti',
            'Sports',
            'Tehnoloģijas',
            'Bizness un tīklošanās',
            'Māksla un dizains',
            'Ēdiens un dzērieni',
            'Ceļošana un piedzīvojumi',
            'Veselība un fitness',
            'Spēles',
            'Izglītība un mācības',
            'Labdarība un sabiedriskas iniciatīvas',
            'Izklaide',
            'Mode un skaistums',
            'Filma un teātris',
            'Literatūra un rakstīšana',
            'Komēdija',
            'Deja un kustība',
            'Ģimenēm draudzīgi',
            'Fotogrāfija',
            'Darbnīcas un nodarbības',
            'Ballītes un naktsdzīve',
            'Kopiena',
            'Aktivitātes brīvā dabā',
            'Labsajūta un meditācija',
            'Auto pasaule',
            'Nekustamais īpašums un investīcijas',
            'Kāzas un pasākumi',
            'Hobiji un rokdarbi',
            'Zinātne',
            'Vēsture',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }
    }
}

