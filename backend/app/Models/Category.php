<?php
/**
 * Šis modelis nodrošina pasākumu kategoriju datu glabāšanu un saistību pārvaldību.
 * Tas satur galveno funkciju:
 * - events(): Atgriež pasākumus, kas piesaistīti šai kategorijai.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'event_categories';

    protected $fillable = [
        'name',
    ];

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_category_mappings', 'category_id', 'event_id');
    }
}

