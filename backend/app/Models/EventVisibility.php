<?php
/**
 * Šis modelis nodrošina pasākumu redzamības tipu glabāšanu.
 * Tas satur galveno funkciju:
 * - events(): Atgriež pasākumus ar konkrēto redzamības tipu.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventVisibility extends Model
{
    protected $fillable = ['name'];

    public function events()
    {
        return $this->hasMany(Event::class, 'event_visibility_id');
    }
}
