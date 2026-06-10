<?php
/**
 * Šis modelis nodrošina pasākuma apmeklēšanas reakciju glabāšanu.
 * Tas satur divas galvenās funkcijas:
 * - event(): Atgriež pasākumu, kuram reakcija ir piesaistīta.
 * - user(): Atgriež lietotāju, kurš atzīmēja dalību pasākumā.
 */

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
