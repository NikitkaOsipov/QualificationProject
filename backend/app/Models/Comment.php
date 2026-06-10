<?php
/**
 * Šis modelis nodrošina komentāru datu glabāšanu un saiknes ar lietotājiem un pasākumiem.
 * Tas satur divas galvenās funkcijas:
 * - user(): Atgriež lietotāju, kurš izveidoja komentāru.
 * - event(): Atgriež pasākumu, pie kura komentārs ir pievienots.
 */

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
        return $this->belongsTo(User::class);
    }

    public function event() {
        return $this->belongsTo(Event::class);
    }
}
