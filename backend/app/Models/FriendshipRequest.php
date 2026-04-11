<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FriendshipRequest extends Model
{
    protected $fillable = ['user_id', 'receiver_id', 'status'];

    public static function getPending(int $senderId, int $receiverId): ?self
    {
        return self::where('user_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->where('status', 'pending')
            ->first();
    }

    // Returns pending request in either direction
    public static function getBetween(int $a, int $b): ?self
    {
        return self::where(function ($q) use ($a, $b) {
            $q->where('user_id', $a)->where('receiver_id', $b);
        })->orWhere(function ($q) use ($a, $b) {
            $q->where('user_id', $b)->where('receiver_id', $a);
        })->where('status', 'pending')->first();
    }
}
