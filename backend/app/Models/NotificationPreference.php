<?php
/**
 * Šis modelis nodrošina lietotāja paziņojumu iestatījumu glabāšanu.
 * Tas satur galveno funkciju:
 * - user(): Atgriež lietotāju, kuram pieder konkrētais paziņojumu iestatījums.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'in_app_enabled',
        'email_enabled',
    ];

    protected function casts()
    {
        return [
            'in_app_enabled' => 'boolean',
            'email_enabled' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
