<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    //
    protected $fillable = [
        'latitude',
        'longitude',
        'name',
    ];

    public function events() {
        return $this->hasMany(Event::class);
    }
}
