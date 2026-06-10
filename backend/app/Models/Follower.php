<?php
/**
 * Šis modelis nodrošina sekošanas attiecību datu glabāšanu starp lietotājiem.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    protected $fillable = [
        'follower_id',
        'target_id',
    ];
}
