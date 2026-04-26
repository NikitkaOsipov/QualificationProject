<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'address' => [
                'name' => $this->address?->name,
                'lat' => $this->address?->lat,
                'lng' => $this->address?->lng,
            ],
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ],
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'price' => $this->price,
            'description' => $this->description,
            'background_image_path' => $this->background_image_path,
            'event_access_type_id' => $this->event_access_type_id,
            'event_type_id' => $this->event_type_id,
            'event_visibility_id' => $this->event_visibility_id,
            'visibility' => $this->visibility?->name,
            'going_count' => $this->going_users_count ?? 0,
            'interested_count' => $this->interested_users_count ?? 0,
            'categories' => $this->categories
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                ])
                ->values(),
            'holiday_id' => $this->holiday_id,
            'updated_at' => $this->updated_at,
        ];
    }
}
