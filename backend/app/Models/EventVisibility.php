<?php

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
