<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventGoing extends Model
{
    protected $table = 'event_reactions_going';

    protected $fillable = [
        'event_id',
        'user_id',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
