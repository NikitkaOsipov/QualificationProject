<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'text',
        'user_id',
        'event_id',
    ];

    public function user() {
        return $this->belongsTo(Address::class);
    }

    public function event() {
        return $this->belongsTo(Event::class);
    }
}
