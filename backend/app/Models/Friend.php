<?php
/**
 * Šis modelis nodrošina draudzības attiecību glabāšanu un pārvaldību starp lietotājiem.
 * Tas satur divas galvenās funkcijas:
 * - areFriends(): Pārbauda, vai divi lietotāji ir draugi.
 * - removeFriendship(): Noņem draudzības ierakstu starp diviem lietotājiem.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Friend extends Model
{
    protected $fillable = ['user1_id', 'user2_id'];

    public static function areFriends(int $a, int $b): bool
    {
        return self::where(function ($q) use ($a, $b) {
            $q->where('user1_id', $a)->where('user2_id', $b);
        })->orWhere(function ($q) use ($a, $b) {
            $q->where('user1_id', $b)->where('user2_id', $a);
        })->exists();
    }

    public static function removeFriendship(int $a, int $b): void
    {
        self::where(function ($q) use ($a, $b) {
            $q->where('user1_id', $a)->where('user2_id', $b);
        })->orWhere(function ($q) use ($a, $b) {
            $q->where('user1_id', $b)->where('user2_id', $a);
        })->delete();
    }
}
