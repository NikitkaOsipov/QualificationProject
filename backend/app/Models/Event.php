<?php

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
        'lat', // NEXT TIME FIND out how you save lat and lng as it is saved somewhere else in db
        'lng',
        'user_id',
        'address_id',
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
        return $this->belongsTo(Address::class);
    }
}
