<?php
/**
 * Šis modelis nodrošina pasākumu datu glabāšanu, saites ar citām entītijām un dalībnieku attiecību iegūšanu.
 * Tas satur desmit galvenās funkcijas:
 * - getLatAttribute(): Atgriež pasākuma platumu no saistītās adreses.
 * - address(): Atgriež ar pasākumu saistīto adresi.
 * - comments(): Atgriež pasākuma komentārus.
 * - user(): Atgriež pasākuma autoru.
 * - interestedUsersCount(): Atgriež interesentu skaitu.
 * - interestedUsers(): Atgriež interesentu attiecību ierakstus.
 * - goingUsersCount(): Atgriež apmeklētāju skaitu.
 * - goingUsers(): Atgriež apmeklētāju attiecību ierakstus.
 * - categories(): Atgriež pasākumam piešķirtās kategorijas.
 * - visibility(): Atgriež pasākuma redzamības tipu.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'price' ,
        'background_image_path',
        'lat',
        'lng',
        'user_id',
        'address_id',
        'event_visibility_id',
    ];

    public function getLatAttribute()
    {
        return $this->address?->lat;
    }

    public function address() {
        return $this->belongsTo(Address::class);
    }

    public function comments() {
        return $this->hasmany(Comment::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function interestedUsersCount()
    {
        return $this->hasMany(EventInterested::class)->count();
    }

    public function interestedUsers()
    {
        return $this->hasMany(EventInterested::class);
    }

    public function goingUsersCount()
    {
        return $this->hasMany(EventGoing::class)->count();
    }

    public function goingUsers()
    {
        return $this->hasMany(EventGoing::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'event_category_mappings', 'event_id', 'category_id');
    }

    public function visibility()
    {
        return $this->belongsTo(EventVisibility::class, 'event_visibility_id');
    }
}
