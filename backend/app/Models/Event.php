<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
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
    ];
}
