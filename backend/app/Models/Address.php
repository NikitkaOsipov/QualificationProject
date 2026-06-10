<?php
/**
 * Šis modelis nodrošina adrešu datu glabāšanu un saistību ar pasākumiem.
 * Tas satur galveno funkciju:
 * - events(): Atgriež ar šo adresi saistītos pasākumus.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;
    //
    protected $fillable = [
        'lat',
        'lng',
        'name',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function events() {
        return $this->hasMany(Event::class);
    }
}
